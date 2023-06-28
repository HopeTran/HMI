import { ThunkResult } from '..';
import { getCartLocalStorage, setCartLocalStorage } from './../../utilities/common';
import hmiService from 'services/HomeMadeInn';
import { getUserStorage } from 'store/user/utils';

export function initCartItems(): ThunkResult<void> {
  return async (dispatch: any) => {
    const user = getUserStorage();
    const initialLocalStorage = getCartLocalStorage();

    if (user?.token) {
      let cartItems = initialLocalStorage?.data;
      if (initialLocalStorage?.user !== user._id) {
        cartItems = await hmiService.getCarts();

        setCartLocalStorage(user._id, cartItems);
      }
      dispatch({ type: 'cart_order', cart: cartItems });
    } else {
      dispatch({ type: 'cart_order', cart: initialLocalStorage?.data });
    }
  };
}

