import React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  RouteProps,
} from 'react-router-dom';

const redirectToHome = () => <Redirect to="/" />;

function LandingPageRoute(props: RouteProps) {
  const { render, ...rest } = props;

  const landingPageRender = (comProps: RouteComponentProps) => {
    return render ? render(comProps) : redirectToHome();
  };

  return <Route {...rest} render={landingPageRender} />;
}

export default LandingPageRoute;
