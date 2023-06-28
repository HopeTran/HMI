import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Redirect, RouteComponentProps } from 'react-router-dom';

import AccountService from 'services/Account';
import { setUser } from 'store/user/actions';
import CONSTANTS from 'constants/common';

export interface ActivationProps
  extends RouteComponentProps<{
    code: string;
  }> {}

export default function Activation(props: ActivationProps) {
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();

  const activateAccount = async (code: string) => {
    try {
      sessionStorage.setItem(CONSTANTS.STORAGE_KEY.SAVED_URL, '/');
      const { data } = await AccountService.activateAccount(code);
      dispatch(setUser(data));
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    activateAccount(props.match.params.code);
  }, [props.match.params.code]);

  return (
    <>
      {errorMessage ? (
        <Redirect
          to={{
            pathname: '/error',
            state: { message: errorMessage },
          }}
        />
      ) : (
        <div className="text-secondary">Loading...</div>
      )}
    </>
  );
}
