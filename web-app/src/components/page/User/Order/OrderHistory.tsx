import { useEffect, useState } from 'react';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { config } from 'config';
import hmiService from 'services/HomeMadeInn';
import OrderHistoryItem from './OrderHistoryItem';
import { useUser } from 'store/hooks';

function OrderHistory(props: any) {
  const [orders, setOrders] = useState<any>([]);
  const [isReload, setIsReload] = useState(false);

  const user = useUser();

  const getOrders = async () => {
    const data = await hmiService.getOrders({  storeId: user.storeId});
    setOrders(data);
  };

  useEffect(() => {
    getOrders();

    // Set interval to reload orders for every 20 seconds
    const intervalSetting = config.intervalReloadUserOrder * 10000;
    const interval = setInterval(() => {
      getOrders();
    }, intervalSetting);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  useEffect(() => {
    if (isReload) {
      getOrders();
      setIsReload(false)
    }
  }, [isReload])

  return (
    <div className="wrapper">
      <div className="section-wrapper">
        <h4 className="mb-4"><FormattedMessage id="t-order-history" defaultMessage="Order History" /></h4>
        {orders && orders.length > 0 ? (
          <div className="order-history mt-4">
            {Object.keys(orders).map((key) => {
              let order = orders[`${key}`];
              return (
                <OrderHistoryItem order={order} key={key} isReload={(e) => setIsReload(e)}/>
              );
            })}
          </div>
        ) : (
          <h6><FormattedMessage id="t-no-order-history" defaultMessage="No Order History" /></h6>
        )}
      </div>
      
    </div>
  );
}

export default React.memo(OrderHistory);
