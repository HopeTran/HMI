'use strict';

const Boom = require('@hapi/boom');
const csvParser = require('csv-parse/lib/sync');

const ERROR_CODES = require('./error-code');
const CONSTANT = require('../utils/constant');

function validateConfiguration(data) {
  const forcedLiquidationRatioSchema = Joi.object().keys({
    key: Joi.string().required().error(new Error('Invalid key')),
    value: Joi.string().required().error(new Error('Invalid value')),
  });
  const { error } = forcedLiquidationRatioSchema.validate(data);
  return error;
}

function validateEmail(data) {
  const accountSchema = Joi.object().keys({
    email: Joi.string().min(6).max(50).regex(CONSTANT.EMAIL_REGEX).error(new Error(ERROR_CODES.INVALID_EMAIL)),
  });

  const { error } = accountSchema.validate(data);
  return error;
}

function validateCSV(csvString, headers) {
  const lines = csvString.match(/[^\r\n]+/g);
  if (lines.length < 2) {
    throw Boom.badRequest(ERROR_CODES.EMPTY_FILE);
  }

  const rows = csvParser(lines[0], {
    skip_empty_lines: true,
    quote: '"',
  });
  const fileHeaders = rows[0];

  if (fileHeaders.join(',').toLowerCase() !== headers.join(',').toLowerCase()) {
    throw Boom.badRequest(ERROR_CODES.INVALID_FORMAT_FILE, headers);
  }
}

module.exports = {
  validateConfiguration,
  validateEmail,
  validateCSV,
};
