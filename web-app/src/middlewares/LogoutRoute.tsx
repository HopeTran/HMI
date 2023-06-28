import StoresFilter from 'models/storesFilter';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import User from '../models/user';
import { setUser } from '../store/user/actions';

const redirectToHome = () => {
  return <Redirect to={'/'} />;
};

function LogoutRoute(props: RouteProps) {
  const { render, ...rest } = props;
  const dispatch = useDispatch();
  //Update cart before logout
  dispatch(setUser(new User()));
  dispatch({
    type: 'filter_store',
    filter: new StoresFilter(),
  })

  return <Route {...rest} render={redirectToHome} />;
}

export default LogoutRoute;
