const AdminActivitySchema = require('../models/admin-activity');

function saveAdminActivities(admin, table, type, state, preState = null) {
  const activity = new AdminActivitySchema();
  activity.admin = admin;
  if (state) {
    activity.state = state;
  }
  activity.type = type;
  activity.table = table;
  if (preState) {
    activity.preState = preState;
  }
  return activity.save();
}

module.exports = {
  saveAdminActivities,
};
