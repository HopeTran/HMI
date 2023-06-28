import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { findIndex } from 'lodash';
import { FormattedMessage } from 'react-intl';

import hmiService from 'services/HomeMadeInn';
import StoreHeaderTemplate from 'components/common/StoreHeaderTemplate';
import OrderRating from 'components/common/OrderRating';
import CONSTANTS from 'constants/common';
import { currency } from 'components/common/templates/Templates';

import mapDefault from '../../../../statics/images/map-default.png';
import '../../User/StoreListing/StoreListing.scss';

export default function OrderView(props: any) {
  const [orderDetail, setOrderDetail] = useState<any>();

  const history = useHistory();
  const { id }: any = useParams();

  const onHandlePageReturn = () => {
    history.replace('/store-listing');
  };
  //Get order info by Id
  const getOrderInfoById = async (id: any) => {
    const data = await hmiService.getOrderById(id);
    console.log("data", data)
    const orderIndex = findIndex(data, { id: id });
    setOrderDetail(data[orderIndex]);
  };
  //Get initial cart
  useEffect(() => {
    if (id) {
      getOrderInfoById(id);
    }
  }, [id]);

  const cartOrderTemplate = (product: any, index: number) => {
    return (
      <div key={index} className="d-flex justify-content-between align-items-center gap-4 mb-4">
        <div className="d-flex align-items-center gap-3">
          <span className="font-bold">{product?.product.name}</span>
        </div>
        <div className="d-flex gap-4">
          <span className="font-bold">{product?.quantity}</span>
          <span>x</span>
          <span className="font-bold">{currency(product?.price, orderDetail?.storeInfo.currency || 'usd')}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      <StoreHeaderTemplate />
      <div className="position-relative mb-4">
        <div className="back-to-store">
          <p
            onClick={onHandlePageReturn}
            className="back-to-category-list d-inline align-items-center mt-4 cursor-pointer"
          >
            <i className="pi pi-angle-left w-bold" />
          </p>
        </div>
        {orderDetail && (
          <div className="confirm-order-content d-lg-flex gap-4 mb-4 col-lg-5 col-md-8 justidy-content-center m-auto">
            <div className="col-md-12">
              <div className="mb-4">
                <img className="me-3 w-100" src={mapDefault} alt="Store logo" />
              </div>
              {orderDetail.status === CONSTANTS.ORDER_STATUS.COMPLETED && (
                <OrderRating orderId={id} rating={orderDetail.rating} storeId={orderDetail.storeId} />
              )}
              <div className="d-flex justify-content-between mt-4">
                <h4 className="mb-4"><FormattedMessage id="t-total-amount" defaultMessage="Total Amount" /></h4>
                <h4>{currency(orderDetail.subTotal, orderDetail?.storeInfo.currency || 'usd')}</h4>
              </div>
              {orderDetail.orderDetails &&
                orderDetail.orderDetails.map((item: any, index: number) => {
                  return cartOrderTemplate(item, index);
                })}
              <hr className="my-4" />
              <div className="d-flex justify-content-between mb-4">
                <p className="font-bold"><FormattedMessage id="t-amount" defaultMessage="Amount" /></p>
                <p className="font-bold">{currency(orderDetail.subTotal, orderDetail?.storeInfo.currency || 'usd')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
