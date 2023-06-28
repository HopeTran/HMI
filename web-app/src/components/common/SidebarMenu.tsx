import CONSTANTS from 'constants/common';
import React, { useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';

import PermissionRequire from './PermissionRequire';
import { FormattedMessage } from 'react-intl';
function SidebarMenu(prop: any) {
  const [expandMenu, setExpandMenu] = useState(true);
  const handleExpandMenu = () => {
    setExpandMenu(!expandMenu);
  };
  return (
    <div id="sidebarMenu" className={`bg-white ${expandMenu ? 'shortMenu' : ''}`}>
      <div className="mb-2 w-full">
        <div className="tw-py-4 tw-items-center">
          <div className="logo">
            <span
              className={`expandIcon cursor-pointer ${expandMenu ? 'expand' : 'unexpand'}`}
              onClick={handleExpandMenu}
            ></span>
          </div>
          <ul className={`navbar ${expandMenu ? 'shortMenu' : ''}`}>
            <PermissionRequire permission={CONSTANTS.NPL_PERMISSIONS.CHEF}>
              <li>
                <NavLink to="/dashboard" exact className="nav-link">
                  <span className="icon dashboard"></span>
                  <span className="menu-title"><FormattedMessage id="t-dashboard" defaultMessage="Dashboard" /></span>
                </NavLink>
              </li>
            </PermissionRequire>
            <li>
              <NavLink to="/account" className="nav-link">
                <span className="icon account"></span>
                <span className="menu-title"><FormattedMessage id="t-account-info" defaultMessage="Account Info" /></span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/order/menu" className="nav-link">
                <span className="icon order"></span>
                <span className="menu-title"><FormattedMessage id="t-order" defaultMessage="Order" /></span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/favorite" className="nav-link">
                <span className="icon">
                  <i className="pi pi-heart" />
                </span>
                <span className="menu-title"><FormattedMessage id="t-favorite-stores" defaultMessage="Favorite Stores" /></span>
              </NavLink>
            </li>
            <PermissionRequire permission={CONSTANTS.NPL_PERMISSIONS.CHEF}>
              <li>
                <NavLink to="/store/menu" className="nav-link">
                  <span className="icon wallet"></span>
                  <span className="menu-title"><FormattedMessage id="t-menu" defaultMessage="Menu" /></span>
                </NavLink>
              </li>
            </PermissionRequire>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default withRouter(SidebarMenu);
