import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Switch, RouteComponentProps } from 'react-router-dom';
import { ReactQueryConfigProvider } from 'react-query';
import { Provider } from 'react-redux';

import NplIntlProvider from './containers/NplIntlProvider';
import Header from 'components/common/Header';
import { ROUTES } from './constants/constant';
import CONSTANTS from './constants/common';
import store from './store';
import { initUserFromStorage } from './store/user/actions';
import { updateLocalesThunk } from './store/locales/actions';
import Favorite from 'components/page/User/Favorite/Favorite';
import { initCartItems } from 'store/cart/actions';

const Landing = lazy(() => import('./components/page/Common/Landing'));
const LoginRoute = lazy(() => import('./middlewares/LoginRoute'));
const LogoutRoute = lazy(() => import('./middlewares/LogoutRoute'));
const PrivateRoute = lazy(() => import('./middlewares/PrivateRoute'));
const ForgotPassword = lazy(() => import('./components/page/Common/Login/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/page/Common/Login/ResetPassword'));
const ErrorPage = lazy(() => import('./components/common/ErrorPage'));
const ChefDashboard = lazy(() => import('./components/page/Chef/Dashboard'));
const Admin = lazy(() => import('./components/page/Admin/Admin'));
const Register = lazy(() => import('./components/page/Common/Login/Register'));
const StoreRegister = lazy(() => import('./components/page/Common/Login/StoreRegister'));
const Activation = lazy(() => import('./components/page/Common/Login/Activation'));
const RegisterThankyou = lazy(() => import('./components/page/Common/Login/RegisterThankyou'));
const AccountInfo = lazy(() => import('./components/page/User/AccountInfo'));
const StoreMenu = lazy(() => import('./components/page/Chef/Store/StoreMenu'));
const OrderMenu = lazy(() => import('./components/page/Chef/Order'));
const StoreListing = lazy(() => import('./components/page/User/StoreListing'));
const CategoryDetail = lazy(() => import('./components/page/User/StoreListing/CategoryDetail'));
const StoreInformationDetail = lazy(() => import('./components/page/User/StoreListing/StoreInformationDetail'));
const ConfirmOrderPage = lazy(() => import('./components/page/User/Order/ConfirmOrderPage'));
const OrderDelivering = lazy(() => import('./components/page/User/Order/OrderDelivering'));
const OrderHistory = lazy(() => import('./components/page/User/Order/OrderHistory'));
const OrderView = lazy(() => import('./components/page/User/Order/OrderView'));

const queryConfig = { queries: { refetchOnWindowFocus: false, retry: false } };

store.dispatch(updateLocalesThunk(''));
store.dispatch(initUserFromStorage());
store.dispatch(initCartItems());

function App() {
  const renderErrorPage = (routeProps: RouteComponentProps) => {
    return <ErrorPage error={routeProps.location.state} />;
  };
  const renderLanding = (props: RouteComponentProps) => {
    return <Landing {...props} />;
  };
  const renderChefDashboard = (props: RouteComponentProps) => {
    return <ChefDashboard {...props} />;
  };
  const renderAdmin = (props: RouteComponentProps) => {
    return <Admin {...props} />;
  };
  const renderForgotPassword = (props: RouteComponentProps) => {
    return <ForgotPassword {...props} />;
  };
  const renderResetPassword = (props: RouteComponentProps) => {
    return <ResetPassword {...props} />;
  };
  const renderRegister = (props: RouteComponentProps) => {
    return <Register {...props} />;
  };
  const renderStoreRegister = (props: RouteComponentProps) => {
    return <StoreRegister {...props} />;
  };
  const renderRegisterThankyou = (props: RouteComponentProps) => {
    return <RegisterThankyou />;
  };
  const renderActivation = (props: any) => {
    return <Activation {...props} />;
  };

  const renderAccountInfo = (props: RouteComponentProps) => {
    return <AccountInfo {...props} />;
  };

  const renderAccountFavorite = (props: RouteComponentProps) => {
    return <Favorite />;
  };

  const renderStoreMenu = (props: RouteComponentProps) => {
    return <StoreMenu {...props} />;
  };

  const renderOrderMenu = (props: RouteComponentProps) => {
    return <OrderMenu {...props} />;
  };

  const renderStoreListing = (props: RouteComponentProps) => {
    return <StoreListing {...props} />;
  };

  const renderCategoryDetail = (props: RouteComponentProps) => {
    return <CategoryDetail {...props} />;
  };

  const renderStoreInformationDetail = (props: RouteComponentProps) => {
    return <StoreInformationDetail {...props} />;
  };

  const renderConfirmOrderPage = (props: RouteComponentProps) => {
    return <ConfirmOrderPage {...props} />;
  };

  const renderOrderDelivering = (props: RouteComponentProps) => {
    return <OrderDelivering {...props} />;
  };

  const renderOrderHistory = (props: RouteComponentProps) => {
    return <OrderHistory {...props} />;
  };

  const renderOrderView = (props: RouteComponentProps) => {
    return <OrderView {...props} />;
  };

  return (
    <div className="App">
      <ReactQueryConfigProvider config={queryConfig}>
        <Provider store={store}>
          <NplIntlProvider>
            <BrowserRouter>
              <Header />
              <div id="main">
                <div className="content">
                  <Suspense fallback={<div>Loading...</div>}>
                    <Switch>
                      <Route exact path="/" render={renderLanding} />
                      <Route exact path="/store-listing" render={renderStoreListing} />
                      <Route exact path="/store-listing/:category" render={renderCategoryDetail} />
                      <Route exact path="/store-info/:storeId" render={renderStoreInformationDetail} />
                      <PrivateRoute
                        path="/dashboard"
                        requirePermission={CONSTANTS.NPL_PERMISSIONS.USER}
                        render={renderChefDashboard}
                      />
                      <PrivateRoute
                        path="/account"
                        requirePermission={CONSTANTS.NPL_PERMISSIONS.USER}
                        render={renderAccountInfo}
                      />
                      <PrivateRoute
                        exact
                        path="/store"
                        requirePermission={CONSTANTS.NPL_PERMISSIONS.CHEF}
                        render={renderAccountInfo}
                      />
                      <PrivateRoute path="/store/menu" render={renderStoreMenu} />
                      <PrivateRoute path="/order/menu" render={renderOrderMenu} />
                      <PrivateRoute
                        exact
                        path="/confirm-order"
                        requirePermission={CONSTANTS.NPL_PERMISSIONS.USER}
                        render={renderConfirmOrderPage}
                      />
                      <PrivateRoute
                        path="/favorite"
                        requirePermission={CONSTANTS.NPL_PERMISSIONS.USER}
                        render={renderAccountFavorite}
                      />
                      <PrivateRoute
                        exact
                        path="/order-delivering"
                        requirePermission={CONSTANTS.NPL_PERMISSIONS.USER}
                        render={renderOrderDelivering}
                      />
                      <PrivateRoute
                        exact
                        path="/order-view/:id"
                        requirePermission={CONSTANTS.NPL_PERMISSIONS.USER}
                        render={renderOrderView}
                      />
                      <PrivateRoute
                        exact
                        path="/order-history"
                        requirePermission={CONSTANTS.NPL_PERMISSIONS.USER}
                        render={renderOrderHistory}
                      />
                      <PrivateRoute path="/admin" admin={true} render={renderAdmin} />
                      <LoginRoute path={ROUTES.LOGIN} />
                      <LogoutRoute path={ROUTES.LOGOUT} />
                      <LoginRoute path={ROUTES.FORGOT_PASSWORD} render={renderForgotPassword} />
                      <LoginRoute path={ROUTES.RESET_PASSWORD} render={renderResetPassword} />
                      <LoginRoute
                        exact={true}
                        path={['/register/thankyou', '/register/thankyou-special-aff']}
                        render={renderRegisterThankyou}
                      />
                      <LoginRoute exact={true} path={ROUTES.REGISTER} render={renderRegister} />
                      <LoginRoute exact={true} path={ROUTES.STORE_REGISTER} render={renderStoreRegister} />
                      <LoginRoute path="/activate-account/:code" render={renderActivation} />
                      <Route path="/error" render={renderErrorPage} />
                    </Switch>
                  </Suspense>
                </div>
              </div>
            </BrowserRouter>
          </NplIntlProvider>
        </Provider>
      </ReactQueryConfigProvider>
    </div>
  );
}
export default App;
