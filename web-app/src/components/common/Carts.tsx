import { OverlayPanel } from 'primereact/overlaypanel';
import { useEffect, useRef, useState } from 'react';
import { sumBy } from 'lodash';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import { useCart, useUser } from 'store/hooks';
import CONSTANTS from 'constants/common';
import hmiService from 'services/HomeMadeInn';
import { getCartLocalStorage, setCartLocalStorage, setItemLocalStorage } from 'utilities/common';
import { config } from 'config';

import cartIcon from '../../statics/images/cart.png';
import CartItemsList from './CartItemsList';

function Carts({ history }: RouteComponentProps) {
  const [totalNumberOrder, setTotalNumberOrder] = useState(0);
  const storeCartItems = useRef<any>();
  const isFirst = useRef<boolean>(true);

  const cartOpRef = useRef<OverlayPanel>(null);

  storeCartItems.current = useCart();
  const user = useUser();

  const dispatch = useDispatch();
  const initialLocalStorage: any = getCartLocalStorage();
  //Get initial cart
  const getCartItems = async () => {
    if (user.token) {
      let cartItems = initialLocalStorage?.data;
      if (initialLocalStorage?.user !== user._id) {
        cartItems = await hmiService.getCarts();

        setCartLocalStorage(user._id, cartItems);
      }
      dispatch({ type: 'cart_order', cart: cartItems });
    } else {
      dispatch({ type: 'cart_order', cart: initialLocalStorage?.data });
    }
  };

  const fetchCartProductItemsInfo = async () => {
    if (storeCartItems?.current?.cart?.length > 0) {
      const ids = storeCartItems?.current?.cart
        ?.filter((item: any) => item.productId)
        .map((item: any) => {
          return item.productId;
        });
      if (ids.length > 0) {
        const data = await hmiService.getProducts({ ids, preloads: ['ScheduleMenus'] });

        const currentDay = moment().format('ddd');
        const productInvetory = data.reduce((obj: any, product: any) => {
          obj[product.id] = product.scheduleMenus?.find(
            (schedule: any) => schedule?.weekDay?.toUpperCase() === currentDay.toUpperCase(),
          );
          return obj;
        }, {});
        const cartItems: any[] = [];
        storeCartItems?.current?.cart?.forEach((item: any) => {
          cartItems.push({
            ...item,
            inventory: productInvetory[item.productId]?.active
              ? productInvetory[item.productId]?.inventoryLeft > 0
                ? productInvetory[item.productId]?.inventory - productInvetory[item.productId]?.inventoryLeft
                : productInvetory[item.productId]?.inventory
              : 0,
          });
        });
        dispatch({ type: 'cart_order', cart: cartItems });
      }
    } else {
      cartOpRef?.current?.hide();
    }
  };

  //Toogle Overlay Panel
  const handleCartClick = (e: any) => {
    if (cartOpRef && cartOpRef.current) {
      cartOpRef.current.toggle(e, null);
    }
  };

  useEffect(() => {
    getCartItems();
  }, [user.token]);

  //Parse cart order to ordered list, set total number order and total price
  useEffect(() => {
    // setOrderedList(storeCartItems?.current?.cart);
    setTotalNumberOrder(
      sumBy(storeCartItems?.current?.cart, (item: any) => {
        return item.quantity;
      }),
    );
    if (isFirst.current === true) {
      fetchCartProductItemsInfo();
      isFirst.current = false;
    }
  }, [storeCartItems?.current]);

  useEffect(() => {
    fetchCartProductItemsInfo();
  }, [cartOpRef.current]);

  useEffect(() => {
    setItemLocalStorage(CONSTANTS.STORAGE_KEY.PRE_LINK, null);
    getCartItems();
    fetchCartProductItemsInfo();

    const interval = setInterval(() => {
      fetchCartProductItemsInfo();
    }, config.intervalReloadInventory * 1000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return (
    <>
      <div className="cart">
        <div className="cartButton d-flex align-items-center" onClick={handleCartClick}>
          <img src={cartIcon} alt="Cart icon" />
          <span className="d-md-flex d-none px-2">
            <FormattedMessage id="t-cart" defaultMessage="Cart" />
          </span>
          {totalNumberOrder > 0 && <span className="px-2">{totalNumberOrder}</span>}
        </div>
        <OverlayPanel ref={cartOpRef} showCloseIcon id="overlay_panel" dismissable>
          <CartItemsList withCheckoutButton={true} />
        </OverlayPanel>
      </div>
    </>
  );
}

export default withRouter(Carts);
