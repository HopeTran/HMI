import isEmpty from 'lodash/isEmpty';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { queryCache, useQuery } from 'react-query';
import { RouteComponentProps } from 'react-router-dom';

import { DEFAULT_SELECTED_COLUMNS } from '../../../constants/admin';
import AdminService from '../../../services/Admin';
import ErrorMessage from '../../common/ErrorMessage';
import UsersToolbar, { USER_TOOLBAR_ACTIONS } from './UserToolbar';
import UsersTable from './UserTable';
import UserFilter, { FILTER_ACCOUNT_STATUS_OPTIONS } from './UserFilter';
import { useUser } from '../../../store/hooks';
import { setUser } from '../../../store/user/actions';
import { ROWS_PER_PAGE_OPTIONS, REACT_QUERY_KEYS } from '../../../constants/constant';
import { getDisplayFields } from '../../../utilities/common';
import { USER_MANAGEMENT_TYPE } from '../../../constants/admin';
import NplTabviewWithRoute from '../../common/NplTabviewWithRoute';
import { DATE_RANGE_VALUES } from '../../common/DateRangeFilter';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';
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

function UsersManagement(props: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [displayedColumns, setDisplayedColumns] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [allRoles, setAllRoles] = useState([]);
  const [userFilter, setUserFilter] = useState<any>(defaultFilter);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [userMessage, setUserMessage] = useState('Please click Filter button to search user');
  const dispatch = useDispatch();
  const user = useUser();
  const intl = useIntl();
  let isSubscribed: boolean = true;

  const { isFetching } = useQuery(
    [REACT_QUERY_KEYS.USER_STATISTIC, userFilter, displayedColumns, props.type],
    async (key: string, userFilter: any) => {
      isSubscribed = true;
      const filter = {
        userSearchText: userFilter.userSearchText,
        from: userFilter.from,
        to: userFilter.to,
        accountStatus: props.type === USER_MANAGEMENT_TYPE.CLOSED ? [USER_MANAGEMENT_TYPE.CLOSED] : userFilter.statuses,
        roles: userFilter.roles,
        columns: getDisplayFields(displayedColumns),
        sortField: userFilter.sortField,
        sortOrder: userFilter.sortOrder,
        total: userFilter.total,
        first: userFilter.first,
        recordsPerPage: userFilter.rows,
        paging: true,
      };
      return AdminService.fetchUserStatistics(filter);
    },
    {
      enabled: displayedColumns.length > 0,
      onSuccess: (result: any) => {
        if (isSubscribed) {
          result.data.users.forEach((user: any) => {
            const roleIds = user.roles || [];
            user.roleNames = roleIds.map(
              (roleId: string) => (allRoles.find((r: any) => r._id === roleId) || { name: '' }).name,
            );
          });

          setUsers(result.data.users);
          setTotalRecords(result.data.total);
          setUserMessage(!result.data.users || result.data.users.length === 0 ? intl.formatMessage({
            id: 't-no-user-found',
            defaultMessage: 'User not Found',
          }) : '');
        }
      },
    },
  );

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
    switch (e.action) {
      case USER_TOOLBAR_ACTIONS.UPDATE_DISPLAYED_COLUMNS:
        const adminSetting = {
          ...user.adminSetting,
          userDashboard: {
            ...user.adminSetting?.userDashboard,
            displayedColumns: e.data,
          },
        };
        dispatch(setUser({ ...user, adminSetting: adminSetting }));
        setDisplayedColumns(e.data);
        break;
      default:
        queryCache.invalidateQueries(REACT_QUERY_KEYS.USER_STATISTIC);
        break;
    }
  };

  const handleSavingFailed = (errorMessage: any) => {
    setErrorMessage(errorMessage);
  };

  const handleSelectedUsersChange = (e: any) => {
    setSelectedUsers(e);
  };


  const handleRoleChange = () => {
    queryCache.invalidateQueries(REACT_QUERY_KEYS.USER_STATISTIC);
  };

  const handleUserTableUpdate = () => {
    queryCache.invalidateQueries(REACT_QUERY_KEYS.USER_STATISTIC);
  };

  const handleUserFilterSubmit = (filter: any) => {
    const selectedRoleIds = filter.roles.map((role: any) => role._id);
    setUserFilter({
      ...userFilter,
      statuses: filter.statuses,
      from: filter.dateRange
        ? filter.dateRange.range !== DATE_RANGE_VALUES.ALL_TIME
          ? filter.dateRange.from
          : ''
        : userFilter.from,
      to: filter.dateRange
        ? filter.dateRange.range !== DATE_RANGE_VALUES.ALL_TIME
          ? filter.dateRange.to
          : ''
        : userFilter.to,
      total: -1,
      userSearchText: filter.userSearchText,
      roles: selectedRoleIds,
    });
  };

  useEffect(() => {
    AdminService.getRoles().then((response: any) => {
      setAllRoles(response);
    });
    return () => {
      isSubscribed = false;
    };
  }, []);

  useEffect(() => {
    if (!isEmpty(user?.adminSetting?.userDashboard?.displayedColumns)) {
      setDisplayedColumns(user?.adminSetting?.userDashboard?.displayedColumns);
    } else {
      setDisplayedColumns(DEFAULT_SELECTED_COLUMNS);
    }
  }, [user]);

  return (
    <>
      {displayedColumns.length > 0 && (
        <>
          <div className="mb-4">
            <UserFilter
              type={props.type}
              isLoading={isFetching}
              onFilterSubmit={handleUserFilterSubmit}
              roleOptions={allRoles}
            />
          </div>
          <div className="mb-4">
            <UsersToolbar
              type={props.type}
              totalUsers={totalRecords}
              userFilter={userFilter}
              displayedColumns={displayedColumns}
              selectedUsers={selectedUsers}
              onSuccess={handleSavingSuccess}
              onFail={handleSavingFailed}
            />
          </div>
          <div className="mb-4">
            <UsersTable
              type={props.type}
              userData={users}
              totalRecords={totalRecords}
              isLoading={isFetching}
              displayedColumns={displayedColumns}
              onSelectedRowsChange={handleSelectedUsersChange}
              onRoleChangeSuccess={handleRoleChange}
              onPagingChange={handlePagingChange}
              onSortChange={handleSortChange}
              onUserTableUpdateSuccess={handleUserTableUpdate}
              message={userMessage}
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

export default function UsersManagementPage(props: RouteComponentProps) {
  const intl = useIntl();
  const tabPanels: any = [
    {
      header: intl.formatMessage({
        id: 't-active-users',
        defaultMessage: 'Active Users',
      }),
      url: `${props.match.url}/active`,
      render: () => {
        return <UsersManagement type={USER_MANAGEMENT_TYPE.ACTIVE} />;
      },
    },
    {
      header: intl.formatMessage({
        id: 't-closed-users',
        defaultMessage: 'Closed Users',
      }),
      url: `${props.match.url}/closed`,
      render: () => {
        return <UsersManagement type={USER_MANAGEMENT_TYPE.CLOSED} />;
      },
    },
  ];

  return (
    <div className="dashboard wrapper container mt-24">
      <h3 className="px-2 my-16"><FormattedMessage id="t-user-list" defaultMessage="User List" /></h3>
      <NplTabviewWithRoute tabPanels={tabPanels} />
    </div>
  );
}
