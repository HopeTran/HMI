function randomNumber(lowerBound, upperBound) {
  return Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
}

function randomBool() {
  return !!Math.floor(Math.random() * 2);
}

module.exports = {
  randomNumber,
  randomBool,
};
