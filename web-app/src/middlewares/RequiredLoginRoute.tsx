import React, { useEffect, useState } from 'react';
import { Route, RouteProps } from 'react-router-dom';

import { useUser } from '../store/hooks';
import { ConfirmToLogin } from '../components/common/ConfirmToLogin';

interface Props extends RouteProps {
  cancelLoginPath?: string;
}

function RequiredLoginRoute(props: Props) {
  const { render, ...rest } = props;
  const user = useUser();
  const [isLoginShow, setIsLoginShow] = useState(false);

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setIsLoginShow(user.token === undefined);
      }, 100);
    }
  }, [user]);

  const handleLoginConfirmHide = (confirmProps: any) => {
    confirmProps.history.push(props.cancelLoginPath || '/');
    setIsLoginShow(false);
  };

  const renderRedirect = () => {
    if (user.token) {
      return render;
    } else {
      return () => (
        <ConfirmToLogin
          content="Login to show this page"
          isVisible={isLoginShow}
          onHide={handleLoginConfirmHide}
        />
      );
    }
  };

  return <Route {...rest} render={renderRedirect()} />;
}

export default RequiredLoginRoute;
