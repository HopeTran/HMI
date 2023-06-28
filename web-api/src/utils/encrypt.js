const crypto = require('crypto');

const config = require('../../config');
const CONSTANT = require('./constant');

const ALGORITHM = CONSTANT.ENCRYPTION.ALGORITHM;
const ENCODING = CONSTANT.ENCRYPTION.ENCODING;
const ENCRYPTION_KEY = Buffer.from(config.encryption_key, ENCODING);
const IV = Buffer.from(CONSTANT.ENCRYPTION.INITIALIZATION_VECTOR, ENCODING);

module.exports = {
  encrypt,
  decrypt,
};

function encrypt(text) {
  if (!text || text.endsWith(CONSTANT.ENCRYPTION.SALT)) return text;
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString(ENCODING) + CONSTANT.ENCRYPTION.SALT;
}

function decrypt(encryptedText) {
  if (!encryptedText || !encryptedText.endsWith(CONSTANT.ENCRYPTION.SALT)) return encryptedText;
  encryptedText = encryptedText.substring(0, encryptedText.length - CONSTANT.ENCRYPTION.SALT.length);

  const encryptedBuffer = Buffer.from(encryptedText, ENCODING);
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, IV);
  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
