'use strict';
const mongoose = require('mongoose');
const mongooseLeanGetters = require('mongoose-lean-getters');
const Boom = require('@hapi/boom');
const { isEmpty } = require('lodash');

const { encrypt, decrypt } = require('../utils/encrypt');
const ERROR_CODES = require('../utils/error-code');
const CONSTANT = require('../utils/constant');

const Schema = mongoose.Schema;

const LoggedInfo = new Schema(
  {
    ip: { type: String, default: null },
    device: { type: String, default: null },
  },
  { _id: false },
);

const address = new Schema(
  {
    streetAddress1: { type: String, default: null},
    streetAddress2: { type: String, default: null},
    state: { type: String, default: null},
    zipcode: { type: String, default: null},
    country: { type: String, default: null},
  },
);

const UserSchema = new Schema(
  {
    username: { type: String, default: null, get: decrypt, set: encrypt },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    storeId: { type: Number, default: 0 },
    profileImage: { type: String, default: null },
    password: { type: String, default: null },
    email: { type: String, unique: true, default: null, get: decrypt, set: encrypt },
    address: { type: String, default: null },
    addresses: { type: [address], default: [] },
    phoneNumbers: { type: [String], default: [] },
    emails: { type: [String], default: [] },
    country: { type: String, default: '' },
    type: { type: String, default: 'user' },
    status: { type: Boolean, default: true },
    code: { type: String, default: null },
    blacklist: { type: Boolean, default: false },
    activated: { type: Boolean, default: false },
    activatedAt: { type: Date, default: null },
    fwToken: { type: String, default: null },
    token: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedUsernameAt: { type: Date, default: null },
    ipAddress: { type: String, default: null },
    lastLoggedIP: { type: String, default: null },
    lastLoggedDevice: { type: String, default: null },
    lastLoginAt: { type: Date, default: null },
    twoFAKey: { type: String, default: null, get: decrypt, set: encrypt },
    isTwoFA: { type: Boolean, default: false },
    loggedInfo: { type: [LoggedInfo], default: [] },
    shouldSendMailForChangedIpOrDevice: { type: Boolean, default: false },
    createdByHook: { type: Boolean, default: false },
    source: { type: String, default: null },
    roles: { type: [String], default: null },
    banned: { type: Boolean, default: false },
    bannedAt: { type: Date, default: null },
    bannedReason: { type: String, default: null },
    closedAt: { type: Date, default: null },
    closedReason: { type: String, default: null },
    acceptAgreementAt: { type: Date, default: null },
    acceptTermsAt: { type: Date, default: null },
    adminSetting: {
      userDashboard: {
        displayedColumns: { type: [String], default: null },
      },
    },
    language: { type: String, default: 'en' },
    loginFailed: {
      loginAttempts: { type: Number, default: 0 },
      lastIpAddress: { type: String, default: 0 },
      lastFailedAt: { type: Date, default: null },
    },
    securityCode: { type: String, default: null },
    securityCodeAt: { type: Date, default: null },
    social: { type: Schema.Types.Mixed },
    isBiometric: { type: Boolean, default: false },
    geoLocation: {
        longitude: { type: Number, default: null},
        latitude: { type: Number, default: null}
    },
    searchLocationRadius: {type: "number", default: 1},
  },
  {
    toJSON: { getters: true, setters: true },
    toObject: { getters: true, setters: true },
  },
);
UserSchema.plugin(mongooseLeanGetters);

UserSchema.statics.findUser = function () {
  return this.findOne().select('-password');
};

UserSchema.query.byId = function (id) {
  return this.where('_id', id);
};

UserSchema.query.byCreatedDateRange = function (from, to) {
  if (from && to) {
    return this.where('createdAt').gte(from).lte(to);
  }
  return this;
};

UserSchema.query.byClosedDateRange = function (from, to) {
  if (from && to) {
    return this.where('closedAt').gte(from).lte(to);
  }
  return this;
};

UserSchema.query.byIds = function (ids) {
  if (ids && ids.length > 0) {
    return this.where('_id').in(ids);
  }
  return this;
};

UserSchema.query.byStatus = function (status) {
  if (status && status !== CONSTANT.USER_STATUS.ALL) {
    if (status === CONSTANT.USER_STATUS.ACTIVATED || status === CONSTANT.USER_STATUS.UNACTIVATED) {
      return this.or([{ closedAt: null }, { closedAt: { $exists: false } }])
        .where('activated', status === CONSTANT.USER_STATUS.ACTIVATED)
        .where('banned', false);
    }

    if (status === CONSTANT.USER_STATUS.BANNED || status === CONSTANT.USER_STATUS.UNBANNED) {
      return this.or([{ closedAt: null }, { closedAt: { $exists: false } }])
        .where('banned', status === CONSTANT.USER_STATUS.BANNED)
        .where('bannedAt')
        .ne(null);
    }

    if (status === CONSTANT.USER_STATUS.CLOSED) {
      return this.where('closedAt').ne(null);
    }
  }
  return this.or([{ closedAt: null }, { closedAt: { $exists: false } }]);
};

UserSchema.query.byRoles = function (roles) {
  if (roles && roles.length > 0) {
    return this.where('roles').in(roles);
  }
  return this;
};

UserSchema.query.byEmail = function (email) {
  if (isEmpty(email)) {
    return this.error(Boom.badData(ERROR_CODES.INVALID_PARAM));
  }
  return this.where('email', email);
};

UserSchema.query.byUsername = function (username) {
  if (isEmpty(username)) {
    return this.error(Boom.badData(ERROR_CODES.INVALID_PARAM));
  }
  return this.where('username', username);
};

UserSchema.query.byEmailOrUsername = function (emailOrUsername) {
  if (!isEmpty(emailOrUsername)) {
    return this.or([{ email: emailOrUsername }, { username: emailOrUsername }]);
  }
  return this;
};

UserSchema.query.errorOnNotFound = function (errorMessage = ERROR_CODES.USER_NOT_FOUND) {
  return this.orFail(Boom.notFound(errorMessage));
};

UserSchema.query.byFwToken = function (token) {
  if (isEmpty(token)) {
    return this.error(Boom.notFound(ERROR_CODES.INVALID_TOKEN));
  }
  return this.where('fwToken', token);
};

UserSchema.query.byTwoFA = function (isTwoFA) {
  return this.where('isTwoFA', isTwoFA);
};

UserSchema.query.byIdNot = function (id) {
  return this.where('_id').ne(id);
};

UserSchema.query.byActivationCode = function (code) {
  if (isEmpty(code)) {
    return this.error(Boom.notFound(ERROR_CODES.INVALID_CODE));
  }
  return this.where('code', code);
};

UserSchema.query.byActivated = function (isActivated) {
  return this.where('activated', isActivated);
};


module.exports = mongoose.model('users', UserSchema, 'users');
