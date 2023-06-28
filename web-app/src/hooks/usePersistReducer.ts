import { useCallback, useReducer } from 'react';

import useLocalStorage from './useLocalStorage';

const reducer = (state: any, payload: any) => {
  return payload;
}

const usePersistReducer = (storageKey: string, initialState: any) => {
  const [savedState, saveState] = useLocalStorage(
    storageKey,
    initialState,
  );

  const reducerLocalStorage = useCallback(
    (state, action) => {
      const newState = reducer(state, action);
      saveState(newState);
      return newState;
    },
    [saveState],
  );

  return useReducer(reducerLocalStorage, savedState);
}

export default usePersistReducer;
