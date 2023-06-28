import { lazy } from "react";
import { Switch, RouteComponentProps } from "react-router-dom";

import SidebarMenu from "components/common/SidebarMenu";
import NplTabviewWithRoute from "components/common/NplTabviewWithRoute";
import { useIntl } from 'react-intl';

const ScheduleMenuManagement = lazy(() => import('./ScheduleMenuManagement'));
const ProductManagement = lazy(() => import('./ProductManagement'));
const CategoryManagement = lazy(() => import('./CategoryManagement'));

const tabItems = {
  schedule_menu: 'schedule_menu',
  meal: 'meal',
  category: 'category'
};

export default function StoreMenu(props: RouteComponentProps) {

  const renderContent = (tabName: string, props?: any) => {
    return (
      <>
        {tabName === tabItems.schedule_menu ? (
          <>
            <ScheduleMenuManagement {...props} />
          </>
        ) : tabName === tabItems.meal ? (
          <>
            <ProductManagement {...props} />
          </>
        ) : tabName === tabItems.category ? (
            <CategoryManagement {...props} />
        ) : null}
      </>
    );
  };
  const intl = useIntl();
  const renderTabContent = (tabName: string, props?: any) => {
    
    return <div className="tw-p-8 content">{renderContent(tabName, props)}</div>;
  };

  const tabPanels: any = [
    {
      header: intl.formatMessage({
        id: 't-schedule-menu',
        defaultMessage: 'Schedule Menu',
      }),
      url: `${props.match.url}/schedule-menu`,
      tabHeader: true,
      tabFooter: true,
      icon: tabItems.schedule_menu,
      render: () => {
        return renderTabContent(tabItems.schedule_menu, props);
      },
    },
    {
      header: intl.formatMessage({
        id: 't-meal',
        defaultMessage: 'Meal',
      }),
      url: `${props.match.url}/meal`,
      tabHeader: true,
      tabFooter: true,
      icon: tabItems.meal,
      render: () => {
        return renderTabContent(tabItems.meal, props);
      },
    },
    {
      header: intl.formatMessage({
        id: 't-category',
        defaultMessage: 'Category',
      }),
      url: `${props.match.url}/category`,
      tabHeader: true,
      tabFooter: true,
      icon: tabItems.category,
      render: () => {
        return renderTabContent(tabItems.category, props);
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
  )
}