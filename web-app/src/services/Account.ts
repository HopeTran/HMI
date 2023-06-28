import qs from 'qs';
import axios from 'axios';
import { config } from 'config';

axios.defaults.baseURL = config.apiServerUrl;

const APIS = {
  UPDATE_PASSWORD: '/account/update-password',
  FORGOT_PASSWORD: '/account/forgot-password',
  GET_EMAIL_FROM_FORGOT_PASSWORD_TOKEN: '/account/get-email-from-forgot-password-token',
  CHANGE_PASSWORD: '/account/change-password',
  SOCIAL: '/account/social',
  SOCIAL_UNAUTHORIZE: '/account/social/unauthorize',
  ACCOUNT_INFO: '/account/info',
};

async function updatePassword(oldPassword: string, newPassword: string, twoFACode: string) {
  const { data } = await axios.put(APIS.UPDATE_PASSWORD, {
    oldPassword,
    newPassword,
    twoFACode,
  });
  return data;
}

async function forgotPassword(email: string, token: string) {
  return axios.post(APIS.FORGOT_PASSWORD, { email, token });
}

async function checkResetPasswordToken(token: string) {
  return axios.post(APIS.GET_EMAIL_FROM_FORGOT_PASSWORD_TOKEN, { token });
}

async function changePassword(token: string, password: string) {
  return axios.post(APIS.CHANGE_PASSWORD, { token, password });
}

async function activateAccount(code: string) {
  return axios.put(`/account/activate`, { code });
}


async function searchUser(searchValue: string, activeOnly?: boolean, fields?: any) {
  return axios.get('/account/search', {
    params: {
      value: searchValue,
      activeOnly,
      fields,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });
}

async function updateUserId(username: string) {
  const { data } = await axios.put('/account/update-user-id', {
    username,
  });
  return data;
}

async function updateDefaultCurrency(currency: string) {
  return axios.put('/account/update-default-currency', {
    currency,
  });
}

async function getUserIdSuggestion(username: string) {
  return axios.get('/account/get-userid-suggestion', {
    params: {
      username,
    },
  });
}
async function saveImage(image: any) {
  const formData = new FormData();
  formData.append('profileImage', image);
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  const { data } = await axios.post(`/account/profileImage`, formData, config);
  return data;
}

async function generateGoogleTwoFAKey() {
  return axios.get('/account/generate-g2fa-key');
}

async function storeGoogleTwoFAKey(values: any) {
  return axios.post('/account/store-g2fa-key', { ...values });
}

async function turnOffGoogleTwoFA(values: any) {
  return axios.post('/account/turn-off-g2fa', { ...values });
}

async function checkGoogleTwoFA(values: any) {
  return axios.post('/account/check-g2fa', { ...values });
}

async function login(values: any) {
  return axios.post('/account/login', { ...values });
}

async function updateEmailSetting(emailSetting: any) {
  return axios.put('/account/email-setting', emailSetting);
}

async function fetchSocial(): Promise<any> {
  const { data } = await axios.get(APIS.SOCIAL);
  return data;
}

async function unauthorizeSocial(social: string): Promise<any> {
  const { data } = await axios.post(`${APIS.SOCIAL_UNAUTHORIZE}/${social}`);
  return data;
}

async function fetchAccountInfo(): Promise<any> {
  const { data } = await axios.get(APIS.ACCOUNT_INFO);
  return data;
};

async function fetchAccountInfoById(id: any): Promise<any> {
  const { data } = await axios.get(`${APIS.ACCOUNT_INFO}/${id}`);
  return data;
};

async function updateAccountInfo(params: any): Promise<any> {
  const { data } = await axios.put(APIS.ACCOUNT_INFO, params );
  return data;
};

export default {
  updatePassword,
  forgotPassword,
  checkResetPasswordToken,
  changePassword,
  activateAccount,
  searchUser,
  updateUserId,
  updateDefaultCurrency,
  getUserIdSuggestion,
  saveImage,
  generateGoogleTwoFAKey,
  storeGoogleTwoFAKey,
  turnOffGoogleTwoFA,
  checkGoogleTwoFA,
  login,
  updateEmailSetting,
  fetchSocial,
  unauthorizeSocial,
  fetchAccountInfo,
  updateAccountInfo,
  fetchAccountInfoById,
};
