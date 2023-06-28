const math = require('mathjs');
const axios = require('axios');
const moment = require('moment');
const useragent = require('useragent');

const CONSTANT = require('./constant');
const logger = require('./logger');
const { fetchTwitterEmail } = require('../services/socials/twitter');
const { fetchGoogleEmail } = require('../services/socials/google');
const { fetchFacebookEmail } = require('../services/socials/facebook');

const countriesList = require('../statics/countries.json');
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMERIC = '0123456789';

function getIPAddress(request) {
  const xFF = request.headers['x-forwarded-for'];
  return xFF ? xFF.split(',')[0] : request.info.remoteAddress;
}

async function getCountryCodeFromIP(clientIP) {
  try {
    const data = await getLocationDataFromIP(clientIP);
    return data.country_code;
  } catch (e) {
    logger.error(e);
    return '';
  }
}

function getClientInfo(request) {
  const agent = useragent.parse(request.headers['user-agent']);
  const ip = getIPAddress(request);
  return {
    ipAddress: ip,
    device: `${agent.family} V${agent.major}.${agent.minor}.${agent.patch}(${agent.os})`,
  };
}

async function getLocationDataFromIP(clientIP) {
  try {
    const res = await axios.get(`http://api.ipstack.com/${clientIP}?access_key=3009a463de73191f2f104b670332407d`);

    if (res && !res.data.country_code) {
      throw new Error();
    }
    return res.data;
  } catch (e) {
    const res = await axios.get(`https://geoip.narrowpacific.com/json/${clientIP}`);
    return res.data;
  }
}

async function getSocialSignInEmail(socialType, token, secret) {
  if (socialType === CONSTANT.SOCIALS_TYPE.TWITTER) {
    return await fetchTwitterEmail(token, secret);
  } else if (socialType === CONSTANT.SOCIALS_TYPE.FACEBOOK) {
    return await fetchFacebookEmail(token);
  } else if (socialType === CONSTANT.SOCIALS_TYPE.GOOGLE) {
    return await fetchGoogleEmail(token);
  }
  return '';
}

function generateCode(count) {
  return generateFromArray(count, ALPHABET);
}

function generateNumericCode(count) {
  return generateFromArray(count, NUMERIC);
}

function generateFromArray(count, array) {
  let rtn = '';
  for (let i = 0; i < count; i += 1) {
    rtn += array.charAt(Math.floor(Math.random() * array.length));
  }
  return rtn;
}

function getAdjustedPercent(percent) {
  return (100 + Number(percent || 0)) / 100;
}

function ceilPriceByPriceStep(price, priceStep) {
  return math
    .multiply(math.ceil(math.divide(math.bignumber(price), math.bignumber(priceStep))), math.bignumber(priceStep))
    .toNumber();
}

function zeroPadding(value) {
  return value < 10 ? `0${value}` : value;
}

function arrayToKeyValueMap(array, keyField, valueField) {
  return array.reduce((obj, item) => {
    if (item && item[keyField]) {
      obj[item[keyField]] = item[valueField];
    }
    return obj;
  }, {});
}

function getValueByPath(obj, path) {
  var stringToPath = function (path) {
    // Create new array
    var output = [];

    // Split to an array with dot notation
    path.split('.').forEach(function (item) {
      // Split to an array with bracket notation
      item.split(/\[([^}]+)\]/g).forEach(function (key) {
        // Push to the new array
        if (key.length > 0) {
          output.push(key);
        }
      });
    });
    return output;
  };

  // Get the path as an array
  path = stringToPath(path);

  // Cache the current object
  var current = obj;

  // For each item in the path, dig into the object
  for (var i = 0; i < path.length; i++) {
    if (!current[path[i]]) return undefined;

    current = current[path[i]];
  }
  return current;
}

function getCountryCodeByName(countryName) {
  const country = countriesList.find(
    (country) => country.label.toLowerCase().trim() === countryName.toLowerCase().trim(),
  );

  if (country) {
    return country.value;
  }

  return countryName;
}

function toCapitalizeText(str) {
  return str && str.length > 0
    ? str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      })
    : str;
}

function toBeginDate(date) {
  if (!date) {
    date = moment();
  }

  return toBeginHour(date).set({
    hour: 0,
  });
}

function toEndDate(date) {
  if (!date) {
    date = moment();
  }

  return toEndHour(date).set({
    hour: 23,
  });
}

function toBeginHour(date) {
  if (!date) {
    date = moment();
  }

  return toBeginMinute(date).set({
    minute: 0,
  });
}

function toEndHour(date) {
  if (!date) {
    date = moment();
  }

  return toEndMinute(date).set({
    minute: 59,
  });
}

function toBeginMinute(date) {
  if (!date) {
    date = moment();
  }

  return moment.utc(date).set({
    second: 0,
    millisecond: 0,
  });
}

function toEndMinute(date) {
  if (!date) {
    date = moment();
  }

  return moment.utc(date).set({
    second: 59,
    millisecond: 999,
  });
}

function getUTCStringByTimestamp(timestamp) {
  return moment(Number(timestamp)).isValid()
    ? moment(Number(timestamp)).toDate().toUTCString()
    : new Date().toUTCString();
}

function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

function datetimeFormat (date, format) {
  return date ? moment(date).format(format) : '-';
}

module.exports = {
  getIPAddress,
  generateCode,
  generateNumericCode,
  getAdjustedPercent,
  ceilPriceByPriceStep,
  zeroPadding,
  arrayToKeyValueMap,
  getCountryCodeFromIP,
  getLocationDataFromIP,
  getValueByPath,
  getClientInfo,
  getCountryCodeByName,
  toCapitalizeText,
  toBeginDate,
  toEndDate,
  toBeginHour,
  toEndHour,
  toBeginMinute,
  toEndMinute,
  getUTCStringByTimestamp,
  streamToString,
  getSocialSignInEmail,
  datetimeFormat
};
