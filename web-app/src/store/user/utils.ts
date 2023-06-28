import axios from 'axios';

import CONSTANTS from 'constants/common';
import User from 'models/user';
import { ROUTES } from 'constants/constant';

// tslint:disable-next-line:no-string-literal
delete axios.defaults.headers['api-token'];

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: any) => {
    if (error.response && error.response.status === CONSTANTS.HTTP_STATUS.UNAUTHORIZED) {
      if (getUserStorage()) {
        logout();
      }
    } else {
      return Promise.reject(error);
    }
  },
);

export const setAxiosHeaders = (token: string) => {
  if (token) {
    // tslint:disable-next-line:no-string-literal
    axios.defaults.headers['Authorization'] = 'Bearer ' + token;
  } else {
    // tslint:disable-next-line:no-string-literal
    delete axios.defaults.headers['Authorization'];
  }
};

export const getUserStorage = () => {
  if (localStorage.getItem(CONSTANTS.STORAGE_KEY.USER_INFO)) {
    const daibiUser = JSON.parse(localStorage.getItem(CONSTANTS.STORAGE_KEY.USER_INFO) || '{}');
    const expireDate = new Date(daibiUser.user.expiredDate);
    const currentDate = new Date();

    if (expireDate.getTime() > currentDate.getTime()) {
      return daibiUser.user;
    }
  }

  return undefined;
};

export const setUserStorage = (newUser: User) => {
  if (newUser.token) {
    const userStorage = {
      user: newUser,
    };
    localStorage.setItem(CONSTANTS.STORAGE_KEY.USER_INFO, JSON.stringify(userStorage));
  } else {
    localStorage.removeItem(CONSTANTS.STORAGE_KEY.USER_INFO);
  }
};

export const logout = () => {
  window.location.href = ROUTES.LOGOUT;
};

/**
 * Automatically logout when timeout is reached
 * @param timeout: in minutes
 */
export const idleLogout = (timeout: number) => {
  let timer: any;
  window.onload = resetTimer;
  window.onmousemove = resetTimer;
  window.onmousedown = resetTimer;
  window.ontouchstart = resetTimer;
  window.onclick = resetTimer;
  window.onkeypress = resetTimer;
  window.addEventListener('scroll', resetTimer, true);

  function resetTimer() {
    clearTimeout(timer);
    timer = setTimeout(logout, timeout * 60 * 1000);
  }
};
