import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import CONSTANTS from 'constants/common';
import StoreHeaderTemplate from 'components/common/StoreHeaderTemplate';
import { formatPickedSchedule } from 'utilities/common';
import { currency } from 'components/common/templates/Templates';

import mapDefault from "../../../../statics/images/map-default.png";
import '../../User/StoreListing/StoreListing.scss';


export default function OrderDelivering(props: any) {
  const [orderDetail, setOrderDetail] = useState<any>();
  const history = useHistory();

  const deliveryTime: any = JSON.parse(localStorage.getItem(CONSTANTS.STORAGE_KEY.STORE_FILTER) || '');

  const getOrderDetail = () => {
    const initialLocalStorage = localStorage.getItem(CONSTANTS.STORAGE_KEY.ORDER_DETAIL);
    if (initialLocalStorage) {
      setOrderDetail(initialLocalStorage ? JSON.parse(initialLocalStorage) : []);
    }
  };

  const handleOnClick = useCallback(() => history.push('/store-listing'), [history]);

  //Get initial cart
  useEffect(() => {
      getOrderDetail();
  }, []);

  const cartOrderTemplate = (product: any, index: number) => {
    return (
      <div key={index} className="d-flex justify-content-between align-items-center gap-4 mb-4">
        <div className="d-flex align-items-center gap-3">
          <span className="font-bold">{product?.name}</span>
        </div>
        <div className="d-flex gap-4">
          <span className="font-bold">{product?.quantity}</span>
          <span>x</span>
          <span className="font-bold">{currency(product?.price, orderDetail?.storeCurrency || 'usd')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="content-wrapper">
      <StoreHeaderTemplate />
      <div className="position-relative mb-4">
        <div className="back-to-store">
          <p className="back-to-category-list d-inline align-items-center mt-4 cursor-pointer" onClick={handleOnClick}>
            <i className="pi pi-angle-left w-bold" />
          </p>
        </div>
        {orderDetail &&
          <div className="confirm-order-content d-lg-flex gap-4 mb-4 col-lg-5 col-md-8 justify-content-center m-auto px-4">
            <div className="col-lg-12">
              <div className="mb-4">
                <img className="me-3 w-100" src={mapDefault} alt="Store logo" />
              </div>
              <div className="mb-4">
                  <h4 className="mb-4">Delivery time</h4>
                  <span>{formatPickedSchedule(deliveryTime)}</span>
              </div>
              <div className="d-flex justify-content-between mt-4">
                <h4 className="mb-4"><FormattedMessage id="t-total-amount" defaultMessage="Total Amount" /></h4>
                <h4>{currency(orderDetail?.subTotal, orderDetail?.storeCurrency || 'usd')}</h4>
              </div>
              {orderDetail?.orderDetails && orderDetail?.orderDetails?.map((item:any, index: number) => {
                return (
                  cartOrderTemplate(item, index)
                )}
              )}
              <hr className="my-4"/>
              <div className="d-flex justify-content-between mb-4">
                <p className="font-bold"><FormattedMessage id="t-amount" defaultMessage="Amount" /></p>
                <p className="font-bold">{currency(orderDetail.subTotal, orderDetail?.storeCurrency || 'usd')}</p>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  )
}
