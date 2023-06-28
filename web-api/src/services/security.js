'use strict';
const Boom = require('@hapi/boom');
const JWT = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const { v4: uuidv4 } = require('uuid');

const CONSTANT = require('../utils/constant');
const USER_API_CONSTANT = require('../utils/user-api-constant');
const UtilsFunc = require('../utils/utils-func');
const config = require('../../config');
const cacheService = require('./cache');
const ERROR_CODES = require('../utils/error-code');

const secret = 'Q58HQK0hwNmk';

async function validate(decoded, request) {
  const currentDate = new Date();
  if (decoded.expiredDate > currentDate.getTime()) {
    // Also check in cache
    const isValidInCache = await cacheService.getDataFromCache(
      `${cacheService.KEY_PREFIXS.USER_EXPIRATION}${decoded.id}`,
    );

    if (isValidInCache) {
      request.user = decoded;
      request.user.ipAddress = UtilsFunc.getIPAddress(request);
      return { isValid: true };
    } else {
      return { isValid: false };
    }
  }
  return { isValid: false };
}

function generateJWT(user) {
  const jwt = JWT.sign(
    {
      id: user._id,
      email: user.email,
      type: user.type,
      scope: user.permissions,
      storeId: user.storeId,
      expiredDate: new Date().getTime() + CONSTANT.JWT_EXPIRED_PERIOD,
    },
    secret,
  );

  // Also mark user as logged-in in cache
  cacheService.saveDataToCache(
    `${cacheService.KEY_PREFIXS.USER_EXPIRATION}${user._id}`,
    true,
    CONSTANT.JWT_EXPIRED_PERIOD / 1000, // Expiration time in seconds
  );

  return jwt;
}

function generateUserApiJWT(userId, apiPermissions) {
  let nplPermissions = [];

  apiPermissions.forEach((permission) => {
    nplPermissions = nplPermissions.concat(USER_API_CONSTANT.API_PERMISSIONS[permission.toUpperCase()]);
  });

  const jwt = JWT.sign(
    {
      id: userId,
      scope: nplPermissions,
      expiredDate: new Date().getTime() + USER_API_CONSTANT.USER_API_JWT_EXPIRED_PERIOD,
    },
    secret,
  );

  // Also mark user as logged-in in cache
  cacheService.saveDataToCache(
    `${cacheService.KEY_PREFIXS.USER_EXPIRATION}${userId}`,
    true,
    USER_API_CONSTANT.USER_API_JWT_EXPIRED_PERIOD / 1000, // Expiration time in seconds
  );

  return jwt;
}

function decode(request) {
  if (request.headers.authorization) {
    const jwt = request.headers.authorization;
    return JWT.verify(jwt.substr(7), secret);
  }
  return undefined;
}

function decodeJWT(jwt) {
  return jwt && jwt !== '' ? JWT.verify(jwt, secret) : null;
}

function validateTwoFACode(key, code) {
  if (process.env.NODE_ENV === 'development' && code === '111111') {
    return true;
  }

  const result = speakeasy.totp.verify({
    secret: key,
    encoding: 'base32',
    token: code,
    window: 6,
  });

  if (!result) {
    throw Boom.notAcceptable(ERROR_CODES.INVALID_TWO_FA_CODE);
  }

  return true;
}

function validateSecurityCode(dbCode, dbCodeAt, code) {
  if (process.env.NODE_ENV === 'development' && code === '111111') {
    return true;
  }

  const thirtyMinutes = 1800000;
  if (dbCode !== code || Date.now() - dbCodeAt > thirtyMinutes) {
    throw Boom.notAcceptable(ERROR_CODES.INVALID_SECURITY_CODE);
  }

  return true;
}

module.exports = {
  validate,
  secret,
  generateJWT,
  decodeJWT,
  decode,
  generateUserApiJWT,
  validateTwoFACode,
  validateSecurityCode,
};
