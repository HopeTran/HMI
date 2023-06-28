'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminActivitySchema = new Schema({
  type: { type: String },
  admin: { type: String },
  preState: { type: Schema.Types.Mixed },
  state: { type: Schema.Types.Mixed },
  table: { type: String },
  createdAt: { type: Date, default: Date.now() },
});

AdminActivitySchema.query.byTables = function(tables) {
  if (tables && tables.length > 0) {
    return this.where('table').in(tables);
  }
  return this;
};

AdminActivitySchema.query.byDateRange = function(from, to) {
  if (from && to) {
    return this.where('createdAt')
      .gte(from)
      .lt(to);
  }
  return this;
};

module.exports = mongoose.model('adminActivities', AdminActivitySchema, 'adminActivities');
