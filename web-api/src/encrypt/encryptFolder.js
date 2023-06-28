const path = require('path');
const fs = require('fs');
const encryptFolder = require('./encrypt');

const directoryPath = path.join(__dirname, './');
fs.readdir(directoryPath, function (err, files) {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }
  files.forEach(function (file) {
    if (!file.endsWith('.js')) {
      encryptFolder.encrypt(directoryPath + file);
    }
  });
});
