import AddOrEditOrderForm from 'components/common/AddOrEditOrderForm';
import StoreMap from 'components/common/StoreMap';
import { sumBy } from 'lodash';
import Cart from 'models/cart';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import hmiService from 'services/HomeMadeInn';
import { useCart, useUser } from 'store/hooks';
import { getCartLocalStorage } from 'utilities/common';

import storeBackgroundDefault from '../../../statics/images/store-bg-default.png';
import storeLogoDefault from '../../../statics/images/store-logo-default.jpg';
import './StoreListing.scss';

export default function ConfirmOrder(props: any) {
  const [totalPrice, setTotalPrice] = useState(0);
  const [orderedList, setOrderedList] = useState<Cart[]>([]);
  const [orderLocalStorage, setOrderLocalStorage] = useState<any>();

  const cartOrdered = useCart();
  const user = useUser();
  const dispatch = useDispatch();
  const initialLocalStorage = getCartLocalStorage();

  //Get initial cart
  const getCarts = async () => {
    if (initialLocalStorage) {
      setOrderLocalStorage(initialLocalStorage?.data);
    } else {
      if (user.token) {
        const data = await hmiService.getCarts();
        if (data.length > 0) {
          setOrderLocalStorage(data);
        }
      }
    }
  };

  const onHandleAddToCart = (numberOrder: any, productId: any) => {};

  useEffect(() => {
    getCarts();
  }, []);

  useEffect(() => {
    setOrderedList(orderLocalStorage);
    dispatch({ type: 'cart_order', cart: orderLocalStorage });
  }, [orderLocalStorage]);

  useEffect(() => {
    setOrderedList(cartOrdered.cart);
    setTotalPrice(
      sumBy(cartOrdered.cart, (item: any) => {
        return item.quantity * item.product.price;
      }),
    );
  }, [cartOrdered.cart]);

  const cartOrderTemplate = (product: any, index: number) => {
    return (
      <div key={index} className="d-flex justify-content-between align-items-center gap-4 mb-4">
        <div className="d-flex align-items-center gap-3">
          <AddOrEditOrderForm
            quantity={product.quantity}
            selectedProduct={product}
            onNumberOrderChange={onHandleAddToCart}
            hasAddToCartButton={false}
          />
          <span className="font-bold">{product?.product?.name}</span>
        </div>
        <div>NT $ {product?.product?.price}</div>
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      <div className="storeInformationDetail d-flex" style={{ backgroundImage: `url(${storeBackgroundDefault})` }}>
        <div className="store-information-wrapper section d-flex justify-content-between align-items-end w-100">
          <div className="clr-white">
            <div className="d-flex mb-3">
              <img className="me-3" src={storeLogoDefault} width={50} height={50} alt="Store logo" />
              <div>
                <h3><FormattedMessage id="t-kitchen-name" defaultMessage="Kitchen name" /></h3>
                <p><FormattedMessage id="t-chef-name" defaultMessage="Chef name " /></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="confirm-order-content d-flex gap-4 mb-5 col-md-9 justify-content-center m-auto">
        <div className="col-md-6 p-4">
          <StoreMap />
          <hr className="my-4" />
        </div>
        <div className="col-md-6 p-4">
          <div className="d-flex justify-content-between">
            {orderedList !== null && (
              <div>
                <h4 className="mb-4"><FormattedMessage id="t-your-items" defaultMessage="Your Items" /></h4>
                {orderedList &&
                  orderedList.map((item: any, index: number) => {
                    return cartOrderTemplate(item, index);
                  })}
              </div>
            )}
            <hr className="my-4" />
            <h4 className="mb-4"><FormattedMessage id="t-total-amount" defaultMessage="Total Amount" /></h4>
            <h4> NT $ {totalPrice.toFixed(2)}</h4>
          </div>
          <hr className="my-4" />
          <div className="btn-place-order"><FormattedMessage id="t-place-order" defaultMessage="Place Order" /></div>
        </div>
      </div>
    </div>
  );
}
