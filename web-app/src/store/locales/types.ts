export interface LocaleState {
  locale: string;
  messages: object;
}

export const UPDATE_LOCALE = 'UPDATE_LOCALE';

export interface UpdateLocaleAction {
  type: typeof UPDATE_LOCALE;
  payload: {
    locale: string;
    messages: object;
  };
}
