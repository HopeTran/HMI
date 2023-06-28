const Boom = require('@hapi/boom');

const AppConfigSchema = require('../models/app-config');
const CONSTANT = require('../utils/constant');
const logger = require('../utils/logger');
const ERROR_CODES = require('../utils/error-code');

async function getAppConfigAddress() {
  const appConfig = await AppConfigSchema.findOne({
    key: CONSTANT.KEY_CONFIG.APP_CONFIG,
  });
  let result = {
    ethAddress: '',
    erc20Address: '',
    erc721Address: '',
    btcAddress: '',
    usdtAddress: '',
    bmAddress: '',
  };
  if (appConfig) {
    result = {
      ethAddress: appConfig.value.ethAddress,
      erc20Address: appConfig.value.erc20Address,
      erc721Address: appConfig.value.erc721Address,
      btcAddress: appConfig.value.btcAddress,
      usdtAddress: appConfig.value.usdtAddress,
      bmAddress: appConfig.value.bmAddress,
    };
  }
  return result;
}

async function getAppConfig() {
  const appConfig = await AppConfigSchema.findOne({
    key: CONSTANT.KEY_CONFIG.APP_CONFIG,
  });
  let result = {};
  if (appConfig) {
    result = appConfig.value;
  }
  return result;
}

async function updateAppConfig(data) {
  let appConfig = await AppConfigSchema.findOne({
    key: CONSTANT.KEY_CONFIG.APP_CONFIG,
  });
  if (!appConfig) {
    throw Boom.badRequest();
  }
  if (data.ethAddress !== undefined && appConfig.value.ethAddress !== data.ethAddress)
    appConfig.value.ethAddress = data.ethAddress.toLowerCase();
  if (data.erc20Address !== undefined && appConfig.value.erc20Address !== data.erc20Address)
    appConfig.value.erc20Address = data.erc20Address.toLowerCase();
  if (data.erc721Address !== undefined && appConfig.value.erc721Address !== data.erc721Address)
    appConfig.value.erc721Address = data.erc721Address.toLowerCase();
  if (data.btcAddress !== undefined && appConfig.value.btcAddress !== data.btcAddress)
    appConfig.value.btcAddress = data.btcAddress;
  if (data.usdtAddress !== undefined && appConfig.value.usdtAddress !== data.usdtAddress)
    appConfig.value.usdtAddress = data.usdtAddress;
  if (data.bmAddress !== undefined && appConfig.value.bmAddress !== data.bmAddress)
    appConfig.value.bmAddress = data.bmAddress;

  appConfig = await AppConfigSchema.findOneAndUpdate(
    { key: CONSTANT.KEY_CONFIG.APP_CONFIG },
    { $set: { value: appConfig.value } },
    { new: true },
  );
  return appConfig.value;
}

async function getAppConfigByKey(key) {
  const foundItem = await AppConfigSchema.findOne({ key });
  if (foundItem) {
    return foundItem.value;
  }

  return [];
}

async function updateAppConfigByKey(key, updateData) {
  const result = await AppConfigSchema.updateOne({ key: key }, { $set: { value: updateData } }, { upsert: true });

  return result;
}

let passwordValidators;
function getPasswordValidators() {
  if (!passwordValidators || passwordValidators.length <= 0) {
    passwordValidators = getAppConfigByKey(CONSTANT.KEY_CONFIG.PASSWORD_VALIDATORS);
  }
  return passwordValidators;
}

function updatePasswordValidators(updateData) {
  const result = updateAppConfigByKey(CONSTANT.KEY_CONFIG.PASSWORD_VALIDATORS, updateData);
  passwordValidators = updateData;
  return result;
}

let globalNotification;
function getGlobalNotification() {
  if (!globalNotification) {
    globalNotification = getAppConfigByKey(CONSTANT.KEY_CONFIG.GLOBAL_NOTIFICATION);
  }
  return globalNotification;
}

async function updateGlobalNotification(updateData) {
  const result = updateAppConfigByKey(CONSTANT.KEY_CONFIG.GLOBAL_NOTIFICATION, updateData);
  globalNotification = updateData;
  return result;
}

module.exports = {
  getAppConfigAddress,
  getAppConfig,
  updateAppConfig,
  getAppConfigByKey,
  updateAppConfigByKey,
  getPasswordValidators,
  updatePasswordValidators,
  getGlobalNotification,
  updateGlobalNotification,
};
