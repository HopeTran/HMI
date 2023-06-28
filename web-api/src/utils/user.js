'use strict';

const Boom = require('@hapi/boom');

const UserSchema = require('../models/user');

async function getUserIfExist(query, fields = {}, message = 'User not found', isLean = false) {
  let user;
  if (isLean) {
    user = await UserSchema.findOne(query, fields).lean();
  } else {
    user = await UserSchema.findOne(query, fields);
  }
  if (!user) {
    throw Boom.notFound(message);
  }
  return user;
}

async function isUserNotExist(query, message = 'User existed') {
  const user = await UserSchema.findOne(query);
  if (user) {
    throw Boom.conflict(message);
  }
  return true;
}

function checkUserHasPermission(user, permission) {
  return user && user.scope && user.scope.length > 0 && user.scope.includes(permission);
}

function isActiveUser(user) {
  return user && !user.code && user.status && user.activated && !user.blacklist && !user.banned && !user.closedAt;
}

module.exports = {
  checkUserHasPermission,
  isActiveUser,
  getUserIfExist,
  isUserNotExist
};
