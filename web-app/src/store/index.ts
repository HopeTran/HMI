import { applyMiddleware, combineReducers, createStore, compose } from 'redux';
import thunk, { ThunkDispatch, ThunkMiddleware, ThunkAction } from 'redux-thunk';

import { cartReducer, currencyReducer, filterStoreReducer } from './reducers';
import { userReducer } from './user/reducers';
import { UserActionTypes, UserState } from './user/types';
import localesReducer from './locales/reducers';
import { LocaleState, UpdateLocaleAction } from './locales/types';
export interface AppProps {
  user: UserState;
  locales: LocaleState;
}

export type AppState = ReturnType<typeof rootReducer>;
export type AppActions = UserActionTypes | UpdateLocaleAction;
export type AppDispatch = ThunkDispatch<AppState, undefined, AppActions>;
export type ThunkResult<R> = ThunkAction<R, AppState, undefined, AppActions>;

export const rootReducer = combineReducers({
  user: userReducer,
  locales: localesReducer,
  currency: currencyReducer,
  cart: cartReducer,
  storesFilter: filterStoreReducer,
});

const storeEnhancers = applyMiddleware(thunk as ThunkMiddleware<AppState, AppActions>);
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(rootReducer, composeEnhancers(storeEnhancers));

export default store;
