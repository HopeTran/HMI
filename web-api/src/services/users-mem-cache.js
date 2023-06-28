const cache = require('memory-cache');

const logger = require('../utils/logger');
const UserSchema = require('../models/user');
const userUtils = require('../utils/user');

const SELECTED_FIELDS =
  '_id username firstName lastName email storeId profileImage country code status activated blacklist banned closedAt isTwoFA roles';

async function loadUsers(userIds) {
  const users = await UserSchema.find().byIds(userIds).select(SELECTED_FIELDS).lean({ getters: true }).exec();
  for (const user of users) {
    if (user._id) {
      cache.put(user._id, user);
    } else {
      logger.debug('Missing _id', user);
    }
  }
}

function getUsers(ids) {
  const users = [];
  if (!ids || (Array.isArray(ids) && ids.length === 0)) {
    ids = cache.keys();
  }
  for (const _id of ids) {
    if (cache.get(_id)) {
      users.push(cache.get(_id));
    }
  }
  return users;
}

function searchUsersByText(text, activeOnly = false, fields = [], searchSeparate = ',') {
  const users = getUsers();
  let result;
  if (text === '') {
    result = users.filter((user) => {
      return !activeOnly || userUtils.isActiveUser(user);
    });
  } else {
    const searchValues = searchSeparate && searchSeparate !== '' ? text.split(searchSeparate) : [text];
    result = users.filter((user) => {
      for (const searchValue of searchValues) {
        if (searchValue.trim() !== '') {
          const regex = new RegExp(`\\b${searchValue}`, 'i');
          if (
            (!activeOnly || userUtils.isActiveUser(user)) &&
            (regex.test(user.username) || regex.test(user.email) || regex.test(user._id))
          ) {
            return true;
          }
        }
      }
      return false;
    });
  }
  if (Array.isArray(fields) && fields.length > 0) {
    return result.map((user) => {
      const data = {};
      for (const field of fields) {
        data[field] = user[field];
      }
      return data;
    });
  }
  return result;
}

module.exports = {
  loadUsers,
  searchUsersByText,
};
