import orderBy from 'lodash/orderBy';
import slice from 'lodash/slice';
import { DataTable, DataTableProps } from 'primereact/datatable';
import React, { useEffect, useState, ReactNode } from 'react';
import { Button } from 'primereact/button';

import { DEFAULT_DATATABLE_ROW_HEIGHT } from '../../constants/constant';
import LoadingBody from './LoadingBody';

interface Props extends DataTableProps {
  children: ReactNode;
  loadMore?: {
    isShow: boolean;
    onLoadMore: any;
  };
}

const DEFAUL_ROW_NUMBER = 20;

function VirtualScrollGrid(props: Props) {
  const {
    value,
    loading,
    rows,
    scrollable,
    scrollHeight,
    virtualScrollerOptions,
    totalRecords,
    lazy,
    sortField,
    sortOrder,
    ...rest
  } = props;

  const [rowNumber, setRowNumber] = useState(props.rows || DEFAUL_ROW_NUMBER);
  const [renderedData, setRenderedData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(props.loading);
  const [multiSortData, setMultiSortData] = useState<any[]>([]);
  const renderElements: ReactNode[] = [];
  const [sortedData, setSortedData] = useState<any>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  React.Children.toArray(props.children).forEach((item: any) => {
    renderElements.push(
      React.cloneElement(item, {
        loadingBody: item.props.loadingBody || LoadingBody,
      }),
    );
  });

  const footer = (
    <Button
      type="button"
      label="Load more"
      onClick={props.loadMore?.onLoadMore}
    />
  );

  const getRenderedData = (firstIndex: number = 0) => {
    let data = sortedData;
    if (sortedData.length > 0) {
      const nextPageIndex = firstIndex + DEFAUL_ROW_NUMBER * 2;
      const remainingItems = sortedData.length - nextPageIndex;
      const currentPage = Math.round(firstIndex / DEFAUL_ROW_NUMBER);
      const lastPage = Math.round(sortedData.length / DEFAUL_ROW_NUMBER);

      // Check for the last page
      if (remainingItems > 0 && remainingItems < DEFAUL_ROW_NUMBER && currentPage === lastPage - 2) {
        setRowNumber(DEFAUL_ROW_NUMBER + remainingItems);
      }
      const nextIndex = remainingItems > DEFAUL_ROW_NUMBER ? nextPageIndex : nextPageIndex + remainingItems;
      data = slice(sortedData, firstIndex, nextIndex);
    }
    setRenderedData(data);
  };

  useEffect(() => {
    getRenderedData(currentIndex);
  }, [sortedData]);

  useEffect(() => {
    let data = props.value;
    if (multiSortData.length > 0) {
      const fields = [];
      const orders: any[] = [];
      for (const sort of multiSortData) {
        fields.push(sort.field);
        orders.push(sort.order < 0 ? 'desc' : 'asc');
      }
      data = orderBy(props.value, fields, orders);
    }
    setSortedData(data);
  }, [props.value, multiSortData]);

  useEffect(() => {
    let data = props.value
      ? props.value.filter((item: any) => {
          return (
            item?.email?.toLowerCase().startsWith(props.globalFilter?.trim().toLowerCase()) ||
            item?.username?.toLowerCase().startsWith(props.globalFilter?.trim().toLowerCase())
          );
        })
      : [];
    setSortedData(data);
  }, [props.globalFilter]);

  useEffect(() => {
    setIsLoading(props.loading);
  }, [props.loading]);

  useEffect(() => {
    setMultiSortData([{ field: props.sortField, order: props.sortOrder }]);
  }, [props.sortField]);

  const handleVirtualScroll = (e: any) => {
    if (props.virtualScrollerOptions?.onLazyLoad) {
      props.virtualScrollerOptions.onLazyLoad(e);
    } else {
      setCurrentIndex(e.first);
      getRenderedData(e.first);
    }
  };

  const handleSorting = (e: any) => {
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

  return (
    <DataTable
      {...rest}
      value={renderedData}
      loading={isLoading}
      rows={rowNumber}
      scrollable={true}
      scrollHeight={props.scrollHeight}
      virtualScrollerOptions={{lazy: true, onLazyLoad: handleVirtualScroll, delay: 0, itemSize: DEFAULT_DATATABLE_ROW_HEIGHT}}
      totalRecords={props.value ? props.value.length : 0}
      onSort={handleSorting}
      multiSortMeta={multiSortData || []}
      footer={props.loadMore?.isShow ? footer : undefined}
    >
      {renderElements}
    </DataTable>
  );
}

export default VirtualScrollGrid;
