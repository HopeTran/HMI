import qs from 'qs';
import axios from 'axios';

import { config } from 'config';

axios.defaults.baseURL = config.apiServerUrl;

const ADMIN_APIS = {  
  USER_STATISTIC: '/admin/users-statistic',
  USER_ROLES: '/admin/user-roles',
  ROLES: '/admin/roles',
  PERMISSIONS: '/admin/permissions',
  BAN_USERS: '/admin/ban-users',
  UNBAN_USERS: '/admin/unban-users',
  CLOSE_USERS: '/admin/close-users',
  PASSWORD_VALIDATORS: '/admin/password-validators',
  LOGIN_ATTEMPT_SETTING: '/admin/login-attempts',
  TEMPORARY_LOCKED_USERS: '/admin/temporary-locked-users',
  USER_IDLE_TIMEOUT: '/admin/user-idle-timeout',
  CREATE_USER: '/admin/create-user',  
  UPDATE_USER: '/admin/update-user',
  USERS: '/admin/users',
  SOCIAL_SETTING: '/admin/social-setting',
};

async function fetchUserStatistics(params: {
  userSearchText: string;
  from: string;
  to: string;
  accountStatus: string;
  roles: string[];
  sortField: string;
  sortOrder: number;
  total: number;
  first: number;
  recordsPerPage: number;
  paging: boolean;
}) {
  return axios.get(ADMIN_APIS.USER_STATISTIC, {
    params,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });
}

async function getRoles(): Promise<any> {
  const { data } = await axios.get(`${ADMIN_APIS.ROLES}`);
  return data;
}

async function getPermissions(): Promise<any> {
  const { data } = await axios.get(`${ADMIN_APIS.PERMISSIONS}`);
  return data;
}

async function setUserRoles(userId: string, roles: any): Promise<any> {
  const { data } = await axios.post(`${ADMIN_APIS.USER_ROLES}`, {
    userId,
    roles,
  });
  return data;
}

async function addRole(role: any): Promise<any> {
  const { data } = await axios.post(`${ADMIN_APIS.ROLES}`, role);
  return data;
}

async function updateRole(role: any): Promise<any> {
  const { data } = await axios.put(`${ADMIN_APIS.ROLES}`, role);
  return data;
}

async function deleteRole(roleId: string): Promise<any> {
  const { data } = await axios.delete(`${ADMIN_APIS.ROLES}?roleId=${roleId}`);
  return data;
}

async function banUsers(userIds: string[], reason: string): Promise<any> {
  const { data } = await axios.put(`${ADMIN_APIS.BAN_USERS}`, {
    userIds,
    reason,
  });
  return data;
}

async function revokeBanUsers(userIds: string[]): Promise<any> {
  const { data } = await axios.put(`${ADMIN_APIS.UNBAN_USERS}`, {
    userIds,
  });
  return data;
}

async function closeUsers(userIds: string[], reason: string): Promise<any> {
  const { data } = await axios.put(`${ADMIN_APIS.CLOSE_USERS}`, {
    userIds,
    reason,
  });
  return data;
}

async function fetchPasswordValidators(): Promise<any> {
  const { data } = await axios.get(ADMIN_APIS.PASSWORD_VALIDATORS);
  return data;
}

async function updatePasswordValidators(validators: any): Promise<any> {
  const { data } = await axios.put(ADMIN_APIS.PASSWORD_VALIDATORS, {
    validators,
  });
  return data;
}

async function fetchLoginAttemptSetting(): Promise<any> {
  const { data } = await axios.get(ADMIN_APIS.LOGIN_ATTEMPT_SETTING);
  return data;
}

async function updateLoginAttemptSetting(attempts: Object): Promise<any> {
  const { data } = await axios.put(ADMIN_APIS.LOGIN_ATTEMPT_SETTING, {
    attempts,
  });
  return data;
}

async function fetchTemporaryLockedUsers(): Promise<any> {
  const { data } = await axios.get(ADMIN_APIS.TEMPORARY_LOCKED_USERS);
  return data;
}

async function updateUnlockingUser(userId: string): Promise<any> {
  const { data } = await axios.put(ADMIN_APIS.TEMPORARY_LOCKED_USERS, {
    userId,
  });
  return data;
}

async function fetchUserIdleTimeout(): Promise<any> {
  const { data } = await axios.get(ADMIN_APIS.USER_IDLE_TIMEOUT);
  return data;
}

async function updateUserIdleTimeout(timeout: number): Promise<any> {
  const { data } = await axios.put(ADMIN_APIS.USER_IDLE_TIMEOUT, {
    timeout,
  });
  return data;
}

async function createUser(
  email: string,
  username: string,
  password: string,
) {
  return axios.post(ADMIN_APIS.CREATE_USER, {
    email,
    username,
    password,
  });
}

async function updateUser(params: { userId: string; username?: string; password?: string }) {
  const { data } = await axios.put(ADMIN_APIS.UPDATE_USER, params);
  return data;
}

async function fetchUserById(userId: string) {
  const { data } = await axios.get(`${ADMIN_APIS.USERS}/${userId}`);
  return data;
}

async function fetchSocialSetting(): Promise<any> {
  const { data } = await axios.get(ADMIN_APIS.SOCIAL_SETTING);
  return data;
}

async function updateSocialSetting(setting: any): Promise<any> {
  const { data } = await axios.put(ADMIN_APIS.SOCIAL_SETTING, {
    setting,
  });
  return data;
}

export default {
  fetchUserStatistics,
  getRoles,
  getPermissions,
  setUserRoles,
  addRole,
  updateRole,
  deleteRole,
  banUsers,
  revokeBanUsers,
  closeUsers,
  fetchPasswordValidators,
  updatePasswordValidators,
  fetchLoginAttemptSetting,
  updateLoginAttemptSetting,
  fetchTemporaryLockedUsers,
  updateUnlockingUser,
  fetchUserIdleTimeout,
  updateUserIdleTimeout,
  createUser,
  updateUser,
  fetchSocialSetting,
  updateSocialSetting,
  fetchUserById,
};
