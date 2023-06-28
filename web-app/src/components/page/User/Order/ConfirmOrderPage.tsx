import { useEffect, useState } from 'react';
import { sumBy, toUpper } from 'lodash';
import moment from 'moment';
import { RouteComponentProps, Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

import OrderProgressing from 'components/page/User/Order/OrderProgressing';
import CONSTANTS, { DELIVERY_TYPES, WEEKDAYS } from 'constants/common';
import { useCart, useFilterStore, useUser } from 'store/hooks';
import Cart from 'models/cart';
import StoreHeaderTemplate from 'components/common/StoreHeaderTemplate';
import { formatPickedSchedule, isValidOrders, roundPriceNumber } from 'utilities/common';
import { config } from 'config';

import locationIcon from 'statics/images/locationIcon.svg';
import '../../User/StoreListing/StoreListing.scss';
import DeliveryTimeDropdown from 'components/common/DeliveryTimeDropdown';
import DeliveryAddressSelector from 'components/common/DeliveryAddressSelector';
import CartItemsList from 'components/common/CartItemsList';

export default function ConfirmOrderPage({ history }: RouteComponentProps) {
  const [totalPrice, setTotalPrice] = useState(0);
  const [orderedList, setOrderedList] = useState<Cart[]>([]);
  const [isOrderProgressingDialogVisible, setIsOrderProgressingDialogVisible] = useState(false);
  const [placeOrderData, setPlaceOrderData] = useState();
  const [customerAddress, setCustomerAddress] = useState<any>();
  const [customerName, setCustomerName] = useState<any>();
  const [customerPhone, setCustomerPhone] = useState<any>();
  const [deliveryTime, setDeliveryTime] = useState<any>({});

  const user = useUser();
  const filterStore = useFilterStore();

  const storeLocalStorage: any = localStorage.getItem(CONSTANTS.STORAGE_KEY.STORE_INFO);
  const filterLocalStorage: any = localStorage.getItem(CONSTANTS.STORAGE_KEY.STORE_FILTER);
  const carts = useCart();

  const containerStyle = {
    width: '100%',
    height: '300px',
  };
  const [latLng, setLatLng] = useState({
    lat: JSON.parse(filterLocalStorage).latitude || filterStore.latitude,
    lng: JSON.parse(filterLocalStorage).longitude || filterStore.longitude,
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: config.googleMapApiKey,
  });

  const onHandlePlaceOrder = () => {
    const orderDetail: any = orderedList.map((item: any) => {
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
        name: item.product.name,
      };
    });
    const data: any = {
      userId: user._id,
      storeId: JSON.parse(storeLocalStorage).id,
      subTotal: totalPrice,
      status: CONSTANTS.ORDER_STATUS.WAIT_FOR_PAYMENT,
      customerAddress: customerAddress,
      customerName: customerName,
      customerPhone: customerPhone,
      total: totalPrice,
      deliveryFee: 0,
      deliveryTime: JSON.stringify(deliveryTime),
      weekDay: filterStore.filter?.weekDay ? toUpper(filterStore.filter.weekDay) : WEEKDAYS[new Date().getDay()].value,
      createAt: moment(new Date()),
      orderDetails: orderDetail,
      storeCurrency: JSON.parse(storeLocalStorage).currency
    };
    setPlaceOrderData(data);
    setIsOrderProgressingDialogVisible(true);
  };

  const intData = () => {
    const initialCart = carts.cart;
    if (initialCart && initialCart.length > 0) {
      // Return home page if not enough items to order
      if (!isValidOrders(initialCart)) {
        history.push('/');
      }
      setOrderedList(initialCart);
      setTotalPrice(
        sumBy(initialCart, (item: any) => {
          return roundPriceNumber(item?.quantity * item?.product?.price);
        }),
      );
    }
  };

  const onHandleConfirmDialogDismissOrder = () => {
    setIsOrderProgressingDialogVisible(false);
  };

  useEffect(() => {
    setCustomerAddress(user?.address);
    setCustomerName(user.firstName ? user.firstName + user.lastName : user.username);
    setCustomerPhone(user.phoneNumbers[0]);
  }, [user]);

  useEffect(() => {
    if (filterLocalStorage) {
      setDeliveryTime({
        deliveryEndTime: JSON.parse(filterLocalStorage).deliveryEndTime,
        deliveryStartTime: JSON.parse(filterLocalStorage).deliveryStartTime,
        deliveryType: JSON.parse(filterLocalStorage).deliveryType,
        pickedDate: JSON.parse(filterLocalStorage).pickedDate,
        weekDay: JSON.parse(filterLocalStorage).weekDay,
      });
      setLatLng({
        lng: JSON.parse(filterLocalStorage).longitude,
        lat: JSON.parse(filterLocalStorage).latitude,
      });
      setCustomerAddress(JSON.parse(filterLocalStorage).deliveryAddress);
    } else {
      const deliveryTime = {
        deliveryEndTime: moment().format('HH:mm:ss'),
        deliveryStartTime: moment().format('HH:mm:ss'),
        deliveryType: DELIVERY_TYPES[0].value,
        pickedDate: moment().format('MMM Do'),
        weekDay: moment().format('ddd'),
      };
      setDeliveryTime(deliveryTime);
      localStorage.setItem(CONSTANTS.STORAGE_KEY.STORE_FILTER, JSON.stringify(deliveryTime));
    }
  }, [filterLocalStorage, filterStore]);

  useEffect(() => {
    intData();
    if (!carts.cart || carts.cart.length === 0) {
      history.push('/');
    }
  }, [carts]);

  return (
    <div className="content-wrapper">
      <StoreHeaderTemplate />
      <div className="confirm-order-content d-lg-flex gap-4 mb-5 col-md-9 justify-content-center m-auto">
        <div className="col-lg-6 p-4">
          <h4 className="mb-4">Delivery location</h4>
          <div className="d-flex mb-4 align-items-center">
            <img src={locationIcon} alt="location" className="me-1" />
            <span className="font-bold">{customerAddress}</span>
          </div>
          <div className="mb-4">
            {isLoaded && (
              <GoogleMap mapContainerStyle={containerStyle} center={latLng} zoom={18}>
                <MarkerF position={latLng}></MarkerF>
              </GoogleMap>
            )}
          </div>
          <div className="d-block gap-xl-4 gap-2 col-12 justify-content-center">
            <div className="mb-3">
              <DeliveryAddressSelector />
            </div>
            <div className="">
              <DeliveryTimeDropdown />
            </div>
          </div>
          <hr className="my-4" />
          <div>
            <h4 className="mb-4">Delivery time</h4>
            <span>{formatPickedSchedule(deliveryTime)}</span>
          </div>
        </div>
        <div className="col-lg-6 p-4">
          <div>
            <div className="d-flex justify-content-between mb-4 align-items-center">
              <h4 className="mb-0">Your items</h4>
              <Link to={{ pathname: `/store-info/${JSON.parse(storeLocalStorage).id}` }}>
                <button className="btn btn-buy-more">
                  <FormattedMessage id="t-buy-more" defaultMessage="Buy more" />
                </button>
              </Link>
            </div>
            <CartItemsList withCheckoutButton={false} />
          </div>

          <hr className="my-4" />

          <div className="btn-place-order" onClick={onHandlePlaceOrder}>
            Place Order
          </div>
        </div>
      </div>
      <OrderProgressing
        header="Confirm"
        visible={isOrderProgressingDialogVisible}
        onDismiss={onHandleConfirmDialogDismissOrder}
        data={placeOrderData}
      />
    </div>
  );
}
