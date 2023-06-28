import React from 'react';
import { Redirect, Route, RouteProps, RouteComponentProps } from 'react-router-dom';

import CONSTANTS from '../constants/common';
import { useUser } from '../store/hooks';
import { ROUTES } from '../constants/constant';

interface Props extends RouteProps {
  admin?: boolean;
  requirePermission?: string;
}

function PrivateRoute(props: Props) {
  const { render, admin, requirePermission, ...rest } = props;
  const user = useUser();
  const redirectNotFound = () => {
    return (
      <Redirect
        to={{
          pathname: ROUTES.ERROR,
          state: {
            message: "Page Not Found"
          },
        }}
      />
    );
  };

  const redirectToLogin = (comProps: RouteComponentProps) => {
    sessionStorage.setItem(CONSTANTS.STORAGE_KEY.SAVED_URL, `${comProps.location.pathname}${comProps.location.search}`);
    return (
      <Redirect
        to={{
          pathname: ROUTES.LOGIN,
          state: { from: comProps.location },
        }}
      />
    );
  };

  const renderRedirect = () => {
    if (user.token) {
      if (admin && !user.hasPermission(CONSTANTS.NPL_PERMISSIONS.ADMIN)) {
        return redirectNotFound;
      }
      if (requirePermission && !user.hasPermission(requirePermission)) {
        return redirectNotFound;
      }
      return render;
    } else {
      if (props.path === '/') {
        return redirectToLogin;
      } else {
        return redirectNotFound;
      }
    }
  };

  return <Route {...rest} render={renderRedirect()} />;
}

export default PrivateRoute;