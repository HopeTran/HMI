import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useIntl } from 'react-intl';

import CONSTANTS from 'constants/common';
import hmiService from 'services/HomeMadeInn';
import OrderDetailTemplate from './OrderDetailTemplate';
import OrderItemTemplate from './OrderItemTemplate';
import { useUser } from 'store/hooks';

export default function CompletedOrder(props: RouteComponentProps) {
  const [orders, setOrders] = useState<any>([]);
  const [changeStatus, setChangeStatus] = useState(false);
  const [orderId, setOrderId] = useState<any>();
  const [isVisibleOrderDetail, setIsVisibleOrderDetail] = useState(false);

  const intl = useIntl();
  const user = useUser();

  const getOrders = async () => {
    const data = await hmiService.getOrders({
      storeId: user.storeId,
      status: [CONSTANTS.ORDER_STATUS.COMPLETED],
      queryByStoreOnly: true,
    });
    setOrders(data);
  };

  const onHandleOrderDetail = async (orderId: any) => {
    setOrderId(orderId);
    setIsVisibleOrderDetail(true);
  };

  const onHandleChangeStatus = (status: any) => {
    setChangeStatus(status);
  };

  const onHandleTurnBackCompleteOrder = (e: any) => {
    setIsVisibleOrderDetail(e);
  };

  useEffect(() => {
    getOrders();
  }, [changeStatus]);

  return (
    <>
      {!isVisibleOrderDetail && (
        <div className="mt-4 order">
          {orders.length > 0
            ? orders.map((order: any, index: number) => {
                return (
                  <div key={index}>
                    <OrderItemTemplate
                      order={order}
                      changeStatus={onHandleChangeStatus}
                      onHandleViewOrderDetail={onHandleOrderDetail}
                    />
                  </div>
                );
              })
            : (intl.formatMessage({
              id: 'm-no-completed-order',
              defaultMessage: 'No Completed Order',
            }))}
        </div>
      )}
      {isVisibleOrderDetail && (
        <div className="order-detail mt-4">
          <OrderDetailTemplate orderId={orderId} onHandleTurnBack={onHandleTurnBackCompleteOrder} />
        </div>
      )}
    </>
  );
}
