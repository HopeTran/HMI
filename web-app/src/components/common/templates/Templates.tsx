import moment from 'moment';
import { capitalize, findIndex } from 'lodash';

import { DATE_FORMAT } from 'constants/constant';
import CONSTANTS, { STORE_CURRENCY, WEEKDAYS } from 'constants/common';

export const timeUTCTemplate = (data: any, row: any) => {
  return moment(data[row.field]).utc().format(DATE_FORMAT.LONG_DATE_TIME);
};

export const orderTime = (order: any, status: any) => {
  return (
    <div className="d-flex gap-3 mb-3">
      {status === CONSTANTS.ORDER_STATUS.WAIT_FOR_PAYMENT && <span className="font-bold">Created at:</span>}
      {status === CONSTANTS.ORDER_STATUS.CANCELED && <span className="font-bold">Canceled at:</span>}
      {status !== CONSTANTS.ORDER_STATUS.WAIT_FOR_PAYMENT && status !== CONSTANTS.ORDER_STATUS.CANCELED && (
        <span className="font-bold">Updated At:</span>
      )}
      <span>{moment(order.updatedAt).format('MMM DD HH:mm')}</span>
    </div>
  );
};

export const acceptOrderStatus = (status: string) => {
  if (status === CONSTANTS.ORDER_STATUS.WAIT_FOR_PAYMENT) {
    return 'Accept Order';
  } else if (status === CONSTANTS.ORDER_STATUS.PROCESSING) {
    return 'Confirm to pickup';
  } else if (status === CONSTANTS.ORDER_STATUS.NEED_TO_DELIVERY) {
    return 'Picked up';
  } else if (status === CONSTANTS.ORDER_STATUS.DELIVERING) {
    return 'Delivering';
  } else {
    return capitalize(status);
  }
};

export const orderStatus = (status: string) => {
  if (status === CONSTANTS.ORDER_STATUS.WAIT_FOR_PAYMENT) {
    return 'New';
  }
  if (status === CONSTANTS.ORDER_STATUS.NEED_TO_DELIVERY) {
    return 'Need to delivery';
  } else {
    return capitalize(status);
  }
};

export const scheduleMenus = (scm: any, index: number) => {   
    return (
      <div className="mb-4" key={index}>{scm?.weekDay}</div>
    )
};

export const operationTimes = (opt: any, index: number) => {
  return (
    <p key={index}>
      {WEEKDAYS.find((item) => item.value === opt.weekDay)?.label}:{' '}
      {opt?.availableFrom} - {opt?.availableTo}{' '}
    </p>
  )
};

export const cuisines = (cui: any, index: number) => {
  return (
    <span className="mr-2" key={index}>
      {cui.name}{index < cuisines.length ? ',' : ''}
    </span>
  )
};

export const categories = (cat: any, index: number) => {
  return (
    <span className="mr-2" key={index}>
      {cat.name}
    </span>
  )
};

export const currency = (price: any, currency: string) => {
  const findCurrencyIndex = findIndex(STORE_CURRENCY, ((e: any) => {return e.value === currency}));
  return (
    <>
      { currency !== STORE_CURRENCY[0].value ? 
        `${STORE_CURRENCY[findCurrencyIndex].symbol}${Number(price).toFixed(2)}` : `${price} ${STORE_CURRENCY[findCurrencyIndex].symbol}`}
    </>
  )
};