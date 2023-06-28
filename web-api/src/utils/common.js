const config = require('../../config');

module.exports = {
  isLocalEnvironment,
};

function isLocalEnvironment() {
  return config.external.api.includes('localhost');
}
