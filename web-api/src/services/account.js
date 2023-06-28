const _ = require('lodash');
const Bcrypt = require('bcrypt');
const Boom = require('@hapi/boom');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const moment = require('moment');
const speakeasy = require('speakeasy');
const Joi = require('@hapi/joi');
const config = require('../../config');
const { generateCode } = require('../utils/utils-func');
const {
  generateJWT,
  validateTwoFACode,
} = require('../services/security');
const CONSTANT = require('../utils/constant');
const PERMISSIONS = require('../utils/permissions');
const UserSchema = require('../models/user');
const AppConfigSchema = require('../models/app-config');
const UsernameSuggestionSchema = require('../models/username-suggestion');
const appConfigService = require('../services/app-config');
const utils = require('../utils/utils-func');
const userUtils = require('../utils/user');
const logger = require('../utils/logger');
const roleService = require('./role');
const cacheService = require('./cache');
const ERROR_CODES = require('../utils/error-code');
const usersMemCacheService = require('../services/users-mem-cache');

const LOGGED_EMAIL_TYPES = {
  IP: 'ip',
  DEVICE: 'device',
};

const emailAxios = axios.create({
  baseURL: config.email_service.uri,
  headers: {
    'Content-Type': 'application/json',
    'API-TOKEN': config.email_service.api_token,
  },
});

/**
 *
 * @param {*} params
 * {
 *  emailOrUsername: string,
 *  password: string,
 *  twoFACode: string,
 *  clientInfo: object,
 *  isVerifyRequired: boolean
 * }
 */
async function login(params) {
  const { emailOrUsername, password, twoFACode, clientInfo, isVerifyRequired } = params;

  let user = await UserSchema.findOne()
    .or([{ email: emailOrUsername }, { username: emailOrUsername }])
    .orFail(Boom.notFound(ERROR_CODES.INVALID_CREDENTIAL))
    .lean({ getters: true })
    .exec();

  if (user.banned || user.closedAt) {
    throw Boom.notFound(ERROR_CODES.INVALID_CREDENTIAL);
  }

  const isLastFailedNotTimeout = (lastFailedAt, lockTimeout) => {
    return moment().diff(moment(lastFailedAt), 'minutes') < lockTimeout;
  };

  const checkLoginFailedAttempts = async () => {
    const loginAttemptsConfig = await appConfigService.getAppConfigByKey(CONSTANT.KEY_CONFIG.LOGIN_ATTEMPTS);
    let allowedFailedAttempts = 0;
    if (loginAttemptsConfig) allowedFailedAttempts = loginAttemptsConfig.attempts;

    const isReachedFailedAttempts =
      allowedFailedAttempts > 0 && user.loginFailed && user.loginFailed.loginAttempts >= allowedFailedAttempts;
    if (isReachedFailedAttempts) {
      if (isLastFailedNotTimeout(user.loginFailed.lastFailedAt, loginAttemptsConfig.lockTimeout)) {
        throw Boom.notFound(ERROR_CODES.INVALID_LOGIN_ATTEMPTS, {
          lockTimeout: loginAttemptsConfig.lockTimeout,
          attempts: allowedFailedAttempts,
        });
      }
    }

    return {
      allowedFailedAttempts,
      lockTimeout: loginAttemptsConfig ? loginAttemptsConfig.lockTimeout : 0,
    };
  };

  const { allowedFailedAttempts, lockTimeout } = await checkLoginFailedAttempts();

  if (isVerifyRequired) {
    if (!Bcrypt.compareSync(password, user.password)) {
      if (allowedFailedAttempts > 0) {
        let attempt = 1;
        if (user.loginFailed) {
          if (isLastFailedNotTimeout(user.loginFailed.lastFailedAt, lockTimeout)) {
            attempt = user.loginFailed.loginAttempts + 1;
          }
        }

        const updatedUser = await UserSchema.findOneAndUpdate(
          { _id: user._id },
          {
            $set: {
              'loginFailed.lastIpAddress': clientInfo.ipAddress,
              'loginFailed.lastFailedAt': new Date(),
              'loginFailed.loginAttempts': attempt,
            },
          },
          { new: true },
        );

        if (updatedUser.loginFailed.loginAttempts >= allowedFailedAttempts) {
          throw Boom.notFound(ERROR_CODES.INVALID_LOGIN_ATTEMPTS, {
            lockTimeout,
            attempts: allowedFailedAttempts,
          });
        } else {
          throw Boom.notFound(ERROR_CODES.INVALID_CREDENTIAL, {
            loginAttempts: allowedFailedAttempts - updatedUser.loginFailed.loginAttempts,
          });
        }
      } else {
        throw Boom.notFound(ERROR_CODES.INVALID_CREDENTIAL);
      }
    } else if (!user.activated && user.code) {
      resendActivationCode(user.email);
      throw Boom.badRequest(ERROR_CODES.ACCOUNT_NOT_ACTIVATED);
    } else if (!userUtils.isActiveUser(user)) {
      throw Boom.badRequest(ERROR_CODES.ACCOUNT_IS_DEACTIVATED);
    }
  }

  if (user.isTwoFA) {
    if (twoFACode === '') {
      throw Boom.notAcceptable(ERROR_CODES.REQUIRED_2FA);
    }
    validateTwoFACode(user.twoFAKey, twoFACode);
  }

  const loggedInfo = user.loggedInfo;
  const lastIpAddress = user.lastLoggedIP;
  const lastDevice = user.lastLoggedDevice;
  user = await saveLastLoginInfo(user._id, {
    ipAddress: clientInfo.ipAddress,
    device: clientInfo.device,
    lastLoginAt: new Date(),
  });

  if (
    user.shouldSendMailForChangedIpOrDevice &&
    (clientInfo.ipAddress !== lastIpAddress || clientInfo.device !== lastDevice)
  ) {
    const type =
      clientInfo.ipAddress !== lastIpAddress
        ? LOGGED_EMAIL_TYPES.IP
        : clientInfo.device !== lastDevice
        ? LOGGED_EMAIL_TYPES.DEVICE
        : '';
    await sendMailForLoggedActivity(type, user, clientInfo);
  } else {
    let emailType;
    if (loggedInfo.length > 0) {
      emailType = !_.find(loggedInfo, { ip: clientInfo.ipAddress })
        ? LOGGED_EMAIL_TYPES.IP
        : !_.find(loggedInfo, { device: clientInfo.device })
        ? LOGGED_EMAIL_TYPES.DEVICE
        : '';
    }
    if (emailType) {
      await sendMailForLoggedActivity(emailType, user, clientInfo);
    }
  }

  const clientUser = await toClientUser(user, isVerifyRequired);
  return clientUser;
}

async function toClientUser(user, isVerifyRequired) {

  await augmentRolesAndPermissions(user);
  user.token = generateJWT(user);
  user.expiredDate = new Date().getTime() + CONSTANT.JWT_EXPIRED_PERIOD;
  user.lastLoginAt = new Date();
  user.isFromThirdParty = !isVerifyRequired;

  removeUserConfidentialInfo(user);

  return user;
}
async function sendMailForLoggedActivity(mailType, user, clientInfo) {
  if (mailType !== '') {
    try {
      await sendNewLoggedInfoEmail(
        user,
        {
          device: clientInfo.device,
          time: `${moment.utc(user.lastLoginAt).format(`${CONSTANT.DATE_FORMAT.LONG} Z`)}`,
          ipAddress: clientInfo.ipAddress,
        },
        mailType === 'ip',
      );
    } catch (err) {
      logger.error('Send mail error:', err);
    }
  }
}
async function saveLastLoginInfo(userId, lastLoginInfo) {
  return UserSchema.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        lastLoggedIP: lastLoginInfo.ipAddress,
        lastLoginAt: lastLoginInfo.lastLoginAt,
        lastLoggedDevice: lastLoginInfo.device,
        loginFailed: {
          loginAttempts: 0,
          lastIpAddress: null,
          lastFailedAt: null,
        },
      },
      $addToSet: {
        loggedInfo: {
          ip: lastLoginInfo.ipAddress,
          device: lastLoginInfo.device,
        },
      },
    },
  ).lean({ getters: true });
}

async function loginWithSocial(email, twoFACode, clientInfo) {
  return login({
    emailOrUsername: email,
    password: null,
    twoFACode,
    clientInfo,
    isVerifyRequired: false,
  });
}
async function verifyRegistrationEmail(email) {
  const user = await UserSchema.findUser().byEmail(email);
  if (user) {
    throw Boom.conflict(ERROR_CODES.REGISTERED_EMAIL);
  }
  return true;
}
async function getUserName(email) {
  let username = email.indexOf('@') >= 0 ? email.substring(0, email.indexOf('@')) : email;
  const user = await UserSchema.findUser().byUsername(username).lean({ getters: true }).exec();
  if (user) {
    username += `_${new Date().getTime()}`;
  }
  return username;
}

async function register(data) {
  const {
    firstName,
    lastName,
    email,
    password,
    activated,
    createBySystem,
    createdByHook,
    source,
    clientInfo,
    acceptTermsAt,
    isChef,
  } = data;
  const existedUser = await UserSchema.findUser().byEmail(email);
  if (existedUser) {
    throw Boom.conflict(ERROR_CODES.ACCOUNT_EXISTED);
  }

  const code = utils.generateCode(7);
  let user;
  try {
    let roles = [];

    const userRole = await roleService.getRoleByName(CONSTANT.PERMISSIONS.USER);
    const chefRole = await roleService.getRoleByName(CONSTANT.PERMISSIONS.CHEF);

    if (userRole) {
      roles.push(userRole._id.toString())
    }

    if (isChef) {
      if (chefRole) {
        roles.push(chefRole._id.toString())
      }
    }

    user = await new UserSchema({
      firstName,
      lastName,
      email,
      username: await getUserName(email),
      password: await Bcrypt.hash(password, 2),
      roles: roles,
      code,
      activated: activated !== undefined ? activated : createBySystem,
      createdByHook: !!createdByHook,
      source,
      ipAddress: clientInfo.ipAddress,
      acceptTermsAt: acceptTermsAt ? new Date(acceptTermsAt) : null,
    }).save();

    let needToSendActivationEmail = true;
    if (createBySystem && activated) {
      needToSendActivationEmail = false;
      user = await activateAccountByCode(code, clientInfo, createBySystem);
    }

    if (needToSendActivationEmail) {
      sendActivationEmail({
        username: user.username,
        email,
        code,
      });
    }

    return user;
  } catch (err) {
    logger.error(err);
    // Remove user in mongo
    if (user) {
      await UserSchema.deleteOne({ _id: user._id });
    }
    if (err.isBoom && !err.isServer) {
      throw err;
    } else {
      throw Boom.badImplementation();
    }
  }
}

async function registerSingleSignIn(
  email,
  country,
  clientInfo,
  acceptTermsAt,
  acceptAgreementAt,
) {
  if (!email) throw Boom.badData(ERROR_CODES.INVALID_EMAIL);

  const password = generateCode(10);

  await register({
    email,
    password,
    country,
    activated: true,
    createBySystem: true,
    clientInfo,
    acceptTermsAt,
    acceptAgreementAt,
  });
  const response = await login({
    emailOrUsername: email,
    password: password,
    twoFACode: '',
    clientInfo,
    isVerifyRequired: true,
  });
  if (response) {
    return response;
  } else {
    throw Boom.badRequest(ERROR_CODES.CAN_NOT_CREATE_ACCOUNT_FOR_EMAIL, { email });
  }
}

async function sendActivationEmail(data) {
  const webAccessCodeQuery = CONSTANT.WEBPAGE_ACCESS_CODE !== '' ? `?code=${CONSTANT.WEBPAGE_ACCESS_CODE}` : '';

  const activationLink = `${config.external.web}/activate-account/${data.code}/${webAccessCodeQuery}`;

  // Call email service
    await emailAxios.post(`/email`, {
    to_email: data.email,
    subject: 'Home Made Inn - Activate Account',
    content: `Dear, ${data.username}<br><br>
    In order to start using your account, please confirm your email address.<br><br>
    <a href='${activationLink}'></a>${activationLink}<br>
    <i>If you did not sign up for this account, you can ignore this email and the account will be deleted.</i><br><br>
    Best Regards,<br><br>
    Home Made Inn`,
  });
}
async function sendNewLoggedInfoEmail(user, emailData, isNewIp) {
  // Call email service
}


async function sendBannedEmailByUserId(userId, reason) {
  const user = await UserSchema.findById(userId).select('email username').lean({ getters: true }).exec();

  // Call email service
}
async function activateAccountByCode(code, clientInfo, isCreatedBySystem = false) {
  const user = await UserSchema.findUser()
    .byActivationCode(code)
    .byActivated(isCreatedBySystem)
    .errorOnNotFound(ERROR_CODES.INVALID_ACTIVATION_CODE)
    .lean({ getters: true })
    .exec();

  user.roles = await roleService.getRolesByIds(user.roles);

  const updateObj = {
    code: null,
    activated: true,
    activatedAt: new Date(),
    lastLoggedIP: clientInfo.ipAddress,
    lastLoggedDevice: clientInfo.device,
    lastLoginAt: new Date(),
    loginFailed: {
      loginAttempts: 0,
      lastIpAddress: null,
      lastFailedAt: null,
    },
  };

  await UserSchema.findOneAndUpdate(
    { _id: user._id },
    {
      $set: updateObj,
    },
  );

  usersMemCacheService.loadUsers([user._id]);

  Object.assign(user, updateObj);

  const clientUser = await toClientUser(user);
  return clientUser;
}


async function resendActivationCode(email) {
  const user = await UserSchema.findOne()
    .byEmail(email)
    .errorOnNotFound(ERROR_CODES.ACCOUNT_NOT_FOUND_CHECK_EMAIL)
    .exec();
  if (!user.code) {
    throw Boom.badRequest(ERROR_CODES.ACCOUNT_ALREADY_ACTIVATED);
  }
  const code = utils.generateCode(7);
  user.code = code;
  await user.save();
  sendActivationEmail({
    username: user.username,
    email,
    code,
  });
  return true;
}


async function getUserStatistic(filter) {
  let users = [];

  const dbProjectedFields = {
    username: 1,
    email: 1,
    createdAt: 1,
    country: 1,
    ipAddress: 1,
    lastLoggedIP: 1,
    activated: 1,
    type: 1,
    roles: 1,
    banned: 1,
    bannedAt: 1,
    bannedReason: 1,
    closedAt: 1,
    closedReason: 1,
  };

  let createdDateFrom, createdDateTo, closedDateFrom, closedDateTo;
  if (filter.from && filter.to) {
    const fromDate = moment.utc(Number(filter.from));
    const toDate = moment.utc(Number(filter.to));

    if (!fromDate.isValid() || !toDate.isValid()) {
      throw Boom.badRequest(ERROR_CODES.INVALID_DATE_RANGE);
    }
    if (_.includes(filter.accountStatus, CONSTANT.USER_STATUS.CLOSED)) {
      closedDateFrom = fromDate;
      closedDateTo = toDate;
    } else {
      createdDateFrom = fromDate;
      createdDateTo = toDate;
    }
  }
  // Parse string to boolean
  filter.paging = filter.paging === 'true';
  let total = Number(filter.total);

  // Ignore filter by date range when filter by user id
  if (!_.isEmpty(filter.userSearchText)) {
    createdDateFrom = null;
    createdDateTo = null;
    closedDateFrom = null;
    closedDateTo = null;
    const users = usersMemCacheService.searchUsersByText(filter.userSearchText, undefined, ['_id']);
    filter.userIds = _.uniq(users.map((user) => user._id));

    if (_.isEmpty(filter.userIds)) {
      return { users, total: 0 };
    }
  }

  const sort = {};

  if (filter.sortField) {
      if (total < 0 && filter.paging) {
        total = await countUserWithFilter(filter, createdDateFrom, createdDateTo, closedDateFrom, closedDateTo);
      }
      if (filter.sortField === 'status') {
        sort.activated = Number(filter.sortOrder);
        sort.banned = Number(filter.sortOrder);
      } else {
        sort[filter.sortField] = Number(filter.sortOrder);
      }

      if (filter.paging) {
        users = await UserSchema.find({}, dbProjectedFields)
          .byIds(filter.userIds)
          .byCreatedDateRange(createdDateFrom, createdDateTo)
          .byClosedDateRange(closedDateFrom, closedDateTo)
          .byStatus(filter.accountStatus)
          .byRoles(typeof filter.roles === 'string' ? [filter.roles] : filter.roles)
          .sort(sort)
          .limit(Number(filter.recordsPerPage))
          .skip(Number(filter.first))
          .lean({ getters: true });
      } else {
        users = await UserSchema.find({}, dbProjectedFields)
          .byIds(filter.userIds)
          .byCreatedDateRange(createdDateFrom, createdDateTo)
          .byClosedDateRange(closedDateFrom, closedDateTo)
          .byStatus(filter.accountStatus)
          .byRoles(typeof filter.roles === 'string' ? [filter.roles] : filter.roles)
          .sort(sort)
          .lean({ getters: true });
      }
  }

  users = await Promise.all(
    users.map(async (user) => {
      const returnedValue = {
        _id: user._id,
        email: user.email,
      };
      filter.columns.forEach((column) => {
        returnedValue[column] = user[column]
      });
      if (user.closedAt) {
        returnedValue.status = CONSTANT.USER_STATUS.CLOSED;
        returnedValue.closedAt = user.closedAt;
        returnedValue.closedReason = user.closedReason;
      } else if (user.banned) {
        returnedValue.status = CONSTANT.USER_STATUS.BANNED;
        returnedValue.bannedAt = user.bannedAt;
        returnedValue.bannedReason = user.bannedReason;
      } else {
        returnedValue.status = user.activated ? CONSTANT.USER_STATUS.ACTIVATED : CONSTANT.USER_STATUS.UNACTIVATED;
      }

      return returnedValue;
    }),
  );

  return { users, total };
}

function countUserWithFilter(filter, createdDateFrom, createdDateTo, closedDateFrom, closedDateTo) {
  return UserSchema.find({}, {})
    .byIds(filter.userIds)
    .byCreatedDateRange(createdDateFrom, createdDateTo)
    .byClosedDateRange(closedDateFrom, closedDateTo)
    .byStatus(filter.accountStatus)
    .byRoles(typeof filter.roles === 'string' ? [filter.roles] : filter.roles)
    .countDocuments();
}

async function sendForgotPasswordEmail(email) {
  const user = await UserSchema.findUser().byEmail(email).errorOnNotFound(ERROR_CODES.ACCOUNT_NOT_EXIST);

  const token = uuidv4();
  user.fwToken = token;
  await user.save();

  let name = user.username;
  if ( user.firstName && user.firstName != '' && user.lastName && user.lastName != '') {
    name = `${user.firstName} ${user.lastName}`;
  }

  await emailAxios.post(`/email`, {
    to_email: email,
    subject: 'Home Made Inn - Reset Password',
    content: `Dear, ${name}<br><br>
    The following is the link to reset your password, please click to reset your new password:<br><br>
    ${config.external.web}/reset-password?token=${token}<br><br>
    ---<br><br>
    Have a nice day!<br><br>
    Home Made Inn`,
  });

  // Call email service
  return true;
}

async function getEmailFromForgotPasswordToken(token) {
  const user = await UserSchema.findUser().byFwToken(token).errorOnNotFound(ERROR_CODES.INVALID_TOKEN);
  return user.email;
}

async function changePassword(token, password) {
  const user = await UserSchema.findOne().byFwToken(token).errorOnNotFound(ERROR_CODES.INVALID_TOKEN);
  user.fwToken = null;
  user.loginFailed = {
    loginAttempts: 0,
    lastIpAddress: null,
    lastFailedAt: null,
  };
  user.password = await Bcrypt.hash(password, 2);
  await user.save();
  return user;
}

async function updatePassword(userId, oldPassword, newPassword, twoFACode) {
  const user = await UserSchema.findById(userId).errorOnNotFound();

  if (user.isTwoFA) {
    validateTwoFACode(user.twoFAKey, twoFACode);
  }

  if (!Bcrypt.compareSync(oldPassword, user.password)) {
    throw Boom.badData(ERROR_CODES.INVALID_OLD_PASSWORD);
  }
  user.password = await Bcrypt.hash(newPassword, 2);
  await user.save();
  return user;
}

async function updateProfileImage(userId, file) {
  const user = await UserSchema.findById(userId).errorOnNotFound();
  const newImage = await uploadService.detectAndUploadFile(userId, file);
  if (user.profileImage) {
    const n = user.profileImage.indexOf('com/');
    const key = user.profileImage.substr(n + 4);
  }
  user.profileImage = newImage;
  await user.save();
  return user.profileImage;
}
async function updateUsername(userId, username) {
  const user = await UserSchema.findById(userId);
  if (
    user.updatedUsernameAt &&
    moment(user.updatedUsernameAt).utcOffset(CONSTANT.DEFAULT_TIMEZONE.MINUTES).day() ===
      moment().utcOffset(CONSTANT.DEFAULT_TIMEZONE.MINUTES).day()
  ) {
    throw Boom.badRequest(ERROR_CODES.ALREADY_CHANGED_USER_ID);
  }

  const existedUser = await UserSchema.findUser().byIdNot(userId).byUsername(username);

  if (existedUser) {
    throw Boom.conflict(ERROR_CODES.ACCOUNT_EXISTED);
  }

  await UserSchema.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      $set: {
        username,
        updatedUsernameAt: new Date(),
      },
    },
    {
      new: true,
    },
  );
  usersMemCacheService.loadUsers([userId]);
  return username;
}

async function getSuggestUsername(currentUsername) {
  const usernameSuggestions = await UsernameSuggestionSchema.find().lean({ getters: true });
  let userIds = usernameSuggestions.map((usernameSuggestion) => {
    return `${currentUsername}${usernameSuggestion.value}`;
  });
  const userVerifieds = await UserSchema.find({
    username: { $in: userIds },
  }).lean({ getters: true });
  const userIdVerifieds = userVerifieds.map((userVerified) => {
    return userVerified.username;
  });
  userIds = userIds.filter((userId) => {
    return userIdVerifieds.indexOf(userId) < 0;
  });
  return userIds;
}

async function getAdmin() {
  const admin = await AppConfigSchema.findOne({
    key: CONSTANT.KEY_CONFIG.ADMIN_EMAIL,
  });
  if (admin && admin.value) {
    // eslint-disable-next-line no-return-await
    return await UserSchema.findOne({
      email: admin.value.email,
    }).lean({ getters: true });
  }
  return null;
}

async function verifyGoogleRecaptcha(token) {
  const { data } = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${config.google.recaptcha_secret}&response=${token}`,
  );
  if (!data.success) {
    throw Boom.badRequest(ERROR_CODES.INVALID_REQUEST);
  }
  return data;
}

async function generateGoogleTwoFAKey() {
  const secret = speakeasy.generateSecret({ length: 10 });
  return secret.base32;
}

async function storeGoogleTwoFAKey(userId, password, twoFAKey, twoFACode, isFromThirdParty = false) {
  validateTwoFACode(twoFAKey, twoFACode);

  const user = await UserSchema.findOne()
    .byId(userId)
    .byTwoFA(false)
    .select('_id email password')
    .errorOnNotFound(ERROR_CODES.INVALID_CREDENTIAL);

  if (!isFromThirdParty && !Bcrypt.compareSync(password, user.password)) {
    throw Boom.notFound(ERROR_CODES.INVALID_TWO_FA_PASSWORD);
  } else {
    await UserSchema.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          twoFAKey: twoFAKey,
          isTwoFA: true,
        },
      },
      {
        new: true,
      },
    );
    usersMemCacheService.loadUsers([userId]);
    return true;
  }
}

async function turnOffGoogleTwoFA(userId, twoFACode) {
  const isOK = await checkGoogleTwoFACode(userId, twoFACode);
  if (isOK) {
    await UserSchema.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          twoFAKey: null,
          isTwoFA: false,
        },
      },
      {
        new: true,
      },
    );
    usersMemCacheService.loadUsers([userId]);
  }
  return true;
}

async function checkGoogleTwoFACode(userId, twoFACode) {
  const user = await UserSchema.findOne()
    .byId(userId)
    .byTwoFA(true)
    .select('_id email password twoFAKey')
    .errorOnNotFound(ERROR_CODES.INVALID_CREDENTIAL);

  return validateTwoFACode(user.twoFAKey, twoFACode);
}

async function updateEmailSetting(userId, emailSetting) {
  const result = await UserSchema.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      $set: {
        shouldSendMailForChangedIpOrDevice: emailSetting.shouldSendMailForChangedIpOrDevice,
      },
    },
    {
      new: true,
    },
  );
  usersMemCacheService.loadUsers([userId]);
  return result;
}

async function setRoles(userId, roles) {
  const result = await UserSchema.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      $set: {
        roles: roles,
      },
    },
    {
      new: true,
    },
  );
  usersMemCacheService.loadUsers([userId]);
  return result;
}

async function augmentRolesAndPermissions(user) {
  // Use user type instead if user aren't set roles yet
  if (!user.roles || user.roles.length === 0) {
    return [user.type];
  }

  const userRoles = await roleService.getRolesByIds(user.roles);

  const allSupportedPermissions = Object.values(PERMISSIONS.API_PERMISSIONS).map((permission) => permission.value);

  let permissions = [];
  userRoles.forEach((role) => {
    permissions = permissions.concat(_.intersection(role.permissions, allSupportedPermissions));
  });

  user.roles = userRoles;
  user.permissions = _.uniq(permissions);
}

async function forceLogoutUser(userId) {
  return cacheService.deleteDataFromCache(`${cacheService.KEY_PREFIXS.USER_EXPIRATION}${userId}`);
}

async function forceLogoutUsers(userIds) {
  const users = await UserSchema.find().byIds(userIds).lean({ getters: true });
  users.forEach((user) => forceLogoutUser(user._id));
}

async function forceLogoutUsersHaveGivenRole(roleId) {
  const users = await UserSchema.find().byRoles([roleId]).lean({ getters: true });
  users.forEach((user) => forceLogoutUser(user._id));
}

async function banUsers({ userIds, reason }) {
  const banInfo = { banned: true, bannedAt: new Date(), bannedReason: reason };
  const bannedUsers = await UserSchema.updateMany({ _id: { $in: userIds } }, { $set: banInfo });
  usersMemCacheService.loadUsers(userIds);
  return bannedUsers;
}

async function revokeBanUsers({ userIds }) {
  const unbannedUsers = await UserSchema.updateMany({ _id: { $in: userIds } }, { $set: { banned: false } });
  usersMemCacheService.loadUsers(userIds);
  return unbannedUsers;
}

function validateRegistrationInfo(request) {
  const accountSchema = Joi.object().keys({
    password: Joi.string().min(6).max(50).required().error(new Error(ERROR_CODES.INVALID_PASSWORD)),
    email: Joi.string().min(6).max(50).regex(CONSTANT.EMAIL_REGEX).error(new Error(ERROR_CODES.INVALID_EMAIL)),
  });

  const { error } = accountSchema.validate(request.payload, {
    allowUnknown: true,
  });

  return error;
}

async function getUserDashboardDisplayedColumns(userId) {
  const user = await UserSchema.findById(userId);
  if (user && user.adminSetting.userDashboard.displayedColumns) {
    return user.adminSetting.userDashboard.displayedColumns;
  }
  return null;
}

async function setUserDashboardDisplayedColumns(userId, columns) {
  const user = await UserSchema.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      $set: {
        adminSetting: {
          userDashboard: { displayedColumns: columns },
        },
      },
    },
    {
      new: true,
    },
  );

  removeUserConfidentialInfo(user);
  return user;
}

function removeUser(email) {
  return UserSchema.deleteOne({ email });
}

function updateUserBiometric(userId, isBiometric) {
  return UserSchema.updateOne(
    {
      _id: userId,
    },
    {
      $set: {
        isBiometric,
      },
    },
  );
}

async function updateUserCountry(adminId, email, country) {
  const preState = await UserSchema.findUser().byEmail(email);
  const result = await UserSchema.updateOne({ email: email }, { $set: { country } });
  await AdminActivityService.saveAdminActivities(
    adminId,
    CONSTANT.TABLES.USERS,
    CONSTANT.ACTIVITIES.UPDATE,
    { country },
    { country: preState.country },
  );
  usersMemCacheService.loadUsers([preState._id]);
  await forceLogoutUser(preState._id);
  return result;
}

async function getSocial(userId) {
  const user = await UserSchema.findUser().byId(userId);
  removeSocialConfidentialInfo(user);

  return user.social || {};
}

async function unauthorizeSocial(userId, social) {
  const authorizedField = `social.${social}.authorized`;

  const user = await UserSchema.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        [authorizedField]: false,
      },
    },
    { new: true },
  );

  removeSocialConfidentialInfo(user);

  return user.social || {};
}

function removeSocialConfidentialInfo(user) {
  CONSTANT.SOCIALS.forEach((social) => {
    if (user.social && user.social[social]) {
      delete user.social[social].token;
      delete user.social[social].secret;
    }
  });
}

function removeUserConfidentialInfo(user) {
  delete user.password;
  delete user.twoFAKey;
  delete user.loggedInfo;
  delete user.lastLoggedDevice;
  delete user.lastLoggedIP;
  delete user.ipAddress;
  delete user.loginFailed;
  delete user.shouldSendMailForChangedIpOrDevice;
  delete user.social;
}

async function getAccountInfo(accountId) {
  const user = await UserSchema.findById(accountId);
  return user;
};

async function updateAccountInfo(userId, params) {
  const result = await UserSchema.updateOne(
    { _id: userId }, { $set: params }, { new: true },
  );
  usersMemCacheService.loadUsers(userId);
  return result;
};

module.exports = {
  activateAccountByCode,
  augmentRolesAndPermissions,
  banUsers,
  changePassword,
  checkGoogleTwoFACode,
  forceLogoutUser,
  forceLogoutUsers,
  forceLogoutUsersHaveGivenRole,
  generateGoogleTwoFAKey,
  getAdmin,
  getEmailFromForgotPasswordToken,
  getSocial,
  getSuggestUsername,
  getUserDashboardDisplayedColumns,
  login,
  loginWithSocial,
  register,
  registerSingleSignIn,
  removeUser,
  resendActivationCode,
  revokeBanUsers,
  getUserStatistic,
  sendBannedEmailByUserId,
  sendForgotPasswordEmail,
  setRoles,
  setUserDashboardDisplayedColumns,
  storeGoogleTwoFAKey,
  turnOffGoogleTwoFA,
  unauthorizeSocial,
  updateEmailSetting,
  updatePassword,
  updateProfileImage,
  updateUserBiometric,
  updateUserCountry,
  updateUsername,
  validateRegistrationInfo,
  verifyGoogleRecaptcha,
  verifyRegistrationEmail,
  getAccountInfo,
  updateAccountInfo
};
