const path = require('path');
const fs = require('fs');
const aesjs = require('aes-js');

const key = 'narrow pacific futures 1';
const idx = 20;

function log(message /*: string */) {
  console.log(`[encrypt][DEBUG] ${message}`);
}

function encrypt(filePath) {
  let configString;
  try {
    configString = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    log(e);
    return;
  }
  const textBytes = aesjs.utils.utf8.toBytes(configString);
  const keyBytes = aesjs.utils.utf8.toBytes(key);
  // eslint-disable-next-line new-cap
  const aesCtr = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(5));
  const encryptedBytes = aesCtr.encrypt(textBytes);
  const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
  const result = addRule(encryptedHex);

  fs.writeFile(filePath, result, function (err) {
    if (err) {
      log(err);
    }
  });
}

function addRule(str) {
  const subStr = str.substr(str.length - key.length);
  const newStr = str.substr(0, str.length - key.length);

  return newStr.slice(0, idx) + subStr + newStr.slice(idx);
}

// Parses src into an Object
function parse(src /*: string | Buffer */, options /*: ?DotenvParseOptions */) /*: DotenvParseOutput */ {
  const debug = Boolean(options && options.debug);
  const obj = {};

  // convert Buffers before splitting into lines and processing
  src
    .toString()
    .split('\n')
    .forEach(function (line, idx) {
      // matching "KEY' and 'VAL' in 'KEY=VAL'
      const keyValueArr = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      // matched?
      if (keyValueArr != null) {
        const key = keyValueArr[1];

        // default undefined or missing values to empty string
        let value = keyValueArr[2] || '';

        // expand newlines in quoted values
        const len = value ? value.length : 0;
        if (len > 0 && value.charAt(0) === '"' && value.charAt(len - 1) === '"') {
          value = value.replace(/\\n/gm, '\n');
        }

        // remove any surrounding quotes and extra spaces
        value = value.replace(/(^['"]|['"]$)/g, '').trim();

        obj[key] = value;
      } else if (debug) {
        log(`did not match key and value when parsing line ${idx + 1}: ${line}`);
      }
    });

  return obj;
}

function decrypt() {
  let configString;
  let decryptedText;
  const debug = false;

  try {
    const nplPath = path.resolve(process.cwd(), '.env');
    configString = fs.readFileSync(nplPath, 'utf8');
    const keyBytes = aesjs.utils.utf8.toBytes(key);
    const encryptedBytes = aesjs.utils.hex.toBytes(removeRule(configString));
    // eslint-disable-next-line new-cap
    const aesCtr = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(5));
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);
    decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
  } catch (e) {
    decryptedText = configString;
  }

  try {
    const parsed = parse(decryptedText);
    Object.keys(parsed).forEach(function (key) {
      // eslint-disable-next-line no-prototype-builtins
      if (!process.env.hasOwnProperty(key)) {
        process.env[key] = parsed[key];
      } else if (debug) {
        log(`"${key}" is already defined in \`process.env\` and will not be overwritten`);
      }
    });

    return { parsed };
  } catch (e) {
    return { error: e };
  }
}

function removeRule(str) {
  const subStr = str.substr(idx, key.length);

  return str.slice(0, idx) + str.slice(idx + key.length) + subStr;
}

module.exports.decrypt = decrypt;
module.exports.encrypt = encrypt;
