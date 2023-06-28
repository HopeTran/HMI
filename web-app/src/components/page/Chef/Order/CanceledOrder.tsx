import CONSTANTS from 'constants/common';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import hmiService from 'services/HomeMadeInn';
import OrderItemTemplate from './OrderItemTemplate';
import { useIntl } from 'react-intl';
import { useUser } from 'store/hooks';

export default function CanceledOrder(props: RouteComponentProps) {
  const [orders, setOrders] = useState<any>([]);
  const [changeStatus, setChangeStatus] = useState(false);

  const intl = useIntl();
  const user = useUser();

  const getOrders = async () => {
    const data = await hmiService.getOrders({
      storeId: user.storeId,
      status: [CONSTANTS.ORDER_STATUS.CANCELED],
      queryByStoreOnly: true,
    });
    setOrders(data);
  };

  const onHandleChangeStatus = (status: any) => {
    setChangeStatus(status);
  };

  useEffect(() => {
    getOrders();
  }, [changeStatus]);

  return (
    <div className="mt-4 order">
      {orders.length > 0
        ? orders.map((order: any, index: number) => {
            return (
              <div key={index}>
                <OrderItemTemplate order={order} changeStatus={onHandleChangeStatus} />
              </div>
            );
          })
        : (intl.formatMessage({
          id: 'm-no-order',
          defaultMessage: 'No Order',
        }))}
    </div>
  );
}
