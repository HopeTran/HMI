const _ = require('lodash');
const Boom = require('@hapi/boom');

const RoleSchema = require('../models/role');
const UserSchema = require('../models/user');
const PERMISSIONS = require('../utils/permissions');
const CONSTANT = require('../utils/constant');

async function getRole(roleId) {
  return RoleSchema.find({ _id: roleId });
}

async function getAllRoles() {
  return RoleSchema.find();
}

async function getRolesByIds(roleIds) {
  return RoleSchema.find({ _id: { $in: roleIds } });
}

async function getRoleByName(name) {
  const regex = new RegExp(['^', name.toLowerCase(), '$'].join(''), 'i');
  return RoleSchema.findOne({ name: regex });
}

async function addRole(role) {
  const roleInDB = await getRoleByName(role.name);
  if (roleInDB) {
    throw Boom.conflict('Role is existed');
  }
  if (role.permissions) {
    const allSupportedPermissions = Object.values(PERMISSIONS.API_PERMISSIONS).map((permission) => permission.value);
    role.permissions = _.intersection(role.permissions, allSupportedPermissions);
  }
  return new RoleSchema(role).save();
}

async function deleteRole(roleId) {
  // Remove the role Id out of all user's roles field
  await UserSchema.updateMany({ roles: roleId }, { $pull: { roles: { $in: [roleId] } } });

  return RoleSchema.remove({ _id: roleId });
}

async function updateRole(role) {
  if (role.permissions) {
    const allSupportedPermissions = Object.values(PERMISSIONS.API_PERMISSIONS).map((permission) => permission.value);
    role.permissions = _.intersection(role.permissions, allSupportedPermissions);
  }
  return RoleSchema.updateOne({ _id: role._id }, { $set: role });
}

async function migrateRoleForOldUsers() {
  const userRole = await getRoleByName(CONSTANT.PERMISSIONS.USER);
  if (userRole) {
    await UserSchema.updateMany(
      { roles: { $size: 0 } },
      {
        $set: {
          roles: [userRole._id],
        },
      },
    );
  }
  return 'ok';
}

module.exports = {
  getRole,
  getAllRoles,
  getRolesByIds,
  addRole,
  deleteRole,
  updateRole,
  migrateRoleForOldUsers,
  getRoleByName,
};
