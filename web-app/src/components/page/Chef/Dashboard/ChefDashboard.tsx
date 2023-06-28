import { lazy, useEffect, useState } from 'react';
import { Switch, RouteComponentProps } from 'react-router-dom';

import hmiService from 'services/HomeMadeInn';
import SidebarMenu from 'components/common/SidebarMenu';
import NplTabview from 'components/common/NplTabview';
import { roundPriceNumber } from 'utilities/common';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';
import { useUser } from 'store/hooks';

const GrossSalesChart = lazy(() => import('./GrossSalesChart'));
const TotalOrderChart = lazy(() => import('./TotalOrderChart'));

const tabItems = {
  grossSales: 'Gross Sales',
  totalOrder: 'Total Order',
};

export default function ChefDashboard(props: RouteComponentProps) {
  const [orders, setOrders] = useState<any>([]);
  const intl = useIntl();
  const user = useUser();

  const getOrders = async () => {
      const data = await hmiService.getOrderById(user.storeId);
      setOrders(data);
  }
  const renderContent = (tabName: string, props?: any) => {
    return (
      <>
        {tabName === tabItems.grossSales ? (
          <>
            <GrossSalesChart {...props} />
          </>
        ) : tabName === tabItems.totalOrder ? (
          <>
            <TotalOrderChart {...props} />
          </>
        ) : null}
      </>
    );
  };

  const renderTabContent = (tabName: string, props?: any) => {
    return <div className="tw-p-8 content">{renderContent(tabName, props)}</div>;
  };

  const tabPanels: any = [
    {
      header: intl.formatMessage({
        id: 't-gross-sales',
        defaultMessage: 'Gross Sales',
      }),
      url: `${props.match.url}/gross`,
      tabHeader: true,
      tabFooter: true,
      icon: tabItems.grossSales,
      render: () => {
        return renderTabContent(tabItems.grossSales, props);
      },
    },
    {
      header: intl.formatMessage({
        id: 't-total-order',
        defaultMessage: 'Total Order',
      }),
      url: `${props.match.url}/total`,
      tabHeader: true,
      tabFooter: true,
      icon: tabItems.totalOrder,
      render: () => {
        return renderTabContent(tabItems.totalOrder, props);
      },
    },
  ];

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <div className="d-lg-flex user-manager">
      <div className="col-lg-2 px-0 px-lg-2">
        <SidebarMenu />
      </div>
      <div className={`user-manager-body w-100 d-lg-flex gap-4`}>
        <div className="col-lg-7 col-sm-12 wrapper">
          <p className="font-bold">
            <FormattedMessage id="t-profit-summary" defaultMessage="Profit Summary" />
          </p>
          {tabPanels.length > 0 && (
            <>
              <Switch>
                <NplTabview tabPanels={tabPanels} {...props} />
              </Switch>
            </>
          )}
        </div>
        <div className="col-lg-5 col-sm-12">
          {orders &&
            Object.keys(orders).map((index: any) => {
              return (
                <div className="wrapper" key={index}>
                  <p className="font-bold"><FormattedMessage id="t-preparing-order" defaultMessage="Preparing Order" /></p>
                  <div>
                    <p>{orders[index].customerName} (Customer Name)</p>
                    <p>{orders[index].id} (OrderID)</p>
                    <hr />
                    <div className="bg-clr-alabaster p-4 mb-3">
                      <p className="mb-2"><FormattedMessage id="t-instructions" defaultMessage="Instructions " /></p>
                      <p>{orders[index].note}</p>
                    </div>
                  </div>
                  {orders[index].orderDetails.map((item: any, index: number) => {
                    return (
                      <div key={index}>
                        <div className="px-4 d-flex justify-content-between">
                          <p>
                            <span className="me-2">{item.quantity}</span>
                            <span>{item.product.name}</span>
                          </p>
                          <span>NT $ {item.price}</span>
                        </div>
                        <p className="bg-clr-alabaster px-4 py-2">
                          <span className="text-overflow-1-v">{item.product.description}</span>
                        </p>
                      </div>
                    );
                  })}
                  <p className="d-flex justify-content-between mb-4">
                    <span><FormattedMessage id="t-order-amount" defaultMessage="Order Amount " /></span>
                    <span>NT $ {roundPriceNumber(orders[index].subTotal)}</span>
                  </p>
                  <div className="d-flex justify-content-between gap-4">
                    <p className=" w-100 btn-default mb-3 text-center"><FormattedMessage id="t-manage-order" defaultMessage="Manage Order " /></p>
                    <p className=" w-100 btn-default mb-3 text-center"><FormattedMessage id="t-confirm-to-pick-up" defaultMessage="Confirm to pick up "/></p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}