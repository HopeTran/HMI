'use strict';
const config = require('../../config');
const { isLocalEnvironment } = require('../utils/common');

module.exports = {
  name: 'routes-auth-social',
  version: '1.0.0',
  register: (server) => {
    // facebook
    server.auth.strategy('facebook', 'bell', {
      provider: 'facebook',
      password: config.social.cookie_encryption_password,
      isSecure: !isLocalEnvironment(),
      clientId: config.facebook.client_id,
      clientSecret: config.facebook.client_secret,
      location: config.external.api,
    });

    // google
    server.auth.strategy('google', 'bell', {
      provider: 'google',
      password: config.social.cookie_encryption_password,
      isSecure: !isLocalEnvironment(),
      clientId: config.google.client_id,
      clientSecret: config.google.client_secret,
      location: config.external.api,
    });

    // twitter
    if (config.twitter.client_id && config.twitter.client_secret) {
      server.auth.strategy('twitter', 'bell', {
        provider: 'twitter',
        password: config.social.cookie_encryption_password,
        isSecure: !isLocalEnvironment(),
        clientId: config.twitter.client_id,
        clientSecret: config.twitter.client_secret,
        location: config.external.api,
        config: {
          getMethod: 'account/verify_credentials',
          getParams: { include_email: 'true' },
        },
      });
    }

    if (config.twitter.promotion_client_id && config.twitter.promotion_client_secret) {
      server.auth.strategy('twitter-authorization', 'bell', {
        provider: 'twitter',
        password: config.social.cookie_encryption_password,
        cookie: 'twitter-authorization',
        isSecure: !isLocalEnvironment(),
        clientId: config.twitter.promotion_client_id,
        clientSecret: config.twitter.promotion_client_secret,
        location: config.external.api,
      });
    }
  },
};
