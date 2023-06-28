import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import { userSelector, newSignUpPageSelector } from './selectors';
import { setNewSignUpPage } from './user/actions';
import StoresFilter from 'models/storesFilter';

export function useCurrency() {
  return useSelector((state: any) => state.currency);
}

export function useCart() {
  return useSelector((state: any) => state.cart);
}

export function useFilterStore() {
  return useSelector((state: any) => {
    if (_.isEmpty(state.storesFilter)) {
      return new StoresFilter()
    } else {
      return state.storesFilter
    }
  });
}

export function useUser() {
  return useSelector(userSelector);
}

export function useNewSignUpPage() {
  const dispatch = useDispatch();
  return {
    newSignUpPage: useSelector(newSignUpPageSelector),
    setNewSignUpPage: (isNew: boolean) => dispatch(setNewSignUpPage(isNew)),
  };
}
