import { lazy, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { RouteComponentProps } from 'react-router-dom';

import SidebarMenu from 'components/common/SidebarMenu';
import NplTabviewWithRoute from 'components/common/NplTabviewWithRoute';
import CONSTANTS from 'constants/common';
import { useUser } from 'store/hooks';

const MyProfileComponent = lazy(() => import('../MyProfile'));
const ViewStoreComponent = lazy(() => import('../../Chef/Store/ViewStore'));

export default function AccountInfo(props: RouteComponentProps) {
  const [tabPanels, setTabPanels] = useState<any>([]);
  const user = useUser();
  const intl = useIntl();

  const tabPanelsInitial: any = [
    {
      header: intl.formatMessage({
        id: 't-account-information',
        defaultMessage: 'Account Information',
      }),
      url: `${props.match.url}/info`,
      requirePermission: CONSTANTS.NPL_PERMISSIONS.USER,
      render: () => {
        return <MyProfileComponent {...props} />;
      },
    },
    {
      header: intl.formatMessage({
        id: 't-store-information',
        defaultMessage: 'Store information',
      }),
      url: `${props.match.url}/store`,
      requirePermission: CONSTANTS.NPL_PERMISSIONS.CHEF,
      render: () => {
        return <ViewStoreComponent {...props} />;
      },
    },
  ];

  useEffect(() => {
    let tabLists: any = [];
    tabPanelsInitial.map((tab: any) => {
      if (tab.requirePermission !== CONSTANTS.NPL_PERMISSIONS.CHEF) {
        tabLists.push(tab);
      } else {
        const findHeaderIndex = user.roles.findIndex((item: any) => {
          return item.name.toUpperCase() === tab.requirePermission.toUpperCase();
        });
        if (findHeaderIndex > -1) {
          tabLists.push(tab);
        }
      }
    });
    setTabPanels(tabLists);
  }, []);

  return (
    <div className="d-lg-flex user-manager">
      <div className="col-lg-2 px-0 px-lg-2">
        <SidebarMenu />
      </div>
      <div className={`user-manager-body w-100`}>
        {tabPanels.length > 0 && <NplTabviewWithRoute tabPanels={tabPanels} {...props} />}
      </div>
    </div>
  );
}
