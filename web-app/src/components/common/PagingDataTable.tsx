import { DataTable, DataTableProps  } from 'primereact/datatable';
import React, { useEffect, useState, ReactNode } from 'react';

interface Props extends DataTableProps {
  children: ReactNode;
  reLoadData: (a: any) => void;
}

export const DEFAULT_ROW_NUMBER = 25;

function PagingDataTable(props: Props) {
  const { value, loading, rows, reLoadData, sortField, sortOrder, ...rest } = props;
  const [multiSortData, setMultiSortData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({
    first: 0,
    page: 1,
    rows: DEFAULT_ROW_NUMBER,
  });

  const handlePageChange = (event: any) => {
    let pagingParams = { ...pagination, ...event };
    setPagination(pagingParams);
  };

  const handleSortChange = (e: any) => {
    let newSortData = [...multiSortData];
    const sort = multiSortData.find((item: any) => {
      return item.field === e.multiSortMeta[0].field;
    });

    if (sort) {
      if (sort.order === 1) {
        sort.order = -1;
        newSortData.splice(newSortData.indexOf(sort), 1);
        newSortData.splice(0, 0, sort);
      } else {
        newSortData.splice(newSortData.indexOf(sort), 1);
      }
    } else {
      newSortData = [...e.multiSortMeta];
    }
    setMultiSortData(newSortData);
  };

  useEffect(() => {
    setMultiSortData([{ field: props.sortField, order: props.sortOrder }]);
  }, [props.sortField]);

  useEffect(() => {
    const queries: any = { offset: pagination.first, limit: pagination.rows };
    if (multiSortData.length > 0) {
      queries['sortField'] = multiSortData[0].field;
      queries['sortOrder'] = multiSortData[0].order;
    }
    reLoadData(queries);
  }, [pagination, multiSortData]);

  return (
    <DataTable
      className="paging-table"
      {...rest}
      value={value}
      loading={loading}
      paginator={true}
      lazy
      multiSortMeta={multiSortData}
      onPage={handlePageChange}
      onSort={handleSortChange}
      first={pagination.first}
      rows={rows || DEFAULT_ROW_NUMBER}
    >
      {props.children}
    </DataTable>
  );
}

export default PagingDataTable;
