'use strict';
const { validate, secret } = require('../services/security');

module.exports = {
  name: 'routes-auth',
  version: '1.0.0',
  register: server => {
    server.auth.strategy('jwt', 'jwt', {
      key: secret, // Never Share your secret key
      validate: validate, // validate function defined above
      verifyOptions: {
        ignoreExpiration: true, // do not reject expired tokens
        algorithms: ['HS256'], // specify your secure algorithm
      },
    });
  },
};
