import { useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { RadioButton } from 'primereact/radiobutton';

import { DELIVERYTIMERANGES } from 'constants/common';
import moment from 'moment';

interface Props {
  appendTo?: HTMLElement;
  header?: string;
  acceptText?: string;
  dismissText?: string;
  visible: boolean;
  message?: string;
  messageAlignment?: string;
  onAccept?: any;
  onDismiss?: any;
  onHide?: any;
  width?: string;
  errorMsg?: string;
  disabled?: boolean;
  loading?: boolean;
}

export default function PickATimeDialog(props: Props) {
  const [pickedTime, setPickedTime] = useState(DELIVERYTIMERANGES[0]);
  const [pickedDay, setPickedDay] = useState();

  const today = moment().toDate();
  const nextWeek = moment().add(6, 'd').toDate();

  const handlePickATimeChange = (e: any) => {
    setPickedTime(e.value);
  };

  const handleDialogHide = () => {
    if (props.onDismiss) {
      props.onDismiss();
    }
    if (props.onHide) {
      props.onHide();
    }
  };

  const onHandelAcceptTheTime = () => {
    props.onAccept(pickedDay, pickedTime.value);
  };

  return (
    <Dialog
      appendTo={document.body}
      header={props.header ? props.header : 'Confirmation'}
      visible={props.visible}
      onHide={handleDialogHide}
      maximizable={false}
      className="confirm-dialog pick-a-time-dialog"
      closeOnEscape={false}
      closable={true}
    >
      <div className="d-md-flex justify-content-between gap-2 mb-4">
        <div className="field my-md-0 my-4">
          <Calendar
            id="pickedDay"
            value={pickedDay}
            onChange={(e: any) => setPickedDay(e.value)}
            minDate={today}
            maxDate={nextWeek}
            showIcon
            appendTo={document.body}
          />
        </div>
        <div className="d-block">
          {DELIVERYTIMERANGES.map((item: any) => {
            return (
              <div key={item.value} className="field-radiobutton d-flex gap-2 align-items-center mb-3">
                <RadioButton
                  inputId={item.value}
                  value={item}
                  name="sort"
                  onChange={handlePickATimeChange}
                  checked={pickedTime.value === item.value}
                />
                <label htmlFor={item.value}>{item.label}</label>
              </div>
            );
          })}
        </div>
      </div>
      <div className="d-flex justify-content-between gap-4 tw-mt-12">
        {(props.dismissText || 'No') && props.onDismiss && (
          <Button
            label={props.dismissText || 'No'}
            onClick={props.onDismiss}
            className="btn-default p-button w-100"
            disabled={props.loading}
          />
        )}
        {props.onAccept && (
          <Button
            label={props.acceptText || 'Yes'}
            onClick={onHandelAcceptTheTime}
            disabled={props.disabled}
            className="btn-default p-button w-100"
            loading={props.loading}
          />
        )}
      </div>
    </Dialog>
  );
}
