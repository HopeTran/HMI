import User from '../../models/user';

export interface UserState {
  user: User;
  newSignUpPage: false,
}

export const SET_USER = 'SET_USER';
export const RESET_DATA_FOR_ANONYMOUS = 'RESET_DATA_FOR_ANONYMOUS';
export const GET_USER_FROM_STORAGE = 'GET_USER_FROM_STORAGE';
export const SET_NEW_SIGN_UP_PAGE = 'SET_NEW_SIGN_UP_PAGE';

interface SetUserAction {
  type: typeof SET_USER;
  payload: User;
}

interface ResetDataForAnonymous {
  type: typeof RESET_DATA_FOR_ANONYMOUS;
  payload: any;
}


interface SetNewSignUpPage {
  type: typeof SET_NEW_SIGN_UP_PAGE;
  payload: any;
}


export type UserActionTypes =
  | SetUserAction
  | ResetDataForAnonymous
  | SetNewSignUpPage;
