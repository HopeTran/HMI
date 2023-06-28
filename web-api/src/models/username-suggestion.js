'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsernameSuggestionSchema = new Schema({
  value: { type: String, default: '' },
});

module.exports = mongoose.model(
  'usernamesuggestions',
  UsernameSuggestionSchema,
  'usernamesuggestions',
);
