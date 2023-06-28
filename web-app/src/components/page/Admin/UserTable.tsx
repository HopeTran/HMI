import moment from 'moment';
import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Column } from 'primereact/column';
import { DataTable, DataTableSortOrderType } from 'primereact/datatable';
import { Button } from 'primereact/button';

import UserRolesManagement from './UserRolesManagement';
import { userEmailTemplate, usernameTemplate } from '../../common/ColumnTemplates';
import NplTooltip from '../../common/NplTooltip';
import { isShowColumn } from '../../../utilities/common';
import { convertUTCDateToLocalTimeZoneLongFormat } from '../../../utilities/date';
import { ROWS_PER_PAGE_OPTIONS } from '../../../constants/constant';
import { COLUMN_OPTIONS, DEFAULT_ROLE } from '../../../constants/admin';
import { useIntl } from 'react-intl';
interface UserTableProps {
  type: string;
  userData: any[];
  totalRecords: number;
  isLoading: boolean;
  displayedColumns: any[];
  message?: string;
  onPagingChange: (first: number, rows: number, total: number) => void;
  onSortChange: (sortField: string, sortOrder: number) => void;
  onSelectedRowsChange?: (event: any) => void;
  onRoleChangeSuccess?: () => void;
  onUserTableUpdateSuccess?: () => void;
}

const IPAddressBodyTemplate = (rowData: any, column: any) => {
  return rowData[column.field] ? `${rowData[column.field]} (${rowData.ipAddressCountry})` : '';
};

const LastIPAddressBodyTemplate = (rowData: any, column: any) => {
  return rowData[column.field] ? `${rowData[column.field]} (${rowData.lastLoggedIPCountry})` : '';
};

const StatusBodyTemplate = (rowData: any) => {
  if (rowData.bannedReason) {
    return (
      <div className="role-labels">
        <NplTooltip id="banned-tooltip" place="top" type="dark" effect="float" multiline={true} />
        <span
          data-for="banned-tooltip"
          data-tip={`Date: ${moment(rowData.bannedAt).format('YYYY-MM-DD HH:mm')}<br />Reason: ${rowData.bannedReason}`}
          className="capitalize"
        >
          {rowData.status}
        </span>
      </div>
    );
  } else if (rowData.closedReason) {
    return (
      <div className="role-labels">
        <NplTooltip id="closed-tooltip" place="top" type="dark" effect="float" multiline={true} />
        <span
          className="capitalize"
          data-for="closed-tooltip"
          data-tip={`Date: ${moment(rowData.closedAt).format('YYYY-MM-DD HH:mm')}<br />Reason: ${rowData.closedReason}`}
        >
          {rowData.status}
        </span>
      </div>
    );
  } else {
    return <span className="capitalize">{rowData.status}</span>;
  }
};

const rolesBodyTemplate = (rowData: any) => {
  const roles = rowData.roleNames && rowData.roleNames.length > 0 ? rowData.roleNames : [DEFAULT_ROLE];
  const displayRole = roles.length > 1 ? `${roles[0]}, ...` : roles[0];

  return (
    <div className="role-labels">
      <NplTooltip id="roles-tooltip" place="top" type="dark" effect="float" multiline={true} />
      <span data-tip={roles.join('<br />')} data-for="roles-tooltip">
        {displayRole}
      </span>
    </div>
  );
};

const STYLES = {
  multiple: { width: '30px' },
  index: { width: '60px' },
  rolesSetting: { width: '100px' },
};

export default function UsersTable(props: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<any>();
  const [isRolesSettingVisible, setRolesSettingVisible] = useState(false);
  const [selectedUserRows, setSelectedUserRows] = useState<any[]>([]);
  const [first, setFirst] = useState<number>(0);
  const [rows, setRows] = useState<number>(ROWS_PER_PAGE_OPTIONS[1]);
  const [sortField, setSortField] = useState<string>(COLUMN_OPTIONS.createdAt.field);
  const [sortOrder, setSortOrder] = useState<DataTableSortOrderType>(1);
  const intl = useIntl();

  const RowIndexBodyTemplate = (rowData: any, column: any) => {
    return column.rowIndex + first + 1;
  };

  const handleRolesSettingDialogHide = () => {
    setRolesSettingVisible(false);
  };

  const onSaveRolesSettingSuccess = () => {
    setRolesSettingVisible(false);
    if (props.onRoleChangeSuccess) {
      props.onRoleChangeSuccess();
    }
  };

  const onSelectionChange = (e: any) => {
    setSelectedUserRows(e.value);
    if (props.onSelectedRowsChange) {
      props.onSelectedRowsChange(e.value);
    }
  };

  const settingRolesTemplate = (user: any) => {
    const handleRolesSetting = () => {
      setSelectedUser(user);
      setRolesSettingVisible(true);
    };

    return (
      <Button icon="pi pi-pencil" onClick={handleRolesSetting} className="p-button-text p-link" />
    );
  };

  const createdAtBodyTemplate = (rowData: any) => {
    return convertUTCDateToLocalTimeZoneLongFormat(rowData.createdAt);
  };

  const RowIndexHeaderTemplate = (rowData: any, column: any) => {    
    return (
      <div className="font-bold">
        <span>#</span>
        {column.rowIndex + first + 1}
      </div>
    );      
  };

  const handlePageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
    props.onPagingChange(event.first, event.rows, props.totalRecords);
  };

  const handleSortChange = (event: any) => {
    setSortField(event.sortField);
    setSortOrder(event.sortOrder);
    props.onSortChange(event.sortField, event.sortOrder);
  };

  return (
    <>
      <div className="total-users">
        <b>Total</b>: {props.totalRecords} <span>user(s)</span>
      </div>
      <div className="user-table-wrapper">
        <DataTable
          value={props.userData}
          loading={props.isLoading}
          selection={selectedUserRows}
          onSelectionChange={onSelectionChange}
          totalRecords={props.totalRecords}
          rows={rows}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          paginator={true}
          lazy={true}
          first={first}
          sortField={sortField}
          sortOrder={sortOrder}
          onPage={handlePageChange}
          onSort={handleSortChange}
          emptyMessage={props.message}
        >
          <Column selectionMode="multiple" style={STYLES.multiple} className="selection"/>
          <Column header="#" body={RowIndexBodyTemplate} style={STYLES.index} className="d-none d-lg-table-cell" />
          <Column body={RowIndexHeaderTemplate} style={STYLES.index} className="d-flex d-lg-none justify-content-start" />
          {isShowColumn(props.displayedColumns, COLUMN_OPTIONS.username.value) && (
            <Column
              field={COLUMN_OPTIONS.username.field}
              header={COLUMN_OPTIONS.username.value}
              sortable={true}
              style={COLUMN_OPTIONS.username.style}
              className="wrap-text"
              body={usernameTemplate}
            />
          )}
          {isShowColumn(props.displayedColumns, COLUMN_OPTIONS.email.value) && (
            <Column
              field={COLUMN_OPTIONS.email.field}
              header={COLUMN_OPTIONS.email.value}
              sortable={true}
              style={COLUMN_OPTIONS.email.style}
              className="wrap-text"
              body={userEmailTemplate}
            />
          )}
          {isShowColumn(props.displayedColumns, COLUMN_OPTIONS.createdAt.value) && (
            <Column
              field={COLUMN_OPTIONS.createdAt.field}
              header={COLUMN_OPTIONS.createdAt.value}
              sortable={true}
              className="wrap-text text-center"
              style={COLUMN_OPTIONS.createdAt.style}
              body={createdAtBodyTemplate}
            />
          )}
          {isShowColumn(props.displayedColumns, COLUMN_OPTIONS.ipAddress.value) && (
            <Column
              field={COLUMN_OPTIONS.ipAddress.field}
              header={COLUMN_OPTIONS.ipAddress.value}
              sortable={true}
              className="wrap-text text-center"
              body={IPAddressBodyTemplate}
              style={COLUMN_OPTIONS.ipAddress.style}
            />
          )}
          {isShowColumn(props.displayedColumns, COLUMN_OPTIONS.lastLoggedIP.value) && (
            <Column
              field={COLUMN_OPTIONS.lastLoggedIP.field}
              header={COLUMN_OPTIONS.lastLoggedIP.value}
              sortable={true}
              className="wrap-text text-center"
              body={LastIPAddressBodyTemplate}
              style={COLUMN_OPTIONS.lastLoggedIP.style}
            />
          )}
          {isShowColumn(props.displayedColumns, COLUMN_OPTIONS.status.value) && (
            <Column
              className="text-center"
              field={COLUMN_OPTIONS.status.field}
              header={COLUMN_OPTIONS.status.value}
              body={StatusBodyTemplate}
              style={COLUMN_OPTIONS.status.style}
              sortable={true}
            />
          )}
          {isShowColumn(props.displayedColumns, COLUMN_OPTIONS.roleNames.value) && (
            <Column
              field={COLUMN_OPTIONS.roleNames.field}
              header={COLUMN_OPTIONS.roleNames.value}
              body={rolesBodyTemplate}
              className="wrap-text text-center"
              style={COLUMN_OPTIONS.roleNames.style}
            />
          )}
          {isShowColumn(props.displayedColumns, COLUMN_OPTIONS.roleNames.value) && (
            <Column
              header={intl.formatMessage({
                id: 't-roles-setting',
                defaultMessage: 'Roles Setting',
              })}
              className="text-center require-edit-user-role-setting-permission"
              body={settingRolesTemplate}
              style={STYLES.rolesSetting}
            />
          )}
        </DataTable>
        <div className="clearfix" />
        {isRolesSettingVisible && (
          <Dialog
            className={'user-roles-dialog'}
            header={intl.formatMessage({
              id: 't-roles-setting',
              defaultMessage: 'Roles Setting',
            })}
            visible={true}
            onHide={handleRolesSettingDialogHide}
          >
            {selectedUser && <UserRolesManagement user={selectedUser} onSuccess={onSaveRolesSettingSuccess} />}
          </Dialog>
        )}
      </div>
    </>
  );
}
