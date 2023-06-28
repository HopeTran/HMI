import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import moment from 'moment';
import { bignumber, chain } from 'mathjs';
import { useLocation } from 'react-router-dom';
import { capitalize, isArray } from 'lodash';

import { COLUMN_OPTIONS } from '../constants/admin';
import CONSTANTS from 'constants/common';

const getValue = (value: any, defaultValue: any) => {
  return !isEmpty(value) ? value : defaultValue;
};

const getFormattedNumberWithAbbreviation = (value: number, withAbbreviation: boolean = false) => {
  let result = { value, abbreviation: '' };
  if (withAbbreviation) {
    if (Math.abs(value) > 1e9) {
      result = { value: value / 1e9, abbreviation: 'B' };
    } else if (Math.abs(value) > 1e6) {
      result = { value: value / 1e6, abbreviation: 'M' };
    } else if (Math.abs(value) > 1e3) {
      result = { value: value / 1e3, abbreviation: 'k' };
    }
  }
  return result;
};

const isShowColumn = (columnList: any[], column: string): boolean => {
  return columnList.includes(column);
};

let isMobileState: boolean;
const isMobile = () => {
  if (isMobileState === undefined) {
    const mobilePortrait = window.matchMedia(
      '(min-width: 300px) and (max-width: 480px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)',
    );
    isMobileState = mobilePortrait.matches;
  }

  return isMobileState;
};

let isTabletState: boolean;
const isTablet = (isLandingPage?: boolean) => {
  if (isTabletState === undefined) {
    const mobileLandscape = window.matchMedia(
      '(min-width: 481px) and (max-width: 812px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: landscape)',
    );
    const tablePortrait = window.matchMedia(
      '(min-width: 601px) and (max-width: 1200px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)',
    );
    // TODO: Remove this parameter to match requirement for tablet screen
    if (!isLandingPage) {
      const tabletLandscape = window.matchMedia(
        // tslint:disable-next-line:max-line-length
        '(min-width: 1024px) and (max-width: 1600px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: landscape)',
      );
      isTabletState = tabletLandscape.matches;
    }

    isTabletState = isTabletState || mobileLandscape.matches || tablePortrait.matches;
  }

  return isTabletState;
};

let isDesktopState: boolean;
const isDesktop = () => {
  if (isDesktopState === undefined) {
    const desktop = window.matchMedia('(min-width: 1200px) and (-webkit-min-device-pixel-ratio: 1)');
    const tabletLandscape = window.matchMedia(
      // tslint:disable-next-line:max-line-length
      '(min-width: 1024px) and (max-width: 1600px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: landscape)',
    );
    isDesktopState = desktop.matches || tabletLandscape.matches;
  }

  return isDesktopState;
};

let isMobileDeviceState: boolean;
const isMobileDevice = () => {
  if (isMobileDeviceState === undefined) {
    isMobileDeviceState =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (/Mac/i.test(navigator.userAgent) && navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 2);
  }

  return isMobileDeviceState;
};

const getDisplayFields = (columns: string[]) => {
  const fields = columns.map((item: any) => {
    const col = find(COLUMN_OPTIONS, { value: item });
    if (col) {
      return col.field;
    }
    return null;
  });
  return fields;
};

const redirectToLink = (link: string) => {
  if (typeof window !== 'undefined') {
    window.location.href = link;
  }
};

const getNumberByStep = (value: number, step: number) => {
  return step > 0 ? chain(bignumber(value)).divide(step).ceil().multiply(step).done().toNumber() : value;
};

const isNumber = (str: any) => {
  return !isNaN(str);
};

const findObjectByField = (obj: any, fieldName: string, fieldValue: any) => {
  for (const key in obj) {
    if (obj[key][fieldName] === fieldValue) {
      return obj[key];
    }
  }
};

export const roundNumberByDecimalNumber = (number: number, decicmalNumber: number) => {
  return Math.round(number * Math.pow(10, decicmalNumber)) / Math.pow(10, decicmalNumber);
};

export const roundUpNumberByDecimalNumber = (number: number, decicmalNumber: number) => {
  return Math.ceil(number * Math.pow(10, decicmalNumber)) / Math.pow(10, decicmalNumber);
};

export const setItemLocalStorage = (storageKey: string, data: any) => {
  localStorage.setItem(storageKey, JSON.stringify(data));
};

export const setCartLocalStorage = (user: string, data: any) => {
  localStorage.setItem(CONSTANTS.STORAGE_KEY.CART_ORDER, JSON.stringify({ user, data: JSON.stringify(data) }));
};

export const getCartLocalStorage = () => {
  const localData: any = localStorage.getItem(CONSTANTS.STORAGE_KEY.CART_ORDER);
  return JSON.parse(localData, (key: string, value: any) => {
    if (key === 'data') {
      return JSON.parse(value);
    } else {
      return value;
    }
  });
};

export const formatNumberWithAbbreviation = (num: number, digits: number) => {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
};

export const useQuery = () => {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
};

export const roundPriceNumber = (value: any) => {
  const valueNum = Number(value);
  if (isNaN(valueNum)) {
    return value;
  }
  return Number.isInteger(valueNum) ? valueNum : Number(valueNum.toFixed(2));
};

export const formatPickedSchedule = (filters: any) => {
  return filters
    ? `${capitalize(filters?.weekDay)}, 
        ${filters?.pickedDate}
        ${moment(filters?.deliveryStartTime, 'HH:mm:ss').format('LT')} -
        ${moment(filters?.deliveryEndTime, 'HH:mm:ss').format('LT')}`
    : '';
};

export const getInitialValueForDeliveryTime = (deliveryFilterValue: any, initialFilterValue: any) => {
  return deliveryFilterValue ? deliveryFilterValue : initialFilterValue;
};

export const isValidOrders = (cartOrders: any[]) => {
  let isValid = true;
  if (isArray(cartOrders) && cartOrders?.length > 0) {
    cartOrders?.forEach((order: any) => {
      if (order.quantity > order.inventory) {
        isValid = false;
        return false;
      }
    });
  } else {
    isValid = false;
  }
  return isValid;
};

export {
  getValue,
  getFormattedNumberWithAbbreviation,
  isShowColumn,
  isMobile,
  isTablet,
  isDesktop,
  isMobileDevice,
  getDisplayFields,
  redirectToLink,
  getNumberByStep,
  isNumber,
  findObjectByField,
};
