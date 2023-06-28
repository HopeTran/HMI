import CONSTANTS from "constants/common";
import StoresFilter from "models/storesFilter";
import { setItemLocalStorage } from "utilities/common";

const currencyInitialState = {
  currency: 'BTC',
  currencyOption: 'USD',
  change: '24',
};

const cartInitialState = {
  cart: [],
};

const storesFilterInitialState: StoresFilter = new StoresFilter();

export const currencyReducer = (state = currencyInitialState, action: any) => {
  switch (action.type) {
    case 'currency':
      return {
        ...state,
        currency: action.currency,
        currencyOption: action.currencyOption,
        change: action.change,
      };
    default:
      return state;
  }
};

export const cartReducer = (state = cartInitialState, action: any) => {
  switch (action.type) {
    case 'cart_order':
      return {
        ...state,
        cart: action.cart,
      };
    default:
      return state;
  }
};

export const filterStoreReducer = (state = storesFilterInitialState, action: any) => {
  switch (action.type) {
    case 'filter_store':
      setItemLocalStorage(CONSTANTS.STORAGE_KEY.STORE_FILTER, action.filter);
      return {
        ...state,
        ...action.filter,
      };
    default:
      return state;
  }
};
