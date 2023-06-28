'use strict';

const redis = require('redis');
const config = require('../../config');
const redisClient = redis.createClient(config.redis.uri);

module.exports = redisClient;
