import { useSelector } from 'react-redux';

import { ThunkResult } from '../index';
import { UpdateLocaleAction, UPDATE_LOCALE } from './types';
import { selectedLocale } from '../selectors';
import CONSTANTS from '../../constants/common';

export function updateLocalesThunk(locale: string): ThunkResult<void> {
  return (dispatch) => {
    if (locale === '') {
      locale = localStorage.getItem(CONSTANTS.STORAGE_KEY.LANGUAGE) || 'en';
    }
    localStorage.setItem(CONSTANTS.STORAGE_KEY.LANGUAGE, locale);
    import(`../../statics/i18n/${locale}.js`).then((data: any) => {
      dispatch(updateLocales(locale, data.default));
      // Update zendesk language
      // if ((window as any).zE) (window as any).zE('webWidget', 'setLocale', locale);
    });
  };
}

export function useLocaleAction() {
  return useSelector(selectedLocale);
}

const updateLocales = (locale: string, messages: object): UpdateLocaleAction => ({
  type: UPDATE_LOCALE,
  payload: {
    locale,
    messages,
  },
});
