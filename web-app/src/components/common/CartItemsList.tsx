import CONSTANTS from 'constants/common';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { useUser, useCart } from 'store/hooks';
import { isValidOrders, setCartLocalStorage, setItemLocalStorage } from 'utilities/common';
import hmiService from 'services/HomeMadeInn';
import AddOrEditOrderForm from './AddOrEditOrderForm';
import ErrorMessage from './ErrorMessage';
import { ROUTES } from 'constants/constant';
import { findIndex, sumBy } from 'lodash';
import { currency } from './templates/Templates';

interface Props extends RouteComponentProps {
  withCheckoutButton: boolean;
}
function CartItemsList({ history, withCheckoutButton }: Props) {
  const [storeInfoLocalStorage, setStoreInfoLocalStorage] = useState<any>({});
  const [totalNumberOrder, setTotalNumberOrder] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const storeCartItems = useRef<any>();

  storeCartItems.current = useCart();

  const user = useUser();
  const dispatch = useDispatch();
  const storeLocalStorage: any = localStorage.getItem(CONSTANTS.STORAGE_KEY.STORE_INFO);
  const intl = useIntl();

  const onHandleAddToCart = (numberOrder: any, productId: any) => {};
  const onHandleCheckout = async (e: any) => {
    if (!user.status) {
      setItemLocalStorage(CONSTANTS.STORAGE_KEY.PRE_LINK, 'confirm-order');
      history.push(ROUTES.LOGIN);
    } else {
      history.push('/confirm-order');
    }
  };

  //On handle delete cart item
  const onDeleteCartItem = async (productId: any) => {
    let _orderedList: any = [...storeCartItems?.current?.cart];
    const findCartIndex = findIndex(_orderedList, { productId: productId });
    _orderedList.splice(findCartIndex, 1);
    try {
      // TODO: must check user logged in or not before.
      if (user.status) {
        await hmiService.deleteCartItem(productId);
      }
    } catch (e) {
      console.error(e);
    }
    console.log(_orderedList);

    dispatch({ type: 'cart_order', cart: _orderedList });
    setCartLocalStorage(user._id, _orderedList);
  };

  //Get store from local storage
  useEffect(() => {
    if (storeLocalStorage !== 'undefined' && storeLocalStorage) {
      setStoreInfoLocalStorage(JSON.parse(storeLocalStorage));
    }
  }, [storeLocalStorage]);
  //Parse cart order to ordered list, set total number order and total price
  useEffect(() => {
    // setOrderedList(storeCartItems?.current?.cart);
    setTotalNumberOrder(
      sumBy(storeCartItems?.current?.cart, (item: any) => {
        return item.quantity;
      }),
    );
    setTotalPrice(
      sumBy(storeCartItems?.current?.cart, (item: any) => {
        return item.quantity * item.product?.price;
      }),
    );
  }, [storeCartItems?.current]);

  //   useEffect(() => {
  //     fetchCartItemsInfo();
  //   }, [cartOpRef.current]);

  useEffect(() => {
    setItemLocalStorage(CONSTANTS.STORAGE_KEY.PRE_LINK, null);
  }, []);

  const cartItemTemplate = (product: any, index: number) => {
    return (
      <div key={index} className="d-flex justify-content-between align-items-center gap-1 mb-4">
        <div className="d-flex flex-grow-1 align-items-center gap-3">
          <AddOrEditOrderForm
            quantity={product.quantity}
            selectedProduct={product}
            onNumberOrderChange={onHandleAddToCart}
            hasAddToCartButton={false}
          />
          <div className="d-flex flex-grow-1 justify-content-between gap-1">
            <span className="font-bold">{product?.product?.name}</span>
            {product?.quantity > product.inventory && <ErrorMessage message={`Max available ${product.inventory}`} />}
          </div>
        </div>
        <div className="d-flex gap-2">
          <div className="text-nowrap">
            {currency(product?.product?.price, storeInfoLocalStorage?.currency || 'usd')}
          </div>
          <div className="btn-delete" onClick={() => onDeleteCartItem(product.productId)}>
            Delete
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {withCheckoutButton ? (
        <div>
          {storeCartItems?.current?.cart && storeCartItems?.current?.cart.length > 0 ? (
            <div className="cart-overlay-panel">
              <div className="mb-4">
                <h4>Your order</h4>
                <p>
                  From <span className="clr-dell font-bold">{storeInfoLocalStorage?.name}</span>
                </p>
              </div>
              {storeCartItems?.current?.cart?.map((item: any, index: number) => {
                return cartItemTemplate(item, index);
              })}
              <div
                className={`checkOut d-flex justify-content-between my-4 ${
                  isValidOrders(storeCartItems?.current?.cart || []) ? '' : 'disabled'
                }`}
                onClick={(e) => onHandleCheckout(e)}
              >
                <span className="totalNumberOrder">{totalNumberOrder}</span>
                <span>Check out</span>
                <span>{currency(totalPrice, storeInfoLocalStorage?.currency || 'usd')}</span>
              </div>
            </div>
          ) : (
            intl.formatMessage({
              id: 'm-no-order',
              defaultMessage: 'No Order',
            })
          )}
        </div>
      ) : (
        <div>
          <div>
            {storeCartItems?.current?.cart?.map((item: any, index: number) => {
              return cartItemTemplate(item, index);
            })}
          </div>
          <hr className="my-4" />
          <div className="d-flex justify-content-between">
            <h4 className="mb-4">
              <FormattedMessage id="t-total-amount" defaultMessage="Total Amount" />
            </h4>
            <h4>{storeInfoLocalStorage && currency(totalPrice, storeInfoLocalStorage?.currency || 'usd')}</h4>
          </div>
        </div>
      )}
    </>
  );
}

export default withRouter(CartItemsList);
