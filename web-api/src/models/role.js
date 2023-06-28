'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
  name: { type: String, default: null },
  description: { type: String, default: null },
  permissions: { type: [String], default: [] },
  system: { type: Boolean, default: false },
});

module.exports = mongoose.model('role', RoleSchema, 'role');
