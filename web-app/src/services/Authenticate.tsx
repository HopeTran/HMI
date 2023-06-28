import axios from 'axios';

async function verifyEmail(email: string, token: string) {
  return axios.post('/account/verify-email', { email, token });
}

async function createAccount(
  email: string,
  username: string,
  password: string,
  acceptTermsAt: number,
  code: string,
) {
  return axios.post('/account/register', {
    email,
    username,
    password,
    acceptTermsAt,
    code,
  });
}

async function createStore(
  storeName: string,
  storeAddress: string,
  storeFloor: string,
  storePhone: string,
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  password: string,
  acceptTermsAt: number,
  code: string,
) {
  return axios.post('/store/register', {
    storeName,
    storeAddress,
    storeFloor,
    storePhone,
    firstName,
    lastName,
    email,
    username,
    password,
    acceptTermsAt,
    code,
  });
}

async function activateUser(code: string) {
  return axios.put('/account/activate', { code });
}

async function loginWithSingleSignIn(token: string, twoFACode: string) {
  return axios.post('/social/login', { token, twoFACode });
}

async function registerWithSingleSignIn(
  token: string,
  acceptTermsAt: number,
) {
  return axios.post('/social/register', {
    token,
    acceptTermsAt,
  });
}

export default {
  verifyEmail,
  createAccount,
  createStore,
  activateUser,
  loginWithSingleSignIn,
  registerWithSingleSignIn,
};
