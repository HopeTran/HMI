import { useState } from 'react';
import { Column } from 'primereact/column';
import { DataTable, DataTableSortOrderType } from 'primereact/datatable';
import { Button } from 'primereact/button';

import { ROWS_PER_PAGE_OPTIONS } from 'constants/constant';
import { COLUMN_OPTIONS } from 'constants/admin';
import { usernameTemplate } from 'components/common/ColumnTemplates';
import { useIntl } from 'react-intl';
interface StoreTableProps {
  type: string;
  storeData: any[];
  totalRecords: number;
  isLoading: boolean;
  displayedColumns: any[];
  message?: string;
  onPagingChange: (first: number, rows: number, total: number) => void;
  onSortChange: (sortField: string, sortOrder: number) => void;
  onSelectedRowsChange?: (event: any) => void;
  onRoleChangeSuccess?: () => void;
  onActiveStore: (rowData: any, status: boolean) => void;
}

const STYLES = {
  multiple: { width: '50px' },
  index: { width: '40px' },
  rolesSetting: { width: '100px' },
};

export default function StoreTable(props: StoreTableProps) {
  const [selectedStoreRows, setSelectedStoreRows] = useState<any[]>([]);
  const [first, setFirst] = useState<number>(0);
  const [rows, setRows] = useState<number>(ROWS_PER_PAGE_OPTIONS[1]);
  const [sortField, setSortField] = useState<string>(COLUMN_OPTIONS.createdAt.field);
  const [sortOrder, setSortOrder] = useState<DataTableSortOrderType>(1);
  const intl = useIntl();

  const onSelectionChange = (e: any) => {
    setSelectedStoreRows(e.value); 
    if (props.onSelectedRowsChange) {
      props.onSelectedRowsChange(e.value);
    }
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

  const RowIndexBodyTemplate = (rowData: any, column: any) => {
    return column.rowIndex + first + 1;
  };

  const RowIndexHeaderTemplate = (rowData: any, column: any) => {    
    return (
      <div className="font-bold">
        <span>#</span>
        {column.rowIndex + first + 1}
      </div>
    );      
  };

  const actionBodyTemplate = (rowData: any) => {
    const handleActiveStore = () => {
      props.onActiveStore([rowData], true);
    };

    return (
      props.type !== 'active' ?
        <Button onClick={handleActiveStore} label={intl.formatMessage({
          id: 't-active',
          defaultMessage: 'Active',
        })} />
        :
        <Button onClick={handleActiveStore} label={intl.formatMessage({
          id: 't-view',
          defaultMessage: 'View',
        })} />
    )
  };

  return (
    <>
      <div className="total-users">
        <b>Total</b>: {props.totalRecords} <span>store(s)</span>
      </div>
      <div className="user-table-wrapper stores">
        {props.storeData.length > 0 &&
          <DataTable
            value={props.storeData}
            loading={props.isLoading}
            selection={selectedStoreRows}
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
            <Column
              field="username"
              header={intl.formatMessage({
                id: 't-user-name',
                defaultMessage: 'User Name',
              })}
              sortable={true}
              className="wrap-text"
              body={usernameTemplate}              
            />
            <Column
              field="email"
              header={intl.formatMessage({
                id: 'c-email',
                defaultMessage: 'Email',
              })}
              sortable={true}
              className="wrap-text"
            />
            <Column
              field="name"
              header={intl.formatMessage({
                id: 't-store-name',
                defaultMessage: 'Store Name',
              })}
              sortable={true}
              className="wrap-text"
            />
            <Column
              field="address"
              header={intl.formatMessage({
                id: 't-store-address',
                defaultMessage: 'Store Address',
              })}
              sortable={true}
              className="wrap-text store-address"
            />
            <Column
              className="wrap-text"
              body={actionBodyTemplate}
            />
          </DataTable>
        }
      </div>
    </>
  );
}
