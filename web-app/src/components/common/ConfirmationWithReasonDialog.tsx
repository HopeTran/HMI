import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { RadioButton } from 'primereact/radiobutton';
import React, { useEffect, useState } from 'react';
import { Row, Grid } from 'react-flexbox-grid';

interface Props {
  appendTo?: HTMLElement;
  header: string;
  acceptText: string;
  dismissText?: string;
  visible: boolean;
  message?: string;
  onAccept: any;
  onDismiss?: any;
  width?: string;
  defaultReason: string;
  reasonList?: any;
}

const DIALOG_STYLE = { width: '450px', height: '' };

function ConfirmationWithReasonDialog(props: Props) {
  const [reason, setReason] = useState(props.defaultReason);
  const [selectedReason, setSelectedReason] = useState<any>();

  const handleDialogHide = () => {
    if (props.onDismiss) {
      props.onDismiss();
    }
  };

  const onTextChange = (e: any) => {
    setReason(e.target.value);
  };

  const onAccept = () => {
    props.onAccept(reason);
    if (props.onDismiss) {
      props.onDismiss();
    }
  };

  const onHandleReasonChange = (e: any) => {
    setSelectedReason(e.value.value);
    setReason(e.value.value);
  };

  useEffect(() => {
    if (props.reasonList) {
      setSelectedReason(props.reasonList[0]);
    }
  }, [props.reasonList]);

  return (
    <Dialog
      appendTo={document.body}
      header={props.header}
      visible={props.visible}
      style={props.width ? { width: props.width } : DIALOG_STYLE}
      onHide={handleDialogHide}
      maximizable={false}
      className="confirm-dialog"
    >
      <Grid>
        {props.message && (
          <Row>
            <p className="text-center text-bold" dangerouslySetInnerHTML={{ __html: props.message }} />
          </Row>
        )}
        <Row className="mb-4">
          {props.reasonList &&
            props?.reasonList.map((reason: any) => {
              return (
                <div key={reason.value} className="field-radiobutton mt-2 gap-2 d-flex">
                  <RadioButton
                    inputId={reason.value}
                    name="reason"
                    value={reason}
                    onChange={onHandleReasonChange}
                    checked={selectedReason?.value === reason?.value}
                  />
                  <label htmlFor={reason?.value}>{reason?.label}</label>
                </div>
              );
            })}
        </Row>
        {!props.reasonList && (
          <Row className="reason-row mb-4">
            <div className="reason-label tw-mr-2 mb-2">Please enter the reason</div>
            <input className="reason-input p-inputtext" type="text" value={reason} onChange={onTextChange} />
          </Row>
        )}
        <div className="button-group mt-10 d-flex gap-4 justify-content-between">
          <Button label={props.acceptText} onClick={onAccept} className="npl-btn tw-mr-2 w-100" />
          {props.dismissText && props.onDismiss && (
            <Button label={props.dismissText} className="npl-btn w-100" onClick={props.onDismiss} />
          )}
        </div>
      </Grid>
    </Dialog>
  );
}

export default ConfirmationWithReasonDialog;
