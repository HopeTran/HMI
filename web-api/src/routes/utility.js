'use strict';

const config = require('../../config');
const appConfigService = require('../services/app-config');
const healthCheckService = require('../services/health-check');
const UtilsFunc = require('../utils/utils-func');
const CONSTANT = require('../utils/constant');

const APIs = {
  VERSION: '/version',
  CLIENT_GEOIP: '/geoip',
  HEALTH_CHECK: '/health-check',
  ENABLE_TWO_FA_SETTING_ALERT: '/enable-two-fa-setting-alert',
};

module.exports = {
  name: 'routes-utility',
  version: '1.0.0',
  register: (server) => {
    server.route({
      method: 'GET',
      path: APIs.VERSION,
      handler: async () => {
       
        return {
          version: config.version,
        };
      },
    });

    server.route({
      method: 'GET',
      path: APIs.CLIENT_GEOIP,
      handler: (request) => {
        const clientIP = UtilsFunc.getIPAddress(request);
        return UtilsFunc.getLocationDataFromIP(clientIP);
      },
    });

    server.route({
      method: 'GET',
      path: APIs.HEALTH_CHECK,
      handler: () => {
        return healthCheckService.checkHealth();
      },
    });

    server.route({
      method: 'GET',
      path: APIs.ENABLE_TWO_FA_SETTING_ALERT,
      handler: () => {
        return appConfigService.getAppConfigByKey(CONSTANT.KEY_CONFIG.ENABLE_TWO_FA_SETTING_ALERT);
      },
    });
  },
};
