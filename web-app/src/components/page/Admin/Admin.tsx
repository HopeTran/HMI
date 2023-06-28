import { MegaMenu } from 'primereact/megamenu';
import React, { lazy } from 'react';
import { useIntl } from 'react-intl';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';

const UsersManagement = lazy(() => import('./UsersManagement'));
const RoleManagementList = lazy(() => import('./RoleManagementList'));
const StoresManagement = lazy(() =>  import('./StoreManagement/StoreList/StoresManagement'))
const PlatformCategories = lazy(() => import('./StoreManagement/PlatformCategory/PlatformCategories'));
const Cuisines = lazy(() => import('./StoreManagement/Cuisines/Cuisines'));
const Attributes = lazy(() => import('./StoreManagement/Attribute/Attributes'));

const MENU_CATEGORIES = {
  STORE: 'store',
  MANAGEMENT: 'management',
  // SETTING: 'setting',
};

const routes = [
  {
    path: '/platform-categories',
    text: 'Platform Categories',
    render: (props: any) => <PlatformCategories {...props} />,
    category: MENU_CATEGORIES.STORE,
    className: 'require-admin-permission',
  },
  {
    path: '/cuisines',
    text: 'Cuisines',
    render: (props: any) => <Cuisines {...props} />,
    category: MENU_CATEGORIES.STORE,
    className: 'require-admin-permission',
  },
  {
    path: '/stores',
    text: 'Store Management',
    render: (props: any) => <StoresManagement {...props} />,
    category: MENU_CATEGORIES.STORE,
    className: 'require-admin-permission',
  },
  {
    path: '/users',
    text: 'Users',
    render: (props: any) => <UsersManagement {...props} />,
    category: MENU_CATEGORIES.MANAGEMENT,
    className: 'require-read-user-permission',
  },
  {
    path: '/role-management',
    text: 'Role Management',
    render: () => <RoleManagementList />,
    category: MENU_CATEGORIES.MANAGEMENT,
    className: 'require-read-role-permission',
  },
  {
    path: '/attributes',
    text: 'Product Attributes',
    render: (props: any) => <Attributes {...props} />,
    category: MENU_CATEGORIES.STORE,
    className: 'require-admin-permission',
  },
];

const getMenuItemsByCategory = (category: string, command: (e: any) => void) => {
  const items = routes.filter((item: any) => {
    return item.category === category;
  });
  const menuItems = items.map((item: any) => {
    return {
      items: [
        {
          label: item.text,
          path: item.path,
          command,
          className: item.className,
        },
      ],
    };
  });
  return [menuItems];
};

function Admin(props: RouteComponentProps) {

  const handleMenuItemClick = (e: any) => {
    if (e.item && e.item.path) {
      props.history.push(props.match.path + e.item.path);
    }
  };
  const intl = useIntl();
  const menuItems = [
    {
      label:intl.formatMessage({
        id: 't-store',
        defaultMessage: 'Store',
      }) ,
      icon: 'pi pi-fw pi-folder',
      items: getMenuItemsByCategory(MENU_CATEGORIES.STORE, handleMenuItemClick),
    },
    {
      label: intl.formatMessage({
        id: 't-management',
        defaultMessage: 'Management',
      }),
      icon: 'pi pi-fw pi-folder',
      items: getMenuItemsByCategory(MENU_CATEGORIES.MANAGEMENT, handleMenuItemClick),
    },
    // {
    //   label: 'Settings',
    //   icon: 'pi pi-fw pi-cog',
    //   items: getMenuItemsByCategory(MENU_CATEGORIES.SETTING, handleMenuItemClick),
    // },
  ];

  const redirectToFirstRoute = () => {
    return <Redirect to={props.match.path + routes[0].path} />;
  };

  return (
    <div className="admin-container m-auto user-manager">
      <MegaMenu model={menuItems} />
      <div className="content">
        <Switch>
          <Route path={props.match.path} exact={true} render={redirectToFirstRoute} />
          {routes.map((route, index) => (
          <Route key={index} path={props.match.path + route.path} render={route.render} />
          ))}
        </Switch>
      </div>
    </div>
  );
}

export default Admin;
