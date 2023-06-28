import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';
import { addLocale } from 'primereact/api';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import React, { useEffect, useState } from 'react';
import { Col } from 'react-flexbox-grid';

import './DateRangeFilter.scss';

import { useIntl } from 'react-intl';

export const THIS_YEAR = 'this-year';
export const THIS_WEEK = 'this-week';

const DATE_FORMAT = {
  SHORT_DATE: 'MM-DD-YYYY',
  LONG_DATE_TIME: 'MM-DD-YYYY HH:mm:ss',
  LONG_DATE_TIME_WITH_TIMEZONE: 'MM-DD-YYYY HH:mm:ss ZZ',
};

export const EMPTY_DATE = '-----';
export const ALL = 'All';

interface Props {
  dateLabel?: string;
  fromLabel?: string;
  toLabel?: string;
  submitBtnLabel?: string;
  isHasEmptyOption?: boolean;
  hideSubmit?: boolean;
  disabled?: boolean;
  onDateRangeChange: (dates: any) => void;
  dateRange?: any;
}

export const DATE_RANGE_VALUES: any = {
  ALL_TIME: 'all-time',
};

function DateRangeFilter(props: Props) {
  const intl = useIntl();
  const dateRanges = [
    { label: intl.formatMessage({
      id: 't-today',
      defaultMessage: 'Today',
    }), value: 'today' },
    { label: intl.formatMessage({
      id: 't-yesterday',
      defaultMessage: 'Yesterday',
    }), value: 'yesterday' },
    { label: intl.formatMessage({
      id: 't-this-week',
      defaultMessage: 'This Week',
    }), value: THIS_WEEK },
    { label: intl.formatMessage({
      id: 't-last-week',
      defaultMessage: 'Last week',
    }), value: 'last-week' },
    { label: intl.formatMessage({
      id: 't-this-month',
      defaultMessage: 'This month',
    }), value: 'this-month' },
    { label: intl.formatMessage({
      id: 't-last-month',
      defaultMessage: 'Last month',
    }), value: 'last-month' },
    { label: intl.formatMessage({
      id: 't-this-quarters',
      defaultMessage: 'This quarters',
    }), value: 'this-quarter' },
    { label: intl.formatMessage({
      id: 't-last-quarters',
      defaultMessage: 'Last quarters',
    }), value: 'last-quarter' },
    { label: intl.formatMessage({
      id: 't-this-year',
      defaultMessage: 'This year',
    }), value: THIS_YEAR },
    { label: intl.formatMessage({
      id: 't-last-year',
      defaultMessage: 'Last Year',
    }), value: 'last-year' },
    { label: intl.formatMessage({
      id: 't-custom-date',
      defaultMessage: 'Custom date',
    }), value: 'custom-date' },
    { label: intl.formatMessage({
      id: 't-all-time',
      defaultMessage: 'All time',
    }), value: DATE_RANGE_VALUES.ALL_TIME },
  ];

  if (props.isHasEmptyOption && dateRanges[0].value !== EMPTY_DATE) {
    dateRanges.unshift({ label: ALL, value: EMPTY_DATE });
  }

  const [selectedRange, setSelectedRange] = useState(
    props.dateRange && props.dateRange.range ? props.dateRange.range : dateRanges[0].value,
  );
  const [selectedFromTo, setSelectedFromTo] = useState({
    from:
      props.dateRange && props.dateRange.from && props.dateRange.from !== EMPTY_DATE
        ? moment(props.dateRange.from, DATE_FORMAT.SHORT_DATE)
        : props.dateRange && props.dateRange.from === EMPTY_DATE
          ? moment(0)
          : moment(),
    to:
      props.dateRange && props.dateRange.to && props.dateRange.to !== EMPTY_DATE
        ? moment(props.dateRange.to, DATE_FORMAT.SHORT_DATE)
        : props.dateRange && props.dateRange.to === EMPTY_DATE
          ? moment(0)
          : moment(),
  });

  /* Events */
  const updateSelectedFromAndSelectedTo = () => {
    if (selectedRange === dateRanges[10].value) {
      return;
    }

    let from: any;
    let to: any;

    switch (selectedRange) {
      case EMPTY_DATE:
        from = to = moment(0);
        break;
      case 'yesterday':
        from = moment().subtract(1, 'days').startOf('day');
        to = moment().subtract(1, 'days').endOf('day');
        break;
      case 'this-week':
        from = moment().startOf('isoWeek');
        to = moment();
        break;
      case 'last-week':
        from = moment().subtract(1, 'week').startOf('isoWeek');
        to = moment().subtract(1, 'week').endOf('isoWeek');
        break;
      case 'this-month':
        from = moment().startOf('month');
        to = moment();
        break;
      case 'last-month':
        from = moment().subtract(1, 'month').startOf('month');
        to = moment().subtract(1, 'month').endOf('month');
        break;
      case 'this-quarter':
        from = moment().startOf('quarter');
        to = moment();
        break;
      case 'last-quarter':
        from = moment().subtract(1, 'quarter').startOf('quarter');
        to = moment().subtract(1, 'quarter').endOf('quarter');
        break;
      case 'this-year':
        from = moment().startOf('year');
        to = moment();
        break;
      case 'last-year':
        from = moment().subtract(1, 'year').startOf('year');
        to = moment().subtract(1, 'year').endOf('year');
        break;
      case 'all-time':
        from = moment().startOf('day');
        to = moment().endOf('day');
        break;
      case 'today':
        from = moment().startOf('day');
        to = moment().endOf('day');
        break;
      default:
        from = to = moment();
    }

    const fromToValue = cloneDeep(selectedFromTo);
    fromToValue.from = from;
    fromToValue.to = to;
    setSelectedFromTo(fromToValue);
  };

  const handleDateRangeChanged = (e: any) => {
    setSelectedRange(e.value);
  };

  const handleFromDateChanged = (e: any) => {
    const fromToValue = cloneDeep(selectedFromTo);
    fromToValue.from = moment(e.value);
    setSelectedFromTo(fromToValue);

    const customIndex = props.isHasEmptyOption ? 11 : 10;
    setSelectedRange(dateRanges[customIndex].value);
  };

  const handleToDateChanged = (e: any) => {
    const fromToValue = cloneDeep(selectedFromTo);
    fromToValue.to = moment(e.value).endOf('day');
    setSelectedFromTo(fromToValue);

    const customIndex = props.isHasEmptyOption ? 11 : 10;
    setSelectedRange(dateRanges[customIndex].value);
  };

  const submitChanges = () => {
    props.onDateRangeChange({
      range: selectedRange,
      from: selectedFromTo.from.valueOf() > 0 ? `${selectedFromTo.from.valueOf()}` : EMPTY_DATE,
      to: selectedFromTo.to.valueOf() > 0 ? `${selectedFromTo.to.valueOf()}` : EMPTY_DATE,
    });
  };

  useEffect(() => {
    updateSelectedFromAndSelectedTo();
  }, [selectedRange]);

  useEffect(() => {
    if (props.hideSubmit) {
      submitChanges();
    }
  }, [selectedFromTo]);

  useEffect(() => {
    if (props.dateRange?.range === EMPTY_DATE) {
      setSelectedRange(EMPTY_DATE);
    }
  }, [props.dateRange]);

  addLocale("en", {
    firstDayOfWeek: 1,
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dayNamesMin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    monthNames: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    today: 'Today',
    clear: 'Clear',
    weekHeader: 'Wk',
  });
  return (
    <div className='daterange-filter-wrapper'>
      <div className='daterange-filter-content d-flex me-4'>
        <Col className='date-container me-4'>
          <Dropdown
            options={dateRanges}
            value={selectedRange}
            disabled={props.disabled}
            onChange={handleDateRangeChanged}
          />
        </Col>
        {selectedRange !== 'all-time' && (
          <>
            <Col className='from-container me-4'>
              <label className='me-2'>
                {props.fromLabel || 'From'}
              </label>
              {selectedFromTo.from.valueOf() !== 0 ? (
                <Calendar
                  value={selectedFromTo.from.toDate()}
                  className='calendar'
                  dateFormat='M dd yy'
                  readOnlyInput={true}
                  onChange={handleFromDateChanged}
                  disabled={props.disabled}
                  locale="en"
                />
              ) : (
                <span className='p-calendar calendar p-inputwrapper-filled'>
                  <input
                    type='text'
                    className='p-inputtext p-component p-inputtext p-component p-filled'
                    value={EMPTY_DATE}
                    readOnly={true}
                  />
                </span>
              )}
            </Col>
            <Col className='to-container me-4'>
              <label className='me-2'>
                {props.toLabel || 'To'}
              </label>
              {selectedFromTo.to.valueOf() !== 0 ? (
                <Calendar
                  value={selectedFromTo.to.toDate()}
                  className='calendar'
                  dateFormat='M dd yy'
                  readOnlyInput={true}
                  disabled={props.disabled}
                  onChange={handleToDateChanged}
                  locale="en"
                />
              ) : (
                <span className='p-calendar calendar p-inputwrapper-filled'>
                  <input
                    type='text'
                    className='p-inputtext p-component p-inputtext p-component p-filled'
                    value={EMPTY_DATE}
                    readOnly={true}
                  />
                </span>
              )}
            </Col>
          </>
        )}
        {!props.hideSubmit && (
          <Col className='btn-go-wrapper ml-4'>
            <Button onClick={submitChanges} label={props.submitBtnLabel || 'Go'} />
          </Col>
        )}
      </div>
    </div>
  );
}

export default DateRangeFilter;
