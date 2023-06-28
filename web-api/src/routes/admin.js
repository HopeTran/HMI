'use strict';

const Boom = require('@hapi/boom');

const accountService = require('../services/account');
const adminService = require('../services/admin');
const roleService = require('../services/role');
const appConfigService = require('../services/app-config');
const PERMISSIONS = require('../utils/permissions');
const UtilsFunc = require('../utils/utils-func');
const usersMemCacheService = require('../services/users-mem-cache');
const CONSTANT = require('../utils/constant');
const homeMadeInnService = require('../services/home-made-inn');
const { checkUserHasPermission } = require('../utils/user');

const APIs = {
  USER_STATISTIC: '/admin/users-statistic',
  USER_ROLES: '/admin/user-roles',
  ROLES: '/admin/roles',
  PERMISSIONS: '/admin/permissions',
  CREATE_USER: '/admin/create-user',
  UPDATE_USER: '/admin/update-user',
  USERS: '/admin/users',
  USER_BY_ID: '/admin/users/{id}',
  USER_IDLE_TIMEOUT: '/admin/user-idle-timeout',
  BAN_USERS: '/admin/ban-users',
  UNBAN_USERS: '/admin/unban-users',
  CLOSE_USERS: '/admin/close-users',
  PASSWORD_VALIDATORS: '/admin/password-validators',
};

const DEFAULT_ADMIN_AUTH = {
  strategy: 'jwt',
  scope: ['admin'],
};

module.exports = {
  name: 'routes-admin',
  version: '1.0.0',
  register: (server) => {
    server.route({
      method: 'GET',
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
          scope: [PERMISSIONS.API_PERMISSIONS.READ_USER.value],
        },
      },
      path: APIs.USER_STATISTIC,
      handler: async (request) => {
        return accountService.getUserStatistic(request.query);
      },
    });

    server.route({
      method: 'GET',
      path: APIs.ROLES,
      handler: () => {
        return roleService.getAllRoles();
      },
    });

    server.route({
      method: 'GET',
      path: APIs.PERMISSIONS,
      handler: () => {
        return PERMISSIONS.API_PERMISSIONS;
      },
    });

    server.route({
      method: 'POST',
      path: APIs.USER_ROLES,
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
          scope: [PERMISSIONS.API_PERMISSIONS.EDIT_USER_ROLE_SETTING.value],
        },
      },
      handler: async (request) => {
        const { userId, roles } = request.payload;
        const newRoles = await accountService.setRoles(userId, roles);
        const user = await adminService.getUserById(userId)
        await accountService.augmentRolesAndPermissions(user);
        if (user.permissions.includes('chef')) {
          await homeMadeInnService.createUser({ id: userId });
          const store = await homeMadeInnService.createStore({ userId, active: false });
          await accountService.updateAccountInfo(userId, {storeId: store.id});
        } else {
          await homeMadeInnService.updateStores({ id: user.storeId, active: false });
        }
        await accountService.forceLogoutUser(userId);
        return newRoles;
      },
    });

    server.route({
      method: 'POST',
      path: APIs.ROLES,
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
          scope: [PERMISSIONS.API_PERMISSIONS.EDIT_ROLE.value],
        },
      },
      handler: async (request) => {
        return roleService.addRole(request.payload);
      },
    });

    server.route({
      method: 'PUT',
      path: APIs.ROLES,
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
          scope: [PERMISSIONS.API_PERMISSIONS.EDIT_ROLE.value],
        },
      },
      handler: async (request) => {
        const result = await roleService.updateRole(request.payload);
        await accountService.forceLogoutUsersHaveGivenRole(request.payload._id);
        return result;
      },
    });

    server.route({
      method: 'DELETE',
      path: APIs.ROLES,
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
          scope: [PERMISSIONS.API_PERMISSIONS.EDIT_ROLE.value],
        },
      },
      handler: async (request) => {
        const { roleId } = request.query;
        await accountService.forceLogoutUsersHaveGivenRole(roleId);
        return roleService.deleteRole(roleId);
      },
    });

    server.route({
      method: 'POST',
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
          scope: [PERMISSIONS.API_PERMISSIONS.CREATE_USER.value],
        },
      },
      path: APIs.CREATE_USER,
      handler: async (request) => {
        const clientInfo = UtilsFunc.getClientInfo(request);
        const email = request.payload.email.toLowerCase();
        const userData = await accountService.register({
          ...request.payload,
          email,
          activated: true,
          createBySystem: true,
          clientInfo,
        });
        if (userData._id) {
          await homeMadeInnService.createUser({id: userData._id})
        }
        return userData;
      },
    });

    server.route({
      method: 'PUT',
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
          scope: [PERMISSIONS.API_PERMISSIONS.EDIT_USER.value],
        },
      },
      path: APIs.UPDATE_USER,
      handler: (request) => {
        return adminService.updateUser(
          {
            userId: request.payload.userId,
            username: request.payload.username,
            password: request.payload.password,
          },
          request.user,
        );
      },
    });

    server.route({
      method: 'GET',
      path: APIs.USERS,
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
        },
      },
      handler: async (request) => {
        return usersMemCacheService.getUsersByAccountIds(request.query.accountIds, request.query.isFullInfo);
      },
    });

    server.route({
      method: 'GET',
      path: APIs.USER_BY_ID,
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
        },
      },
      handler: async (request) => {
        return adminService.getUserById(request.params.id);
      },
    });

    server.route({
      method: 'GET',
      path: APIs.USER_IDLE_TIMEOUT,
      handler: async () => {
        return appConfigService.getAppConfigByKey(CONSTANT.KEY_CONFIG.USER_IDLE_TIMEOUT);
      },
    });

    server.route({
      method: 'PUT',
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
        },
      },
      path: APIs.USER_IDLE_TIMEOUT,
      handler: async (request) => {
        return appConfigService.updateAppConfigByKey(CONSTANT.KEY_CONFIG.USER_IDLE_TIMEOUT, request.payload.timeout);
      },
    });

    server.route({
      method: 'PUT',
      path: APIs.BAN_USERS,
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
          scope: [PERMISSIONS.API_PERMISSIONS.EDIT_USER.value],
        },
      },
      handler: async (request) => {
        const { userIds, reason } = request.payload;
        const banUsers = await accountService.banUsers({ userIds, reason });
        await accountService.forceLogoutUsers(userIds);
        return banUsers;
      },
    });

    server.route({
      method: 'PUT',
      path: APIs.UNBAN_USERS,
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
          scope: [PERMISSIONS.API_PERMISSIONS.EDIT_USER.value],
        },
      },
      handler: async (request) => {
        const { userIds } = request.payload;
        return accountService.revokeBanUsers({ userIds });
      },
    });

    server.route({
      method: 'PUT',
      path: APIs.CLOSE_USERS,
      config: {
        auth: {
          ...DEFAULT_ADMIN_AUTH,
          scope: [PERMISSIONS.API_PERMISSIONS.EDIT_USER.value],
        },
      },
      handler: async (request) => {
        const { userIds, reason } = request.payload;
        const unableClosedUsers = await adminService.closeUsers({ userIds, reason });
        await accountService.forceLogoutUsers(userIds);
        return unableClosedUsers;
      },
    });

    server.route({
      method: 'GET',
      path: APIs.PASSWORD_VALIDATORS,
      handler: async () => {
        return appConfigService.getAppConfigByKey(CONSTANT.KEY_CONFIG.PASSWORD_VALIDATORS);
      },
    });

  },
};
