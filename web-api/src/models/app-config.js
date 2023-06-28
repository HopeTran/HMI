'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppConfigSchema = new Schema({
  key: { type: String, default: null },
  value: { type: Schema.Types.Mixed },
});

module.exports = mongoose.model('appconfigs', AppConfigSchema, 'appconfigs');
