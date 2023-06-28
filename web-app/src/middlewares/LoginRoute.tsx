import React, { useEffect } from 'react';
import { Route, RouteComponentProps, RouteProps } from 'react-router-dom';

import CONSTANTS from '../constants/common';
import Login from '../components/page/Common/Login';
import { useUser } from '../store/hooks';

function LoginRoute(props: RouteProps) {
  const { render, ...rest } = props;

  const user = useUser();

  const renderLogin = (comProps: RouteComponentProps) => {
    // force logout if user navigate to activation link
    if (user.token) {
        setTimeout(() => {
          // Redirect to saved url if we have
          const savedUrl = sessionStorage.getItem(CONSTANTS.STORAGE_KEY.SAVED_URL);
          sessionStorage.removeItem(CONSTANTS.STORAGE_KEY.SAVED_URL);
        
          comProps.history.push(
            savedUrl
              ? savedUrl
              : ''
          );
        }); // Avoid error: Cannot update during an existing state transition
    } else {
      return render ? render(comProps) : <Login {...comProps} />;
    }
  };

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  return <Route {...rest} render={renderLogin} />;
}

export default LoginRoute;
