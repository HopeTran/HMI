import moment from 'moment';
import CONSTANTS from '../constants/common';

export { convertLocalDateToUTCDate };

const convertLocalDateToUTCDate = (time: any) => {
  const timeMoment = moment(time);
  const timezoneOffset = timeMoment.utcOffset();
  return timeMoment.add(timezoneOffset, 'm');
};

export const convertUTCDateToLocalTimeZoneLongFormat = (dateValue: string) => {
  if (dateValue) {
    return moment(dateValue).format(CONSTANTS.DATE_FORMAT.LONG_DATE_TIME_WITH_TIMEZONE);
  }
  return dateValue;
};

export const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
