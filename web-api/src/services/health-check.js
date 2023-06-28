const mongoose = require('mongoose');
const axios = require('axios');
const disk = require('diskusage');
const os = require('os');

const redisClient = require('../utils/redis');

const OK_STATUS = { label: 'OK', value: 'OK' };
const NOT_OK_STATUS = { label: 'ERROR', value: 'NOT OK' };
const UNKNOWN_STATUS = { label: 'UNKNOWN', value: 'UNKNOWN' };

const HEALTH_CHECK_SERVICES = {
  'Mongo DB': UNKNOWN_STATUS,
  'Postgres DB': UNKNOWN_STATUS,
  'Redis DB': UNKNOWN_STATUS,
  'Free Disk Space': UNKNOWN_STATUS,
};

async function checkHealth() {
  const healthCheck = {};

  // Check Mongo DB
  if (mongoose.connection.readyState === 1) {
    healthCheck['Mongo DB'] = OK_STATUS;
  } else {
    healthCheck['Mongo DB'] = NOT_OK_STATUS;
  }

  // Check Redis
  healthCheck['Redis DB'] = redisClient.connected ? OK_STATUS : NOT_OK_STATUS;

  // Check disk space
  try {
    const freeDiskSpacePercentage = await checkFreeSpace();
    const result = {
      label: OK_STATUS.label,
      value: `${freeDiskSpacePercentage}%`,
    };
    if (freeDiskSpacePercentage < 10) {
      result.label = 'ERROR';
    } else if (freeDiskSpacePercentage < 20) {
      result.label = 'WARNING';
    } else {
      result.value = OK_STATUS.value;
    }

    healthCheck['Free Disk Space'] = result;
  } catch (e) {
    healthCheck['Free Disk Space'] = NOT_OK_STATUS;
  }

  return Object.assign({}, HEALTH_CHECK_SERVICES, healthCheck);
}

async function checkFreeSpace() {
  const diskPath = os.platform() === 'win32' ? 'c:' : '/';
  const { available, total } = await disk.check(diskPath);
  return Math.round((available * 100) / total);
}

module.exports = {
  checkHealth,
};
