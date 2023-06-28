'use strict';
const Boom = require('@hapi/boom');
const Hapi = require('@hapi/hapi');
const config = require('../config');
const logger = require('./utils/logger');
const usersMemCacheService = require('./services/users-mem-cache');

require('./connectMongo');

process.on('unhandledRejection', (err) => {
  logger.error(err);
});

// Create a server with a host and port
const server = Hapi.server({
  load: {
    sampleInterval: 1000,
  },
  port: Number(config.server.port),
  host: config.server.host,
  routes: {
    cors: true,
    timeout: {
      server: 9 * 60 * 1000,
      socket: 10 * 60 * 1000,
    },
  },
});

// Simple HTTP log
server.events.on('response', (request) => {
  try {
    logger.info(
      request.info.remoteAddress +
        ': ' +
        request.method.toUpperCase() +
        ' ' +
        request.url.pathname +
        ' --> ' +
        request.response.statusCode,
    );
  } catch (e) {
    logger.error(e);
  }
});

server.ext('onPreResponse', (request, h) => {
  const response = request.response;
  if (response.isBoom) {
    logger.error(response);
    const is4xxError = (response.response && response.response.status >=400 && response.response.status <500 )||(response.output.statusCode >= 400 && response.output.statusCode < 500);
    const data = response.data || (response.response && response.response.data) || response.output.payload;
    const errorCode = data.status || data.statusCode || response.response.status;
    if (is4xxError && data) {
      response.output.payload.errorCode = data.errorCode ;
      delete response.output.payload.error;
      delete response.output.payload.message;
      response.output.payload.data = data;
      response.output.payload.statusCode=errorCode;
    }
  } else if (response instanceof Error) {
    logger.error(response);
    return Boom.badImplementation();
  }
  return h.continue;
});

server
  .register([
    require('@hapi/inert'),
    require('@hapi/vision'),
    require('@hapi/h2o2'),
    require('hapi-auth-jwt2'),
    require('./routes/auth-jwt'),
    require('@hapi/bell'),
    require('./routes/account'),
    // require('./routes/auth-social'),
    // require('./routes/social'),
    require('./routes/admin'),
    require('./routes/home-made-inn'),
    require('./routes/static-files'),
    require('./routes/utility'),
  ])
  .then(() => {
    // Start the server
    server
      .start()
      .then(() => {
        logger.info('Server running at:', server.info.uri);
      })
      .catch((err) => {
        logger.error(err);
      });
  })
  .catch((err) => {
    logger.error(err);
  });

usersMemCacheService.loadUsers();
