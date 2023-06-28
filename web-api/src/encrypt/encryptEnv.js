const encrypter = require('./encrypt');
const path = require('path');

const directoryPath = path.join(__dirname, '../../.env');
encrypter.encrypt(directoryPath);
