'use strict';
const log4js = require('log4js');

const config = require('../../config');

log4js.configure({
  appenders: {
    debug: { type: 'console' },
    release: {
      type: 'dateFile',
      filename: './server.log',
      alwaysIncludePattern: true,
      pattern: '-yyyyMMdd.log',
      numBackups: 60,
      layout: {
        type: 'pattern',
        pattern: '[%d{O yyyy-MM-dd hh:mm:ss.SSS}] [%p] %m',
      },
    },
  },
  categories: {
    default: { appenders: ['debug'], level: config.server.logLevel },
    debug: { appenders: ['debug'], level: config.server.logLevel },
    release: { appenders: ['release'], level: config.server.logLevel },
  },
  pm2: true,
  disableClustering: true,
});

const logger = log4js.getLogger();

module.exports = logger;
