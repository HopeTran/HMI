import { toUpper } from 'lodash';
import moment from 'moment';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';

import { DELIVERY_TYPES } from 'constants/common';
import PickATimeDialog from './PickATimeDialog';
import { formatPickedSchedule } from 'utilities/common';
import { useFilterStore } from 'store/hooks';
import StoresFilter from 'models/storesFilter';

interface Props {
  onPickedATime?: (filter: any) => void;
}

export default function DeliveryTimeDropdown(props: Props) {
  const [deliveryTypeValue, setDeliveryTypeValue] = useState(DELIVERY_TYPES[0].value);
  const [pickedSchedule, setPickedSchedule] = useState('');
  const [isShowDialog, setIsShowDialog] = useState(false);
  const deliveryTimeOpRef = useRef<OverlayPanel>(null);
  
  const dispatch = useDispatch();
  const storesFilter = useFilterStore();

  const handleAccountProfileClick = (e: any) => {
    if (deliveryTimeOpRef && deliveryTimeOpRef.current) {
      deliveryTimeOpRef.current.toggle(e, null);
    }
  };

  //On handle change selection
  const handleOnChangeDeliveryType = (e: any) => {
    setDeliveryTypeValue(e.value);
    if (e.value === DELIVERY_TYPES[1].value) {
      setIsShowDialog(true);
    } else {
      const resetFilter = new StoresFilter();
      dispatch({
        type: 'filter_store',
        filter: {
          ...storesFilter,
          weekDay: resetFilter.weekDay,
          pickedDate: resetFilter.pickedDate,
          deliveryStartTime: resetFilter.deliveryStartTime,
          deliveryEndTime: resetFilter.deliveryEndTime,
          deliveryType: resetFilter.deliveryType
        },
      });
    }
  };
  const intl = useIntl();
  // On Accept Pic A Time info dialog
  const handleAcceptConfirmDialog = (pickedWeekday: any, pickedTimes: any) => {
    const pickedTime = pickedTimes && pickedTimes.split(/[.,/ -]/);
    const selectedDeliveryTime = {
      weekDay: toUpper(moment(pickedWeekday).format('ddd')),
      pickedDate: moment(pickedWeekday).format('MMM Do'),
      deliveryStartTime: `${pickedTime[0]}`,
      deliveryEndTime: `${pickedTime[1]}`,
      deliveryType: deliveryTypeValue,
    };

    dispatch({
      type: 'filter_store',
      filter: {
        ...storesFilter,
        ...selectedDeliveryTime,
      },
    });

    if (props.onPickedATime) {
      props.onPickedATime(selectedDeliveryTime)
    };

    setIsShowDialog(false);
  };

  //On hide Pick A Time Dialog
  const handleHideConfirmDialog = () => {
    setIsShowDialog(false);
  };

  useEffect(() => {
    if (storesFilter) {
      if (storesFilter?.deliveryType === DELIVERY_TYPES[1].value) {
        setPickedSchedule(formatPickedSchedule(storesFilter));
        setDeliveryTypeValue(storesFilter.deliveryType);
      } else {
        setPickedSchedule(deliveryTypeValue);
      }
    }
  }, [storesFilter]);

  // Selected delivery time Template
  const selectedDeliveryTypeTemplate = (deliveryType: any, props: any) => {
    if (storesFilter?.deliveryType === DELIVERY_TYPES[1].value) {
      return <span>{pickedSchedule.length ? <FormattedMessage id="p-schedule-for-later-selected" values={{datetime: `${pickedSchedule}`}} /> : ''}</span>;
    } else if (storesFilter?.deliveryType === DELIVERY_TYPES[0].value) {
      return <span>{DELIVERY_TYPES[0].label}</span>;
    } else {
      return <span>{props.placeholder}</span>;
    }
  };

  // Render main component
  return (
    <>
      <div
        onClick={handleAccountProfileClick}
        className="d-flex justify-content-between align-items-center cursor-pointer deliveryType mx-lg-2"
      >
        <span className="delivery-content cursor-pointer w-full">
          {selectedDeliveryTypeTemplate(DELIVERY_TYPES, props)}
          <i className="pi pi-angle-down tw-pl-2 text-right" />
        </span>
        <OverlayPanel ref={deliveryTimeOpRef} className="schedule-pick-op">
          <div>
            {DELIVERY_TYPES.map((item: any, index: number) => {
              return (
                <div
                  key={index}
                  onClick={() => {
                    handleOnChangeDeliveryType(item);
                  }}
                  className="p-2"
                >
                  <FormattedMessage id={("t-").concat(item.label.replace(/\s+/g,'-').toLowerCase())} defaultMessage={item.label} />
                </div>
              );
            })}
          </div>
        </OverlayPanel>
      </div>

      <PickATimeDialog
        header={intl.formatMessage({
          id: 't-pick-a-time',
          defaultMessage: 'Pick A Time',
        })}
        visible={isShowDialog}
        onAccept={handleAcceptConfirmDialog}
        onDismiss={handleHideConfirmDialog}
        message={intl.formatMessage({
          id: 'm-are-you-sure-to-save-the-time-schedule',
          defaultMessage: 'Are you sure to save the time schedule',
        })}
      />
    </>
  );
}
