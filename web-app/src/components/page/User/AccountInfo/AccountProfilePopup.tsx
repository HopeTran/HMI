import React from 'react';
import { FormattedMessage } from 'react-intl';
import { NavLink, RouteComponentProps, useHistory, withRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { findIndex } from 'lodash';

import CONSTANTS from 'constants/common';
import { ROUTES } from 'constants/constant';
import { useUser } from 'store/hooks';
import PermissionRequire from 'components/common/PermissionRequire';
import hmiService from 'services/HomeMadeInn';
import { getCartLocalStorage, setCartLocalStorage } from 'utilities/common';
import LanguageBox from 'components/common/LanguageBox';

function AccountProfilePopup(props: RouteComponentProps) {
  const user = useUser();
  const dispatch = useDispatch();
  const history = useHistory();

  const UserMenu = () => {
    return (
      <>
        <PermissionRequire permission={CONSTANTS.NPL_PERMISSIONS.USER}>
          <div className="menu-item mb-3">
            <NavLink to={'/account/info'}>
              <i className="pi pi-user-edit user-icon me-2" />
              <span><FormattedMessage id="t-account-info" defaultMessage="Account Info" /></span>
            </NavLink>
          </div>
        </PermissionRequire>
        <PermissionRequire permission={CONSTANTS.NPL_PERMISSIONS.USER}>
          <div className="menu-item mb-3">
            <NavLink to={'/favorite'}>
              <i className="pi pi-heart user-icon me-2" />
              <span><FormattedMessage id="t-favorite-stores" defaultMessage="Favorite Stores" /></span>
            </NavLink>
          </div>
        </PermissionRequire>

        <PermissionRequire permission={CONSTANTS.NPL_PERMISSIONS.USER}>
          <div className="menu-item mb-3">
            <NavLink to={'/order-history'}>
              <i className="pi pi-user-edit user-icon me-2" />
              <span><FormattedMessage id="t-my-orders" defaultMessage="My Orders" /></span>
            </NavLink>
          </div>
        </PermissionRequire>

        <PermissionRequire permission={CONSTANTS.NPL_PERMISSIONS.ADMIN}>
          <div className="menu-item mb-3">
            <NavLink to={ROUTES.ADMIN}>
              <i className="pi pi-th-large admin-icon me-2" />
              <span><FormattedMessage id="t-admin" defaultMessage="Admin" /></span>
            </NavLink>
          </div>
        </PermissionRequire>        
      </>
    );
  };

  //Update cart before logout
  const updateUserInfo = async () => {
    if (user.token) {
      const cartsLocalStorage = getCartLocalStorage();
      if (cartsLocalStorage?.data?.length > 0) {
        const cartItems = cartsLocalStorage?.data?.map((item: any) => {
          if (item.userId.length <= 0) {
            return {
              ...item,
              userId: user._id,
            };
          } else {
            return item;
          }
        });

        if (cartItems && cartItems.length > 0) {
          const savedCartItems = await hmiService.getCarts();
          await cartItems.map(async (cartItem: any) => {
            const findCartsIndex = findIndex(savedCartItems, (savedCartItem: any) => {
              return (savedCartItem.userId = user._id && savedCartItem.productId === cartItem.productId);
            });
            if (findCartsIndex > -1) {
              await hmiService.updateCartItem(cartItem);
            } else {
              //Check store id of saved cart items and current cart item, if it is different then remove it.  
              const deleteCartItems = savedCartItems?.filter((savedCartItem:any) => savedCartItem.product.storeId !== cartItem.product.storeId);
              deleteCartItems?.map(async(deleteCartItem:any)=>{
                await hmiService.deleteCartItem(deleteCartItem.productId);
              });
              
              await hmiService.addCartItem(cartItem);
            }
          });
        }
      }
      dispatch({ type: 'cart_order', cart: {} });
      setCartLocalStorage('', {});
      //Reset user to log out
      history.push('/logout');
    }
  };

  return (
    <div className="account-profile-popup">
      {user.token && (
        <>
          <div className="menu-content">
            <UserMenu />
          </div>          
          <div className="menu-bottom">
            <div className="logout">
              <div className="logout-link" onClick={updateUserInfo}>
                <i className="pi pi-sign-out logout-icon me-2" />
                <span><FormattedMessage id="c-logout" defaultMessage="Log out " /></span>
              </div>
            </div>
          </div>
          <div className="tw-flex tw-items-center tw-justify-end languages sm-lang">
            <LanguageBox />
          </div>
        </>
      )}
    </div>
  );
}

export default withRouter(AccountProfilePopup);
