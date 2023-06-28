import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import hmiService from 'services/HomeMadeInn';
import OrderItemTemplate from './OrderItemTemplate';
import { useIntl } from 'react-intl';
import { useUser } from 'store/hooks';

interface OrderListProps extends RouteComponentProps {
  status?: string[];
}

export default function LiveOrder(props: OrderListProps) {
  const [orders, setOrders] = useState<any>([]);
  const [orderStatus, setOrderStatus] = useState('');

  const intl = useIntl();
  const user = useUser();

  const getOrders = async () => {
    const data = await hmiService.getOrders({
      storeId: user.storeId,
      status: props.status,
      queryByStoreOnly: true,
      ordering: 'ASC',
    });
    setOrders(data);
  };

  const onHandleChangeStatus = (status: any) => {
    setOrderStatus(status);
  };

  useEffect(() => {
    getOrders();
  }, [orderStatus]);

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
        :  (intl.formatMessage({
          id: 'm-no-order',
          defaultMessage: 'No Order',
        }))}
    </div>
  );
}
