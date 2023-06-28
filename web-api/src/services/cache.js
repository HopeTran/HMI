'use strict';

const redisClient = require('../utils/redis');

const KEY_PREFIXS = {
  HEALTH: 'health',
  EVENT: 'event_',
  USER_EXPIRATION: 'user_expiration_',
  MATCHING_AMOUNT: 'matching_amount_',
  SOCIAL_LOGIN_SESSION: 'social_login_session_',
  LONG_RUNNING_TASK: 'long_running_task_',
};

const CACHE_KEYS = {
  CONTRACTS: 'contracts',
  ALGORITHMS: 'algorithms',
};

const EXPIRED_TIME = {
  DEFAULT: 300,
  MINUTE: 60,
  HOUR: 3600,
};

function getDataFromCache(cacheKey) {
  return new Promise((resolve, reject) => {
    redisClient.get(cacheKey, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

function saveDataToCache(cacheKey, data, expiredTime) {
  return new Promise((resolve, reject) => {
    if (!expiredTime) {
      expiredTime = EXPIRED_TIME.DEFAULT;
    }
    redisClient.setex(cacheKey, expiredTime, JSON.stringify(data), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function deleteDataFromCache(cacheKey) {
  redisClient.del(cacheKey);
}

function cacheOhlcData(cacheKey, chartDatas) {
  for (const data of chartDatas) {
    redisClient.zremrangebyscore(cacheKey, data.time, data.time);
    redisClient.zadd(cacheKey, data.time, JSON.stringify(data));
  }
}

function getOhlcDatas(cacheKey, from, to) {
  return new Promise((resolve, reject) => {
    const query = [cacheKey, from, to];
    redisClient.zrangebyscore(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        result = result.map((chartData) => JSON.parse(chartData)).filter((chartData) => isNaN(chartData));
        resolve(result);
      }
    });
  });
}

function getLastOhlcData(cacheKey, to) {
  return new Promise((resolve, reject) => {
    const query = [cacheKey, to, -Infinity, 'LIMIT', 0, 1];
    redisClient.zrevrangebyscore(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.length > 0 ? JSON.parse(result[0]) : null);
      }
    });
  });
}

async function saveTemporaryMatchingAmount(event) {
  const cachedData = await getTemporaryMatchingAmount(event.data.market);
  let amount = event.data.amount * 2;
  if (cachedData && cachedData.amount) {
    amount += Number(cachedData.amount);
  }
  await saveDataToCache(KEY_PREFIXS.MATCHING_AMOUNT + event.data.market, { price: event.data.price, amount });
}

async function getTemporaryMatchingAmount(symbol) {
  const cachedData = await getDataFromCache(KEY_PREFIXS.MATCHING_AMOUNT + symbol);
  return cachedData || { amount: 0 };
}

module.exports = {
  KEY_PREFIXS,
  CACHE_KEYS,
  EXPIRED_TIME,
  getDataFromCache,
  saveDataToCache,
  deleteDataFromCache,
  cacheOhlcData,
  getOhlcDatas,
  getLastOhlcData,
  saveTemporaryMatchingAmount,
  getTemporaryMatchingAmount,
};
