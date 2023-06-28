'use strict';
const Boom = require('@hapi/boom');
const { v4: uuidv4 } = require('uuid');

const config = require('../../config');
const UtilsFunc = require('../utils/utils-func');
const accountService = require('../services/account');
const cacheService = require('../services/cache');
const ERROR_CODES = require('../utils/error-code');
const { KEY_PREFIXS } = require('../services/cache');
const UserSchema = require('../models/user');
const AppConfigSchema = require('../models/app-config');
const CONSTANT = require('../utils/constant');
const { getSocialSignInEmail } = require('../utils/utils-func');

const APIs = {
  LOGIN: '/social/login',
  MOBILE_SOCIAL_LOGIN: '/mobile/social/login',
  MOBILE_SOCIAL_REGISTER: '/mobile/social/register',
  REGISTER: '/social/register',
  FACEBOOK: '/social/login/facebook',
  GOOGLE: '/social/login/google',
  TWITTER: '/social/login/twitter',
  TWITTER_AUTHORIZATION: '/social/authorization/twitter',
  TELEGRAM_AUTHORIZATION: '/social/authorization/telegram',
};

const SOCIAL_LOGIN_CALLBACK = `${config.external.web}/login`;
const SOCIAL_AUTHORIZATION_CALLBACK = `${config.external.web}/account/settings`;
const SOCIAL_AUTHORIZATION_ADMIN_CALLBACK = `${config.external.web}/admin/social-setting`;

module.exports = {
  name: 'routes-social',
  version: '1.0.0',
  register: (server) => {
    // Social login
    server.route({
      method: 'POST',
      path: APIs.LOGIN,
      handler: async function (request) {
        const { token, twoFACode = '' } = request.payload;

        const email = await cacheService.getDataFromCache(`${KEY_PREFIXS.SOCIAL_LOGIN_SESSION}${token}`);
        if (email) {
          const clientInfo = UtilsFunc.getClientInfo(request);
          const user = await accountService.loginWithSocial(email, twoFACode, clientInfo);
          await cacheService.deleteDataFromCache(`${KEY_PREFIXS.SOCIAL_LOGIN_SESSION}${token}`);
          return user;
        } else {
          return Boom.badRequest(ERROR_CODES.SESSION_TIMEOUT);
        }
      },
    });

    // Social login for mobile
    server.route({
      method: 'POST',
      path: APIs.MOBILE_SOCIAL_LOGIN,
      handler: async function (request) {
        const { socialType, token, secret, twoFACode = '' } = request.payload;
        const email = await getSocialSignInEmail(socialType, token, secret);
        if (email) {
          const clientInfo = UtilsFunc.getClientInfo(request);
          return await accountService.loginWithSocial(email, twoFACode, clientInfo);
        } else {
          return Boom.badRequest(ERROR_CODES.SESSION_TIMEOUT);
        }
      },
    });

    // Social register
    server.route({
      method: 'POST',
      path: APIs.REGISTER,
      handler: async function (request) {
        const { token, country, acceptTermsAt, acceptAgreementAt } = request.payload;

        const email = await cacheService.getDataFromCache(`${KEY_PREFIXS.SOCIAL_LOGIN_SESSION}${token}`);
        if (email) {
          const clientInfo = UtilsFunc.getClientInfo(request);
          const user = await accountService.registerSingleSignIn(
            email,
            country,
            clientInfo,
            acceptTermsAt,
            acceptAgreementAt,
          );
          await cacheService.deleteDataFromCache(`${KEY_PREFIXS.SOCIAL_LOGIN_SESSION}${token}`);

          return user;
        } else {
          return Boom.badRequest(ERROR_CODES.SESSION_TIMEOUT);
        }
      },
    });

    // Social register for mobile
    server.route({
      method: 'POST',
      path: APIs.MOBILE_SOCIAL_REGISTER,
      handler: async function (request) {
        const {
          socialType,
          token,
          secret,
          country,
          acceptTermsAt,
          acceptAgreementAt,
        } = request.payload;
        const email = await getSocialSignInEmail(socialType, token, secret);
        if (email) {
          const clientInfo = UtilsFunc.getClientInfo(request);
          return await accountService.registerSingleSignIn(
            email,
            country,
            clientInfo,
            acceptTermsAt,
            acceptAgreementAt,
          );
        } else {
          return Boom.badRequest(ERROR_CODES.SESSION_TIMEOUT);
        }
      },
    });

    // facebook
    server.route({
      method: 'GET',
      path: APIs.FACEBOOK,
      config: {
        auth: {
          strategy: 'facebook',
          mode: 'try',
        },
      },
      handler: function (request, h) {
        return processSocialLogin(request, h);
      },
    });

    // google
    server.route({
      method: 'GET',
      path: APIs.GOOGLE,
      config: {
        auth: {
          strategy: 'google',
          mode: 'try',
        },
      },
      handler: function (request, h) {
        return processSocialLogin(request, h);
      },
    });

    // twitter
    server.route({
      method: 'GET',
      path: APIs.TWITTER,
      config: {
        auth: {
          strategy: 'twitter',
          mode: 'try',
        },
      },
      handler: function (request, h) {
        return processSocialLogin(request, h);
      },
    });

    server.route({
      method: 'GET',
      path: APIs.TWITTER_AUTHORIZATION,
      config: {
        auth: {
          strategy: 'twitter-authorization',
          mode: 'try',
        },
      },
      handler: function (request, h) {
        return processSocialAuthorization(request, h);
      },
    });

    server.route({
      method: 'GET',
      path: APIs.TELEGRAM_AUTHORIZATION,
      handler: function (request, h) {
        return processTelegramAuthorization(request, h);
      },
    });
  },
};

async function processSocialLogin(request, h) {
  if (!request.auth.isAuthenticated) {
    return h.redirect(`${SOCIAL_LOGIN_CALLBACK}?socialError=${request.auth.error.message}`);
  }

  const email = request.auth.credentials.profile.email || request.auth.credentials.profile.raw.email;
  const token = uuidv4();
  await cacheService.saveDataToCache(
    `${KEY_PREFIXS.SOCIAL_LOGIN_SESSION}${token}`,
    email,
    cacheService.EXPIRED_TIME.MINUTE * 10,
  );

  return h.redirect(`${SOCIAL_LOGIN_CALLBACK}?token=${token}&socialProvider=${request.auth.credentials.provider}`);
}

async function processSocialAuthorization(request, h) {
  if (!request.auth.isAuthenticated) {
    return h.redirect(`${SOCIAL_AUTHORIZATION_CALLBACK}?socialError=${request.auth.error.message}`);
  }

  if (request.auth.credentials.query) {
    if (request.auth.credentials.query.isAdmin) {
      return processAdminSocialAuthorization(request, h);
    } else if (request.auth.credentials.query.id) {
      return processUserSocialAuthorization(request, h);
    } else {
      return h.redirect(`${SOCIAL_AUTHORIZATION_CALLBACK}?socialError=${ERROR_CODES.INVALID_PARAM}`);
    }
  } else {
    return h.redirect(`${SOCIAL_AUTHORIZATION_CALLBACK}?socialError=${ERROR_CODES.INVALID_PARAM}`);
  }
}

async function processUserSocialAuthorization(request, h) {
  // Decode base64
  const buff = Buffer.from(request.auth.credentials.query.id, 'base64');
  const userId = buff.toString('utf-8');

  const tokenField = `social.${request.auth.credentials.provider}.token`;
  const tokenValue = request.auth.credentials.token;
  const secretField = `social.${request.auth.credentials.provider}.secret`;
  const secretValue = request.auth.credentials.secret;
  const idField = `social.${request.auth.credentials.provider}.id`;
  const idValue = request.auth.credentials.profile.id;
  const usernameField = `social.${request.auth.credentials.provider}.username`;
  const usernameValue = request.auth.credentials.profile.username;
  const displayNameField = `social.${request.auth.credentials.provider}.displayName`;
  const displayNameValue = request.auth.credentials.profile.displayName;
  const authorizedField = `social.${request.auth.credentials.provider}.authorized`;
  const authorizedValue = true;

  // Check twitter authorization existing
  const filter = {};
  filter[idField] = idValue;
  filter[authorizedField] = true;
  const existingUser = await UserSchema.findOne(filter);
  if (existingUser) {
    return h.redirect(`${SOCIAL_AUTHORIZATION_CALLBACK}?socialError=${ERROR_CODES.ACCOUNT_EXISTED}`);
  }

  await UserSchema.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        [tokenField]: tokenValue,
        [secretField]: secretValue,
        [idField]: idValue,
        [usernameField]: usernameValue,
        [displayNameField]: displayNameValue,
        [authorizedField]: authorizedValue,
      },
    },
    { new: true },
  );

  return h.redirect(SOCIAL_AUTHORIZATION_CALLBACK);
}

async function processAdminSocialAuthorization(request, h) {
  const tokenField = `value.${request.auth.credentials.provider}.token`;
  const tokenValue = request.auth.credentials.token;
  const secretField = `value.${request.auth.credentials.provider}.secret`;
  const secretValue = request.auth.credentials.secret;
  const idField = `value.${request.auth.credentials.provider}.id`;
  const idValue = request.auth.credentials.profile.id;
  const usernameField = `value.${request.auth.credentials.provider}.username`;
  const usernameValue = request.auth.credentials.profile.username;
  const displayNameField = `value.${request.auth.credentials.provider}.displayName`;
  const displayNameValue = request.auth.credentials.profile.displayName;
  const authorizedField = `value.${request.auth.credentials.provider}.authorized`;
  const authorizedValue = true;

  await AppConfigSchema.findOneAndUpdate(
    { key: CONSTANT.KEY_CONFIG.SOCIAL_SETTING },
    {
      $set: {
        [tokenField]: tokenValue,
        [secretField]: secretValue,
        [idField]: idValue,
        [usernameField]: usernameValue,
        [displayNameField]: displayNameValue,
        [authorizedField]: authorizedValue,
      },
    },
    { upsert: true },
  );

  return h.redirect(SOCIAL_AUTHORIZATION_ADMIN_CALLBACK);
}

async function processTelegramAuthorization(request, h) {
  const { username, id, userId } = request.query;
  if (!userId) return h.redirect(`${SOCIAL_AUTHORIZATION_CALLBACK}?socialError=${ERROR_CODES.INVALID_PARAM}`);
  if (!id) return h.redirect(`${SOCIAL_AUTHORIZATION_CALLBACK}?socialError=${ERROR_CODES.INVALID_CREDENTIAL}`);

  const buff = Buffer.from(userId, 'base64');
  const _userId = buff.toString('utf-8');

  const idField = 'social.telegram.id';
  const usernameField = 'social.telegram.username';
  const authorizedField = 'social.telegram.authorized';

  await UserSchema.findOneAndUpdate(
    { _id: _userId },
    {
      $set: {
        [idField]: id,
        [usernameField]: username,
        [authorizedField]: true,
      },
    },
    { new: true },
  );

  return h.redirect(SOCIAL_AUTHORIZATION_CALLBACK);
}
