import { AppState } from './index';

export const useCurrency = (state: AppState) => {
  return state.currency;
};

export const useCart = (state: AppState) => {
  return state.cart;
};

export const useFilterStore = (state: AppState) => {
  return state.storesFilter;
};

export const userSelector = (state: AppState) => {
  return state.user.user;
};

export const newSignUpPageSelector = (state: AppState) => state.user.newSignUpPage;

export const selectedLocale = (state: AppState) => state.locales.locale;
