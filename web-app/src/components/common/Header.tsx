import React from 'react';
import { NavLink, useLocation, withRouter } from 'react-router-dom';

import UserInfo from 'components/common/UserInfo';
import PermissionRequire from 'components/common/PermissionRequire';
import CONSTANTS from 'constants/common';
import { useUser } from 'store/hooks';
import Carts from './Carts';
import LanguageBox from './LanguageBox';
import DeliveryTimeDropdown from './DeliveryTimeDropdown';
import DeliveryAddressSelector from './DeliveryAddressSelector';

import Logo from '../../statics/images/headerLogo.svg';
import accountIcon from '../../statics/images/accountIcon.svg';

Header.propTypes = {};

function Header(prop: any) {
  const user = useUser();
  const location = useLocation();

  const routes = ['/store/register', '/login', '/register', '/forgot-password'];

  return (
    <>
      {!routes.includes(location.pathname) && (
        <div id="header" className="col-12">
          <div className="d-flex justify-content-between align-items-center col-12 ">
            <div className="d-flex align-items-center">
              <NavLink to="/">
                <img src={Logo} alt="Logo" />
              </NavLink>
            </div>

            <div className="d-flex gap-xl-4 gap-md-3 gap-2 align-items-center">
              {location.pathname !== '/confirm-order' && <Carts />}

              <div className={`${!user.status ? 'd-inline-flex' : 'languages md-lang'}`}>
                <LanguageBox />
              </div>

              {!user.status && (
                <div className="d-none d-sm-inline-flex">
                  <NavLink to="/login">
                    {user.status && <img src={accountIcon} alt="accountIcon" className="me-2" />}
                    <span className="clr-green-house font-bold">Log in</span>
                  </NavLink>
                </div>
              )}
              <PermissionRequire permission={CONSTANTS.NPL_PERMISSIONS.USER}>
                <UserInfo />
              </PermissionRequire>
            </div>
          </div>
          {location.pathname === '/store-listing' && (
            <div className="search-address justify-content-center">
              <div className="d-block d-lg-flex gap-xl-4 gap-2 col-12 justify-content-center">
                <DeliveryTimeDropdown />
                <DeliveryAddressSelector />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default withRouter(Header);
