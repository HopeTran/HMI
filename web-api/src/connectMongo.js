'use strict';

const config = require('../config');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

logger.debug('Mongo URI:', config.mongo.uri);

mongoose.connect(
  config.mongo.uri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    keepAlive: true,
    poolSize: 25,
    socketTimeoutMS: 0,
  },
  () => {
    logger.debug('Mongose connected');
  },
);

mongoose.connection.on('error', () => {
  logger.error(`Unable to connect to database ${config.mongo.uri}`);
});
