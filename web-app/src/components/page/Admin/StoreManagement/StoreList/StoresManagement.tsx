import isEmpty from 'lodash/isEmpty';
import React, { useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { capitalize, find } from 'lodash';

import { FILTER_ACCOUNT_STATUS_OPTIONS } from '../../UserFilter';
import { ROWS_PER_PAGE_OPTIONS } from 'constants/constant';
import { useUser } from 'store/hooks';
import { DEFAULT_SELECTED_COLUMNS, STORE_MANAGEMENT_TYPE } from 'constants/admin';
import NplTabviewWithRoute from 'components/common/NplTabviewWithRoute';
import StoreTable from './StoreTable';
import hmiService from 'services/HomeMadeInn';
import StoreToolbar from './StoreToolbar';
import ErrorMessage from 'components/common/ErrorMessage';
import AdminService from 'services/Admin';
import User from 'models/user';
import { getDisplayFields } from 'utilities/common';
import { FormattedMessage } from 'react-intl';

import { useIntl } from 'react-intl';
interface Props {
  type: string;
}

const defaultFilter = {
  userSearchText: '',
  from: '',
  to: '',
  statuses: [FILTER_ACCOUNT_STATUS_OPTIONS[1].value],
  roles: [],
  columns: [],
  sortField: 'createdAt',
  sortOrder: -1,
  total: -1,
  first: 0,
  rows: ROWS_PER_PAGE_OPTIONS[2],
};

function StoreManagementTypeList(props: Props) {
  const [errorMessage, setErrorMessage] = useState('');
  const [displayedColumns, setDisplayedColumns] = useState<any[]>(['username', 'email', 'roles']);
  const [selectedStores, setSelectedStores] = useState<any[]>([]);
  const [userFilter, setUserFilter] = useState<any>(defaultFilter);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [storeMessage, setStoreMessage] = useState('Please click Filter button to search user');
  const [isFetching, setIsFetching] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
  const [accountsInfo, setAccountsInfo] = useState<User[]>([])
  const [allRoles, setAllRoles] = useState([]);
  const [activeStore, setActiveStore] = useState(false)
  
  const user = useUser();
  const toast = useRef<Toast>(null);
  const intl = useIntl();

  const fetchAllAccountInfo = () => {
    const filter = {
      ...userFilter,
      columns: getDisplayFields([intl.formatMessage({
        id: 't-user-name',
        defaultMessage: 'User Name',
      }), intl.formatMessage({
        id: 'c-email',
        defaultMessage: 'Email',
      }), intl.formatMessage({
        id: 't-roles',
        defaultMessage: 'Roles',
      })]),
      paging: false,
    }
    AdminService.fetchUserStatistics(filter).then((result: any) => { 
       if (result && result.data.users.length > 0 ) {
        result.data.users.forEach((user: any) => {
          const roleIds = user.roles || [];
          user.roleNames = roleIds.map(
            (roleId: string) => (allRoles.find((r: any) => r._id === roleId) || { name: '' }).name,
          );
        });
        setAccountsInfo(result.data.users)
      }
    }).catch((err: any) => {
      console.log(err.message)
    });    
  }

  const getStores = () => {
    try {
      setIsFetching(true);
      const accounts = [...accountsInfo]
      hmiService.getStores({
        active: props.type === STORE_MANAGEMENT_TYPE.ACTIVE ? 'true' : 'false',
      }).then((data: any) => {
        if (data && data.length > 0) {
          let storeData:any = [...data]
            storeData.forEach((store:any, index: number) => {
              const accountInfo = find(accounts, ((e: User) => {return e._id === store.userId}));
              const storeInfo = {
                ...store,
                ...accountInfo
              };
              storeData[index] = storeInfo;  
            })    
          setStores(storeData);         
          setIsFetching(false);
          setTotalRecords(data.length);
        }
      }).catch((err: any) => {
        console.log(err.message)
      });  
    } catch (error) {
      setStoreMessage('');
      console.debug(error);
    }
  };

  const handlePagingChange = (first: number, rows: number, total: number) => {
    const newFilter = {
      ...userFilter,
      total,
      first,
      rows,
    };
    setUserFilter(newFilter);
  };

  const handleSortChange = (sortField: string, sortOrder: number) => {
    const newFilter = {
      ...userFilter,
      sortField,
      sortOrder,
      total: -1,
    };
    setUserFilter(newFilter);
  };

  const handleSavingSuccess = (e: any) => {
    if (toast.current) {
      toast.current.show({ severity: 'success', summary: `${capitalize(e.action)} Store Saved`, life: 3000 });
    }
    getStores();
  };

  const handleSavingFailed = (errorMessage: any) => {
    setErrorMessage(errorMessage);
  };

  const handleSelectedUsersChange = (e: any) => {
    setSelectedStores(e);
  };

  const handleRoleChange = () => {
  };

  const handleActiveStore = (rowData : any, status: boolean) => {
    setSelectedStores(rowData);
    setActiveStore(status)
  };

  const handleDismissDialog = () => {
    setActiveStore(false)
  }

  useEffect(() => {
    AdminService.getRoles().then((response: any) => {
      setAllRoles(response);
    });
  }, []);

  useEffect(() => {   
    if (allRoles.length > 0) {
      fetchAllAccountInfo();
    }
  }, [allRoles]);

  useEffect(() => {
    if (accountsInfo.length > 0) {
      getStores();  
    }       
  }, [accountsInfo]);

  useEffect(() => {
    if (!isEmpty(user?.adminSetting?.userDashboard?.displayedColumns)) {
      setDisplayedColumns(user?.adminSetting?.userDashboard?.displayedColumns);
    } else {
      setDisplayedColumns(DEFAULT_SELECTED_COLUMNS);
    }
  }, [user]);

  return (
    <>
      <Toast ref={toast} />
      {stores && (
        <>
          <div className="mb-4">
            <StoreToolbar
              type={props.type}
              totalUsers={totalRecords}
              displayedColumns={displayedColumns}
              selectedStores={selectedStores}
              onSuccess={handleSavingSuccess}
              onFail={handleSavingFailed}
              onActiveStore={activeStore}
              onDismiss={handleDismissDialog}
            />
          </div>
          <div className="mb-4">
            <StoreTable
              type={props.type}
              storeData={stores}
              totalRecords={totalRecords}
              isLoading={isFetching}
              displayedColumns={displayedColumns}
              onSelectedRowsChange={handleSelectedUsersChange}
              onRoleChangeSuccess={handleRoleChange}
              onPagingChange={handlePagingChange}
              onSortChange={handleSortChange}
              onActiveStore={handleActiveStore}
              message={storeMessage}
            />
          </div>

          <div>
            <div className="clearfix" />
            <ErrorMessage message={errorMessage} />
          </div>
          
        </>
      )}
    </>
  );
}

export default function StoresManagement(props: RouteComponentProps)
 {
  const intl = useIntl();
  const tabPanels: any = [
    {
      header:intl.formatMessage({
        id: 't-active-store',
        defaultMessage: 'Active Store',
      }),
      url: `${props.match.url}/active`,
      render: () => {
        return <StoreManagementTypeList type={STORE_MANAGEMENT_TYPE.ACTIVE} />;
      },
    },
    {
      header: intl.formatMessage({
        id: 't-inactive-store',
        defaultMessage: 'Inactive Store',
      }),
      url: `${props.match.url}/inactive`,
      render: () => {
        return <StoreManagementTypeList type={STORE_MANAGEMENT_TYPE.INACTIVE} />;
      },
    },
  ];

  return (
    <div className="dashboard wrapper container mt-24">
      <h3 className="px-2 my-16"><FormattedMessage id="t-store-management" defaultMessage="Store Management" /></h3>
      <NplTabviewWithRoute tabPanels={tabPanels} />
    </div>
  );
}
