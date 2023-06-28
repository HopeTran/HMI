import { LocaleState, UpdateLocaleAction, UPDATE_LOCALE } from './types';

const initState: LocaleState = {
  locale: 'en',
  messages: {},
};

const localesReducer = (
  state = initState,
  action: UpdateLocaleAction,
): LocaleState => {
  switch (action.type) {
    case UPDATE_LOCALE:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default localesReducer;
