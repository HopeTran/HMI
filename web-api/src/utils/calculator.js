const math = require('mathjs');

function convertToBiggerUnit(number, decimal) {
  return math.divide(math.bignumber(number), math.bignumber('1e' + decimal)).toNumber();
}

function roundWithDecimal(number, decimal) {
  return Math.round(number * Math.pow(10, decimal)) / Math.pow(10, decimal);
}

module.exports = {
  convertToBiggerUnit,
  roundWithDecimal,
};
