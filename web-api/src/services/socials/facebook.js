const axios = require('axios');
const Boom = require('@hapi/boom');

const CONSTANT = require('../../utils/constant');
const ERROR_CODES = require('../../utils/error-code');

async function fetchFacebookEmail(userToken) {
  const userDataResponse = await axios.get(`https://graph.facebook.com/me?fields=email&access_token=${userToken}`);

  if (!userDataResponse || !userDataResponse.data || !userDataResponse.data.email) {
    throw Boom.badData(ERROR_CODES.EMAIL_NOT_FOUND);
  }

  if (CONSTANT.EMAIL_REGEX.test(userDataResponse.data.email)) {
    return userDataResponse.data.email;
  } else {
    throw Boom.badData(ERROR_CODES.INVALID_EMAIL);
  }
}

module.exports = {
  fetchFacebookEmail,
};
