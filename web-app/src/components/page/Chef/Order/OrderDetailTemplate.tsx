import { sumBy } from 'lodash';
import { useEffect, useState } from 'react';

import accountService from 'services/Account';
import hmiService from 'services/HomeMadeInn';
import { orderStatus } from 'components/common/templates/Templates';
import { roundPriceNumber } from 'utilities/common';
import { FormattedMessage } from 'react-intl';

interface Props {
  orderId: any;
  onHandleTurnBack: (e: any) => void;
}

export default function OrderDetailTemplate(props: Props) {
  const [order, setOrder] = useState<any>();

  const getCustomerInformation = async () => {
    const data = await hmiService.getOrderById(props.orderId);
    if (data) {
      const customer = await accountService.fetchAccountInfoById(data[0].userId);
      const customerInfo = {
        name: customer.firstName ? customer.firstName + customer.lastName : customer.email,
        address: customer.address,
        contactPhone: customer.phoneNumbers[0],
      };
      setOrder({ ...data[0], customerInfo });
    }
  };

  const onHandleTurnBackCompleteOrder = () => {
    props.onHandleTurnBack(false);
  };

  useEffect(() => {
    if (props.orderId) {
      getCustomerInformation();
    }
  }, [props.orderId]);

  return (
    <div>
      {order && (
        <>
          <div className="order-wrapper d-md-flex">
            <div className="clr-viridian-green-light d-flex gap-4">
              <p onClick={onHandleTurnBackCompleteOrder} className="cursor-pointer">
                <span className="pi pi-arrow-left" />
              </p>
              <span>(OrderID)</span>
              <span className="text-overflow-1-v">{order?.id}</span>
            </div>
            <div>
              <p className="font-bold"><FormattedMessage id="t-customer-information" defaultMessage="Customer Information" /></p>
              <p className="d-flex justify-content-between">
                <span><FormattedMessage id="t-customer-name" defaultMessage="Customer Name" /></span>
                <span>{order.customerInfo?.name}</span>
              </p>
              <p className="d-flex justify-content-between">
                <span><FormattedMessage id="t-deliver-address" defaultMessage="Deliver Address" /></span>
                <span>{order.customerInfo?.address}</span>
              </p>
              <p className="d-flex justify-content-between">
                <span><FormattedMessage id="t-contact-phone" defaultMessage="Contact Phone" /></span>
                <span>{order.customerInfo?.contactPhone}</span>
              </p>
            </div>
          </div>

          <div className="order-wrapper d-md-flex">
            <p className="font-bold"><FormattedMessage id="t-order-information" defaultMessage="Order Information" /></p>
            <p className="d-flex justify-content-between">
              <span>Instructions<FormattedMessage id="t-instructions" defaultMessage="Instructions" /></span>
              <span>{order.note}</span>
            </p>
            <p className="d-flex justify-content-between">
              <span><FormattedMessage id="t-order-status" defaultMessage="Order Status" /></span>
              <span>{orderStatus(order.status)}</span>
            </p>
            <div className="d-flex justify-content-between">
              <span><FormattedMessage id="t-order-items" defaultMessage="Order Items" /></span>
              <div className="py-4 col-7">
                <p className="font-bold px-4">
                  {sumBy(order.orderDetails, (item: any) => {
                    return item.quantity;
                  })}{' '}
                  <FormattedMessage id="t-items" defaultMessage="Items" />
                </p>
                {order.orderDetails.map((item: any, index: number) => {
                  return (
                    <div key={index}>
                      <p className="px-4">
                        <span className="me-2">{item.quantity}</span>
                        <span>{item.product.name}</span>
                        <span>NT $ {item.price}</span>
                      </p>
                      <p className="bg-clr-alabaster px-4 py-2">
                        <span className="text-overflow-1-v">{item.product.description}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="d-flex justify-content-between">
              <span><FormattedMessage id="t-order-amount" defaultMessage="Order Amount" /></span>
              <span>{roundPriceNumber(order.subTotal)}</span>
            </p>
            <p className="d-flex justify-content-between">
              <span><FormattedMessage id="t-delivery-fees" defaultMessage="Delivery Fees" /></span>
              <span>TWD $ 30.00</span>
            </p>
            <p className="d-flex justify-content-between">
              <span><FormattedMessage id="t-discount" defaultMessage="Discount" /></span>
              <span>- TWD $ 0.00</span>
            </p>
            <p className="d-flex justify-content-between">
              <span><FormattedMessage id="t-discount-code" defaultMessage="Discount Code" /></span>
              <span>-</span>
            </p>
            <p className="d-flex justify-content-between">
              <span><FormattedMessage id="t-total-amount" defaultMessage="Total Amount" /></span>
              <span>{roundPriceNumber(order.subTotal)}</span>
            </p>
          </div>

          <div className="order-wrapper d-md-flex">
            <p className="font-bold"><FormattedMessage id="t-delivery-information" defaultMessage="Delivery Information" /></p>
            <p className="d-flex justify-content-between">
              <span><FormattedMessage id="t-delivery-time" defaultMessage="Delivery Time" /></span>
              <span>Yyyy-Mm-Dd Hh:Mm:Ss</span>
            </p>
            <p className="d-flex justify-content-between">
              <span><FormattedMessage id="t-deliveryman" defaultMessage="Deliveryman" /></span>
              <span>Andy / ID: 1728112 / Company: lalamove</span>
            </p>
          </div>

          <div className="order-wrapper d-md-flex">
            <p className="font-bold">Payment Information</p>
            <p className="d-flex justify-content-between">
              <span>Payment Status</span>
              <span>Paid</span>
            </p>
            <p className="d-flex justify-content-between">
              <span>Payment Method</span>
              <span>VISA / **** **** **** 1234</span>
            </p>
            <p className="d-flex justify-content-between">
              <span>Invoice</span>
              <span>Invoice ID</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
