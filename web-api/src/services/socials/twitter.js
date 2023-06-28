const Twitter = require('twitter');
const JSONBig = require('json-bigint');

const config = require('../../../config');

function initTwitterClient(token, secret) {
  return new Twitter({
    consumer_key: config.twitter.client_id,
    consumer_secret: config.twitter.client_secret,
    access_token_key: token,
    access_token_secret: secret,
  });
}

function fetchFollowers(token, secret) {
  const client = initTwitterClient(token, secret);

  return new Promise((resolve, reject) => {
    client.get('followers/ids', function (error, data, response) {
      if (error) {
        reject(error);
      } else {
        const followers = JSONBig.parse(response.body);
        resolve(followers);
      }
    });
  });
}

function fetchTweets(token, secret, userId) {
  const client = initTwitterClient(token, secret);

  return new Promise((resolve, reject) => {
    client.get(
      'statuses/user_timeline',
      {
        user_id: userId,
        count: 200,
        trim_user: true,
        exclude_replies: true,
        include_rts: false,
      },
      function (error, tweets) {
        if (error) {
          reject(error);
        } else {
          resolve(tweets);
        }
      },
    );
  });
}


function fetchTwitterEmail(token, secret) {
  const client = initTwitterClient(token, secret);

  return new Promise((resolve, reject) => {
    client.get(
      'account/verify_credentials',
      {
        include_email: true,
      },
      function (error, data, response) {
        if (error) {
          reject(error);
        } else {
          const profile = JSONBig.parse(response.body);
          resolve(profile.email);
        }
      },
    );
  });
}

module.exports = {
  fetchFollowers,
  fetchTweets,
  fetchTwitterEmail,
};
