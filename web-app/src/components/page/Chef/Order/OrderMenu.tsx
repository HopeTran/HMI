import { lazy } from 'react';
import { Switch, RouteComponentProps } from 'react-router-dom';

import SidebarMenu from 'components/common/SidebarMenu';
import NplTabviewWithRoute from 'components/common/NplTabviewWithRoute';
import CONSTANTS from 'constants/common';
import { useIntl } from 'react-intl';

const LiveOrder = lazy(() => import('./LiveOrder'));
const CompletedOrder = lazy(() => import('./CompletedOrder'));
const CanceledOrder = lazy(() => import('./CanceledOrder'));


export default function OrderMenu(props: RouteComponentProps) {
  const intl = useIntl();
  const tabPanels: any = [
    {
      header:(intl.formatMessage({
        id: 't-new-order',
        defaultMessage: 'New Order',
      })),
      url: `${props.match.url}/new`,
      render: () => {
        return <LiveOrder {...props} status={[CONSTANTS.ORDER_STATUS.WAIT_FOR_PAYMENT]} />;
      },
    },
    {
      header: (intl.formatMessage({
        id: 't-processing-order',
        defaultMessage: 'Processing Order',
      })),
      url: `${props.match.url}/processing`,
      render: () => {
        return (
          <LiveOrder
            {...props}
            status={[
              CONSTANTS.ORDER_STATUS.PROCESSING,
              CONSTANTS.ORDER_STATUS.NEED_TO_DELIVERY,
              CONSTANTS.ORDER_STATUS.DELIVERING,
            ]}
          />
        );
      },
    },
    {
      header: (intl.formatMessage({
        id: 't-completed-order',
        defaultMessage: 'Completed Order',
      })),
      url: `${props.match.url}/completed`,
      render: () => {
        return <CompletedOrder {...props} />;
      },
    },
    {
      header: (intl.formatMessage({
        id: 't-canceled-order',
        defaultMessage: 'Canceled Order',
      })),
      url: `${props.match.url}/canceled`,
      render: () => {
        return <CanceledOrder {...props} />;
      },
    },
  ];

  return (
    <div className="d-lg-flex user-manager">
      <div className="col-lg-2 px-0 px-lg-2">
        <SidebarMenu />
      </div>
      <div className={`user-manager-body w-100`}>
        {tabPanels.length > 0 && (
          <>
            <Switch>
              <NplTabviewWithRoute tabPanels={tabPanels} {...props} />
            </Switch>
          </>
        )}
      </div>
    </div>
  );
}