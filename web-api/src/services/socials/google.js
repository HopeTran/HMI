const axios = require('axios');
const Boom = require('@hapi/boom');

const CONSTANT = require('../../utils/constant');
const { EMAIL_NOT_FOUND } = require('../../utils/error-code');


async function fetchGoogleEmail(userToken) {
  const userDataResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${userToken}`);

  if (!userDataResponse || !userDataResponse.data || !userDataResponse.data.email) {
    throw Boom.badData(EMAIL_NOT_FOUND);
  }

  if (CONSTANT.EMAIL_REGEX.test(userDataResponse.data.email)) {
    return userDataResponse.data.email;
  } else {
    throw Boom.badData(ERROR_CODES.INVALID_EMAIL);
  }
}

module.exports = {
  fetchGoogleEmail,
};
