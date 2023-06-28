import { capitalize, sumBy } from 'lodash';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from 'primereact/button';

import { config } from 'config';
import { currency, orderTime } from 'components/common/templates/Templates';
import { formatPickedSchedule, roundPriceNumber } from 'utilities/common';
import storeBgDefault from '../../../../statics/images/store-bg-default.png';
import CONSTANTS from 'constants/common';
import ConfirmationDialog from 'components/common/ConfirmationDialog';
import hmiService from 'services/HomeMadeInn';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';

interface OrderHistoryItemProps {
  order: any;
  key: any;
  isReload: (e: any) => void;
}

export default function OrderHistoryItem(props: OrderHistoryItemProps) {
  const [isConfirmCancelOrder, setIsConfirmCancelOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>();

  const order = props.order;
  const intl = useIntl();

  const orderStatus = (status: string) => {
    if (status === CONSTANTS.ORDER_STATUS.WAIT_FOR_PAYMENT) {
      return intl.formatMessage({
        id: 't-waiting-for-store-confirm',
        defaultMessage: 'Waiting For Store Confirm',
      });
    }
    if (status === CONSTANTS.ORDER_STATUS.PROCESSING || status === CONSTANTS.ORDER_STATUS.NEED_TO_DELIVERY) {
      return intl.formatMessage({
        id: 't-preparing',
        defaultMessage: 'Preparing',
      });
    } else {
      return capitalize(status);
    }
  };

  const onHandleCancelOrder = (id: any) => {
    setIsConfirmCancelOrder(true);
    setSelectedOrder(id);
  };

  const onHandleDismissCancelOrder = () => {
    setIsConfirmCancelOrder(false);
    setSelectedOrder('');
  };

  const onHandleAcceptCancelOrder = async () => {
    await hmiService.deleteOrder(selectedOrder);
    setIsConfirmCancelOrder(false);
    setSelectedOrder('');
    props.isReload(true);
  };

  return (
    <div className="order-wrapper gap-4 d-block d-md-flex" key={props.key}>
      <div className="col-12 d-sm-flex gap-4">
        <img
          src={order?.storeInfo?.photo ? `${config.imageServerUrl}/${order?.storeInfo?.photo}` : storeBgDefault}
          width={130}
          height={130}
          alt="Meal"
          className="mb-4"
        />
        <div className="w-100 d-md-flex justify-content-between">
          <div className="col">
            <p>
              <span className="font-bold">{order?.storeInfo?.name}</span>
              <br />
              <span>{order?.storeInfo?.name}</span>
            </p>
            <p>
              <span className="font-bold">
                <FormattedMessage id="t-delivery-time" defaultMessage="Delivery time" />:
              </span>
              <br />
              <span className="text-normal">
                {order?.deliveryTime ? formatPickedSchedule(JSON.parse(order?.deliveryTime)) : ''}
              </span>
            </p>
            {orderTime(order, order.status)}
            <div className="d-flex gap-3">
              <p className="font-bold">
                <FormattedMessage id="t-status" defaultMessage="Status:" />
              </p>
              <p className={`status ${order.status} d-inline-flex gap-2 align-items-center`}>
                <span>{orderStatus(order.status)}</span>
              </p>
            </div>
          </div>

          <div className="col">
            <p className="font-bold">
              {sumBy(order.orderDetails, (item: any) => {
                return item.quantity;
              })}{' '}
              {intl.formatMessage({ id: 't-items', defaultMessage: 'Items' })}
            </p>
            {order.orderDetails.map((order: any, index: any) => {
              return (
                <p key={index}>
                  <span className="me-2">{order.quantity}</span>
                  <span>{order.product.name}</span>
                </p>
              );
            })}
          </div>
          <hr className="d-block d-md-none" />
          <p className="col font-bold d-flex">
            {currency(roundPriceNumber(order.subTotal), order?.storeInfo.currency || 'usd')}
          </p>
          <div className="d-block d-sm-flex gap-4 d-md-inline-block mt-4">
            <p className="col col-md-12">
              <NavLink to={`store-info/${order?.storeInfo?.id}`} className="btn-default w-100 d-inline-block">
                <FormattedMessage id="t-view-menu" defaultMessage="View Menu" />
              </NavLink>
            </p>
            <p className="col col-md-12">
              <NavLink to={`order-view/${order?.id}`} className="btn-default w-100 d-inline-block">
                <FormattedMessage id="t-view-order" defaultMessage="View Order" />
              </NavLink>
            </p>
            {order.status === CONSTANTS.ORDER_STATUS.WAIT_FOR_PAYMENT && (
              <p className="col col-md-12">
                <Button onClick={() => onHandleCancelOrder(order?.id)} className="btn-default p-link w-100 justify-content-center">
                  <FormattedMessage id="t-cancel-order" defaultMessage="Cancel Order" />
                </Button>
              </p>
            )}
          </div>
        </div>
      </div>
      <ConfirmationDialog
        visible={isConfirmCancelOrder}
        onAccept={onHandleAcceptCancelOrder}
        onDismiss={onHandleDismissCancelOrder}
        message={intl.formatMessage({
          id: 'm-are-you-sure-you-want-to-cancel-this-order?',
          defaultMessage: 'Are you sure you want to cancel this order?',
        })}
      />
    </div>
  );
}
