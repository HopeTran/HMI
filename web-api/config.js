require('./src/encrypt/encrypt').decrypt();

const config = {
  version: process.env.GIT_COMMIT,
  server: {
    host: '0.0.0.0',
    ip: process.env.SERVER_IP,
    port: process.env.SERVER_PORT || '3001',
    logLevel: process.env.LOG_LEVEL,
  },
  max_file_size: process.env.MAX_FILE_SIZE || 8000000,
  external: {
    web: process.env.EXTERNAL_WEB,
    api: process.env.EXTERNAL_API,
  },
  mongo: {
    uri: process.env.MONGO_URI,
  },
  redis: {
    uri: process.env.REDIS_URI,
  },
  social: {
    cookie_encryption_password: process.env.COOKIE_ENCRYPTION_PASSWORD,
  },
  google: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    recaptcha_secret: process.env.GOOGLE_RECAPTCHA_SECRET,
    recaptcha_threshold: process.env.GOOGLE_RECAPTCHA_THRESHOLD,
  },
  facebook: {
    client_id: process.env.FACEBOOK_CLIENT_ID,
    client_secret: process.env.FACEBOOK_CLIENT_SECRET,
  },
  twitter: {
    client_id: process.env.TWITTER_CLIENT_ID,
    client_secret: process.env.TWITTER_CLIENT_SECRET,
    promotion_client_id: process.env.TWITTER_PROMOTION_CLIENT_ID,
    promotion_client_secret: process.env.TWITTER_PROMOTION_CLIENT_SECRET,
  },
  encryption_key: process.env.ENCRYPTION_KEY,
  home_made_inn_service: { 
    uri: process.env.HOME_MADE_INN_SERVICE_URI, 
    api_token: process.env.HOME_MADE_INN_SERVICE_TOKEN,
  },
  email_service: { 
    uri: process.env.EMAIL_SERVICE_URI, 
    api_token: process.env.EMAIL_SERVICE_TOKEN,
  }
};

module.exports = config;
