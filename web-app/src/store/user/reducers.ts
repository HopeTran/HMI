import cloneDeep from 'lodash/cloneDeep';

import User from '../../models/user';
import {
  RESET_DATA_FOR_ANONYMOUS,
  SET_USER,
  SET_NEW_SIGN_UP_PAGE,
  UserActionTypes,
  UserState,
} from './types';

const initialState: UserState = {
  user: new User(),
  newSignUpPage: false,
};

export function userReducer(state = cloneDeep(initialState), action: UserActionTypes): UserState {
  switch (action.type) {
    case SET_USER: {
      return {
        ...state,
        user: action.payload,
      };
    }
    case RESET_DATA_FOR_ANONYMOUS: {
      return {
        ...cloneDeep(initialState),
      };
    }
    case SET_NEW_SIGN_UP_PAGE: {
      return {
        ...state,
        newSignUpPage: action.payload,
      };
    }
    default:
      return state;
  }
}
