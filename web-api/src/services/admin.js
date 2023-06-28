const _ = require('lodash');
const moment = require('moment');
const Boom = require('@hapi/boom');
const Bcrypt = require('bcrypt');

const UserSchema = require('../models/user');
const appConfigService = require('./app-config');
const CONSTANT = require('../utils/constant');
const accountService = require('./account');
const usersMemCacheService = require('../services/users-mem-cache');
const { saveAdminActivities } = require('./admin-activity');

async function getTemporaryLockedUsers() {
  const attemptConfig = await appConfigService.getAppConfigByKey(CONSTANT.KEY_CONFIG.LOGIN_ATTEMPTS);
  if (Number(attemptConfig.attempts) > 0) {
    const result = await UserSchema.find(
      {
        'loginFailed.loginAttempts': { $gte: Number(attemptConfig.attempts) },
      },
      { _id: 1, email: 1, loginFailed: 1 },
    );
    return result;
  }
  return [];
}

function updateUnlockingUser(userId) {
  return UserSchema.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      $set: {
        'loginFailed.loginAttempts': 0,
        'loginFailed.lastIpAddress': null,
        'loginFailed.lastFailedAt': null,
      },
    },
    { new: true },
  );
}

async function closeUsers({ userIds, reason }) {
  const users = await UserSchema.find().byIds(userIds).lean({ getters: true });
  const unableCloseUsers = [];
  const updatedPayload = [];
  for (const user of users) {
    const closeInfo = {
      email: user.email + CONSTANT.SUFFIX.CLOSED_USER,
      username: user.username + CONSTANT.SUFFIX.CLOSED_USER,
      password: user.password + CONSTANT.SUFFIX.CLOSED_USER,
      closedAt: new Date(),
      closedReason: reason,
    };
    updatedPayload.push(UserSchema.updateOne({ _id: user._id }, { $set: closeInfo }));
  }
  await Promise.all(updatedPayload);
  usersMemCacheService.loadUsers(userIds);
  return unableCloseUsers;
}

async function updateUser({ userId, username, password }, adminUser) {
  const user = await UserSchema.findUser().byId(userId).errorOnNotFound();
  let result = { message: 'ok' };
  if (!_.isEmpty(username)) {
    result = await accountService.updateUsername(userId, username);
  }
  if (!_.isEmpty(password)) {
    user.password = await Bcrypt.hash(password, 2);
    await user.save();
  }
  const updatedUser = await UserSchema.findUser().byId(userId).errorOnNotFound();
  await saveAdminActivities(
    CONSTANT.TABLES.USER,
    CONSTANT.ACTIVITIES.UPDATE,
    updatedUser.toObject(),
    user.toObject(),
  );
  return result;
}

function getUserById(userId) {
  return UserSchema.findById(userId).lean({ getters: true });
}

module.exports = {
  getTemporaryLockedUsers,
  updateUnlockingUser,
  closeUsers,
  updateUser,
  getUserById,
};
