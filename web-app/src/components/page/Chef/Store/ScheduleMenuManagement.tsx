import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { RouteComponentProps } from 'react-router-dom';
import classnames from 'classnames';

import { config } from 'config';
import hmiService from 'services/HomeMadeInn';
import { WEEKDAYS } from 'constants/common';
import { addDays } from 'utilities/date';
import { useUser } from 'store/hooks';

import './ScheduleMenuManagement.scss';

const renderGeneralMealBodyCol = (rowData: any) => {
  return <InputSwitch disabled={true} checked={rowData?.product.isGeneralMeal} />;
};

const photoBodyTemplate = (rowData: any) => {
  return (
    <>
      {rowData.product && rowData.product.photo !== '' && (
        <div>
          <img className="img-preview" width={150} src={`${config.imageServerUrl}/${rowData.product.photo}`} />
        </div>
      )}
    </>
  );
};

export default function ScheduleMenuManagement(props: RouteComponentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [productChange, setProductChange] = useState<any>({});
  const [scheduleMenus, setScheduleMenus] = useState<any[]>([]);
  const [selectedWeekDay, setSelectedWeekDay] = useState(WEEKDAYS[new Date().getDay()].value);
  const user = useUser();

  const categoriesBodyTemplate = (rowData: any) => {
    const categoryNames = rowData?.product?.categories?.map((item: any) => item.name);
    return <span>{categoryNames && categoryNames?.length > 0 ? categoryNames.join(', ') : ''}</span>;
  };

  const handleWeekDayChange = (e: any) => {
    setSelectedWeekDay(e.value);
  };

  const getScheduleMenus = async () => {
    setIsLoading(true);
    const scheduleMenus = await hmiService.getScheduleMenus({ storeId: user?.storeId, weekDay: selectedWeekDay });
    setScheduleMenus(scheduleMenus);
    setIsLoading(false);
  };

  const updateScheduleMenu = async (params: any) => {
    setIsLoading(true);
    await hmiService.updateScheduleMenu(params);
    await getScheduleMenus();
    setIsLoading(false);
  };

  const renderPriceBodyCol = (rowData: any) => {
    const handlePriceChange = (e: any) => {
      if (rowData.price !== e.value) {
        rowData.price = e.value;
        setProductChange(rowData);
      }
    };

    return (
      <>
        <div className="p-inputgroup justify-content-end">
          <span className="p-inputgroup-addon">TWD $</span>
          <InputNumber min={0} max={999999} value={rowData.price} onValueChange={handlePriceChange} />
        </div>
        {Number(rowData.price) <= 0 && (
          <div className="p-inputgroup justify-content-end">
            <div className="p-invalid pt-1">Price must be greater than 0</div>
          </div>
        )}
      </>
    );
  };

  const renderInventoryBodyCol = (rowData: any) => {
    const handleInvChange = (e: any) => {
      if (rowData.inventory !== e.value) {
        rowData.inventory = e.value;
        setProductChange(rowData);
      }
    };
    return (
      <>
        <InputNumber
          value={rowData?.inventory}
          onValueChange={handleInvChange}
          showButtons
          min={rowData?.inventoryLeft || 0}
          max={99999}
          buttonLayout="horizontal"
          step={1}
          incrementButtonIcon="pi pi-plus"
          decrementButtonIcon="pi pi-minus"
        />
      </>
    );
  };

  const renderActiveBodyCol = (rowData: any) => {
    const handleActiveChange = (e: any) => {
      if (rowData.active !== e.value) {
        setProductChange({
          ...rowData,
          active: e.value,
        });
      }
    };
    return <InputSwitch checked={rowData.active} onChange={handleActiveChange} />;
  };

  const renderMenuItem = () => {
    const today = new Date();
    let indexDay = today.getDay();
    return WEEKDAYS.map((item: any, index) => {
      if (indexDay == 7) indexDay = 0;
      const itemDay = WEEKDAYS[indexDay++];
      return (
        <span
          id={itemDay.value}
          className={classnames('schedule-item-menu border rounded-md p-2 m-md-2 cursor-pointer', {
            active: selectedWeekDay === itemDay.value,
          })}
          onClick={() => handleWeekDayChange(itemDay)}
        >
          <div>{`${itemDay.label} ${index === 0 ? '(today)' : ''}`}</div>
          <div className="d-none d-md-inline-flex">{addDays(new Date(), index).toISOString().split('T')[0]}</div>
        </span>
      );
    });
  };

  useEffect(() => {
    if (productChange.productId && productChange.price > 0) {
      updateScheduleMenu(productChange);
    }
  }, [productChange.active, productChange.inventory, productChange.price]);

  useEffect(() => {
    if (user) getScheduleMenus();
  }, [user, selectedWeekDay]);

  return (
    <div className="schedule-menu-content">
      <Row className="filter filter-container tw-mb-4 tw-mt-4">
        <Col className="btn-col my-10">
          <span className="font-bold">Business Schedule Next 7 business days</span>
          <div className="py-4 schedule-menu">{renderMenuItem()}</div>
        </Col>
      </Row>
      <Row className="product-list">
        <DataTable value={scheduleMenus} loading={isLoading}>
          <Column
            header="Photo"
            body={photoBodyTemplate}
            sortable={false}
            bodyClassName="text-center"
            style={{ width: '170px' }}
          />
          <Column
            header="Product Name"
            field="product.name"
            sortable={true}
            filter
            filterPlaceholder="Search by name"
            style={{ width: '200px' }}
          />
          <Column header="Categories" body={categoriesBodyTemplate} sortable={false} style={{ width: '200px' }} />
          <Column header="Price" field="price" body={renderPriceBodyCol} style={{ width: '210px' }} />
          <Column
            header="General Meal"
            body={renderGeneralMealBodyCol}
            bodyClassName="text-center"
            style={{ width: '120px' }}
          />
          <Column
            header="Active on this day"
            field="active"
            body={renderActiveBodyCol}
            bodyClassName="text-center"
            style={{ width: '160px' }}
          />
          <Column header="Inventory" field="inventory" body={renderInventoryBodyCol} style={{ width: '150px' }} />
          <Column header="Order" field="inventoryLeft" style={{ width: '150px' }} bodyClassName="text-center" />
        </DataTable>
      </Row>
    </div>
  );
}
