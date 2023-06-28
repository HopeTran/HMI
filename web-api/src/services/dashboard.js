const moment = require('moment');

const UserSchema = require('../models/user');
const countryUtils = require('../utils/country');

async function getUserCount() {
  const allTotalUsers = await UserSchema.find({}, {}).byStatus('activated').countDocuments();
  const to = moment();
  const from = moment().subtract(24, 'hour');
  const totalUsers24h = await UserSchema.find({}, {})
    .byCreatedDateRange(from.toDate(), to.toDate())
    .byStatus('activated')
    .countDocuments();
  return { allTotalUsers, totalUsers24h };
}

const Limit = 5;
async function getUserCountPerCountry(is24h) {
  let result;
  if (is24h) {
    const to = moment();
    const from = moment().subtract(24, 'hour');
    result = await UserSchema.getTopCountriesWithUserCount(Limit, from.toDate(), to.toDate());
  } else {
    result = await UserSchema.getTopCountriesWithUserCount(Limit, '', '');
  }

  if (result) {
    result.forEach((item) => {
      item.country = countryUtils.getFullNameByCode(item._id);
    });
  }

  return result;
}

module.exports = {
  getUserCount,
  getUserCountPerCountry,
};
