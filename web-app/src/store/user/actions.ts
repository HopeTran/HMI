import { ThunkResult } from '..';
import User from '../../models/user';
import { RESET_DATA_FOR_ANONYMOUS, SET_USER, SET_NEW_SIGN_UP_PAGE, UserActionTypes } from './types';
import { getUserStorage, idleLogout, setAxiosHeaders, setUserStorage } from './utils';
import adminService from '../../services/Admin';

export function initUserFromStorage(): ThunkResult<void> {
  return (dispatch: any) => {
    const user = getUserStorage();
    if (user) {
      if (user.token) {
        setAxiosHeaders(user.token);
      }
      dispatch(setUser(user));
    }
  };
}

export function setUser(user: any): ThunkResult<void> {
  const newUser = new User(user);

  return async (dispatch: any) => {
    setUserStorage(newUser);
    setAxiosHeaders(newUser.token);

    if (newUser.token) {
      applyUserIdleTimeout();
    }

    dispatch({
      type: SET_USER,
      payload: newUser,
    });

    if (!newUser.token) {
      dispatch({
        type: RESET_DATA_FOR_ANONYMOUS,
        payload: {},
      });
    }
  };
}


export function setNewSignUpPage(isNew: boolean): UserActionTypes {
  return {
    type: SET_NEW_SIGN_UP_PAGE,
    payload: isNew,
  };
}

async function applyUserIdleTimeout() {
  const userIdleTimeout = await adminService.fetchUserIdleTimeout();
  userIdleTimeout && idleLogout(userIdleTimeout);
}
