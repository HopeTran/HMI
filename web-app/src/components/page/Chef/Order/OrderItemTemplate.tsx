import { findIndex, indexOf, sumBy, toUpper } from 'lodash';
import moment from 'moment';
import { useState, useEffect } from 'react';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { FormattedMessage } from 'react-intl';

import CONSTANTS, { REASON_CANCEL_ORDER_LIST } from 'constants/common';
import hmiService from 'services/HomeMadeInn';
import accountService from 'services/Account';
import { config } from 'config';
import ConfirmationWithReasonDialog from 'components/common/ConfirmationWithReasonDialog';
import { acceptOrderStatus, currency, orderStatus, orderTime } from 'components/common/templates/Templates';

import storeBgDefault from '../../../../statics/images/store-bg-default.png';

interface Props {
  order: any;
  changeStatus: (e: any) => void;
  onHandleViewOrderDetail?: (id: any) => void;
}

export default function OrderItemTemplate(props: Props) {
  const [timePickup, setTimePickup] = useState();
  const [searchDeliver, setSearchDeliver] = useState();
  const [customerInfo, setCustomerInfo] = useState<any>();
  const [isCancelOrder, setIsCancelOrder] = useState(false);
  const order = props.order;
  const photoIndex = findIndex(order?.orderDetails, (index: any) => index.product.photo !== null);

  //Get Customer Information
  const getCustomerInformation = async () => {
    const customers = await accountService.fetchAccountInfoById(order.userId);
    setCustomerInfo(customers);
  };
  //On handle submit status
  const onHandleChangeStatus = async (status: string, id: any) => {
    let nextStatus: any;
    const statusIndex = indexOf(Object.values(CONSTANTS.ORDER_STATUS), status);
    nextStatus = Object.values(CONSTANTS.ORDER_STATUS)[statusIndex + 1];

    try {
      await hmiService.updateOrder({
        status: nextStatus,
        deletedAt: status === CONSTANTS.ORDER_STATUS.CANCELED ? moment(new Date()) : null,
        id,
      });
      props.changeStatus(`${nextStatus}_${id}`);
    } catch (error) {}
  };

  //On handle cancel order
  const onHandleCancelOrder = async (reason: string) => {
    try {
      await hmiService.updateOrder({
        status: CONSTANTS.ORDER_STATUS.CANCELED,
        updatedAt: moment(new Date()),
        cancelReason: reason,
        id: order.id,
        weekDay: toUpper(order.weekDay),
        orderDetails: order.orderDetails,
        storeId: order.storeId,
      });
      props.changeStatus(true);
    } catch (error) {}
  };
  //On handle view order detail
  const onHandleOrderDetail = (orderId: any) => {
    if (props.onHandleViewOrderDetail) {
      props.onHandleViewOrderDetail(orderId);
    }
  };
  //Reject cancel order
  const onHandleRejectOrder = () => {
    setIsCancelOrder(false);
  };
  //Accept cancel order
  const onHandleConfirmCancelOrder = () => {
    setIsCancelOrder(true);
  };

  useEffect(() => {
    getCustomerInformation();
  }, [order]);

  useEffect(() => {
    if (order.status === CONSTANTS.ORDER_STATUS.DELIVERING) {
      // TODO: REMOVE THIS HARD CODE FOR CHANGE STATUS
      // Change status to arrived
      setTimeout(() => {
        onHandleChangeStatus(CONSTANTS.ORDER_STATUS.DELIVERING, order.id);
      }, 10000);

      // Change to completed
      setTimeout(() => {
        onHandleChangeStatus(CONSTANTS.ORDER_STATUS.ARRIVED, order.id);
      }, 20000);
    }
  }, [order.status]);

  return (
    <div className="order-wrapper mt-4 col-12 d-lg-flex">
      <div className="d-inline-block p-lg-4 border-right-lg-dashed col-lg-3">
        <p className="font-bold">
          {customerInfo?.firstName ? (
            <span>
              {customerInfo?.firstName} {customerInfo?.lastName}
            </span>
          ) : (
            customerInfo?.email
          )}
        </p>
        <p className="clr-viridian-green-light d-flex gap-4">
          <span className="text-overflow-1-v">{order.id}</span>
          <span>(OrderID)</span>
        </p>
        <p>{`Order day: ${order?.weekDay}`}</p>
        {orderTime(order, order.status)}
        <div className="d-flex gap-3 mb-3">
          <p><FormattedMessage id="t-status" defaultMessage="Status" />:</p>
          <p className={`status ${order.status}`}>{orderStatus(order.status)}</p>
        </div>
        <p>
          <img
            src={
              order?.orderDetails[photoIndex]?.product?.photo
                ? `${config.imageServerUrl}/${order?.orderDetails[photoIndex]?.product?.photo}`
                : storeBgDefault
            }
            width={130}
            height={130}
            alt="Meal"
          />
        </p>
      </div>
      <div className="bg-clr-alabaster p-lg-4 border-right-dashed col-lg-3">
        <p className="font-bold"><FormattedMessage id="t-instructions" defaultMessage="Instructions" /></p>
        <p className="text-small">{order.note}</p>
      </div>
      <div className="py-4 border-right-dashed col-lg-4">
        <p className="font-bold px-lg-4">
          {sumBy(order.orderDetails, (item: any) => {
            return item.quantity;
          })}{' '}
          <FormattedMessage id="t-items" defaultMessage="Items" />
        </p>
        {order.orderDetails.map((item: any, index: number) => {
          return (
            <div key={index}>
              <p className="px-lg-4">
                <span className="me-2">{item.quantity}</span>
                <span className="me-2">{item.product.name}</span>
                <span className="me-2">x</span>
                <span>{currency(item.price, order?.storeInfo.currency || 'usd')}</span>
                <span className="mx-2">=</span>
                <span>{currency(item.price * item.quantity , order?.storeInfo.currency || 'usd')}</span>
              </p>
              <p className="bg-clr-alabaster px-lg-4 py-2">
                <span className="text-overflow-1-v">{item.product.description}</span>
              </p>
            </div>
          );
        })}
      </div>
      <div className="p-lg-4 col-lg-2">
        {order.status === (CONSTANTS.ORDER_STATUS.WAIT_FOR_PAYMENT || CONSTANTS.ORDER_STATUS.PROCESSING) && (
          <div>
            <p className="font-bold d-flex">
              <span className="me-2 d-flex flex-grow-1"><FormattedMessage id="m-time-to-pick-up" defaultMessage="Time to pick up" /></span>
              <Calendar
                timeOnly
                showTime
                hourFormat="12"
                value={timePickup}
                onChange={(e: any) => setTimePickup(e.value)}
                className="d-flex flex-grow-1"
              ></Calendar>
            </p>
            <hr />
          </div>
        )}
        <div className="mt-4">
          {order.status !== CONSTANTS.ORDER_STATUS.COMPLETED &&
            order.status !== CONSTANTS.ORDER_STATUS.CANCELED &&
            order.status !== CONSTANTS.ORDER_STATUS.DELIVERING && (
              <p
                className="col-12 btn-default mb-3 text-center"
                onClick={() => onHandleChangeStatus(order.status, order.id)}
              >
                {acceptOrderStatus(order.status)}
              </p>
            )}
          {order.status === CONSTANTS.ORDER_STATUS.PROCESSING && (
            <p className="col-12 mb-3 d-flex gap-2">
              <span><FormattedMessage id="m-wait-for-pick-up" defaultMessage="Wait for pick up" /></span>
              <span className="p-input-icon-left h-25">
                <i className="pi pi-search" />
                <InputText
                  value={searchDeliver}
                  onChange={(e: any) => setSearchDeliver(e.target.value)}
                  placeholder="Searching deliver partner"
                />
              </span>
            </p>
          )}
          {order.status === CONSTANTS.ORDER_STATUS.WAIT_FOR_PAYMENT && (
            <div>
              <p className="col-12 btn-default mb-3 text-center"><FormattedMessage id="t-manage-order" defaultMessage="Magage Order" /></p>
              <p className="col-12 btn-default mb-3 text-center"><FormattedMessage id="t-call-customer" defaultMessage="Call Customer" /></p>
              <p className="col-12 btn-default mb-3 text-center" onClick={onHandleConfirmCancelOrder}>
              <FormattedMessage id="t-cancel-order" defaultMessage="Cancel Order" />
              </p>
            </div>
          )}
          {order.status === CONSTANTS.ORDER_STATUS.DELIVERING && (
            <div>
              <p className="d-flex gap-4">
                <span>Delivering:</span>
                <span>{searchDeliver}</span>
              </p>
              <p className="d-flex gap-4">
                <span>Est Arrived Time:</span>
                <span>{timePickup}</span>
              </p>
            </div>
          )}
        </div>
        <div>
          {order.status === CONSTANTS.ORDER_STATUS.COMPLETED && (
            <span className="clr-dell cursor-pointer" onClick={() => onHandleOrderDetail(order.id)}>
              <FormattedMessage id="t-order-detail" defaultMessage="Order Detail" />
            </span>
          )}
        </div>
      </div>
      <ConfirmationWithReasonDialog
        header="Are you sure to cancel this order?"
        visible={isCancelOrder}
        acceptText="Yes"
        dismissText="No"
        onAccept={onHandleCancelOrder}
        onDismiss={onHandleRejectOrder}
        defaultReason=""
        reasonList={REASON_CANCEL_ORDER_LIST}
      />
    </div>
  );
}
