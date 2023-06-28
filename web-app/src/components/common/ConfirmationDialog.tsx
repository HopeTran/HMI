import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

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

const DIALOG_STYLE = { width: '450px' };
function ConfirmationDialog(props: Props) {
  const handleDialogHide = () => {
    if (props.onDismiss) {
      props.onDismiss();
    }
    if (props.onHide) {
      props.onHide();
    }
  };

  return (
    <Dialog
      appendTo={document.body}
      header={props.header ? props.header : 'Confirmation'}
      visible={props.visible}
      style={props.width ? { width: props.width } : DIALOG_STYLE}
      onHide={handleDialogHide}
      maximizable={false}
      className="confirm-dialog"
      closeOnEscape={false}
      closable={true}
    >
      <div className="tw-pt-12">
        <p
          className={'text-' + props.messageAlignment || 'center'}
          // @ts-ignore
          dangerouslySetInnerHTML={{ __html: props.message }}
        />
      </div>
      {props.errorMsg && (
        <div className="error-row p-invalid">
          <p className={'text-' + props.messageAlignment || 'center'}>{props.errorMsg}</p>
        </div>
      )}
      <div className="d-flex justify-content-between gap-4 tw-mt-12">
        {props.onAccept && 
          <Button type="button" label={props.acceptText || 'Yes'} onClick={props.onAccept} disabled={props.disabled} className="btn-default p-button w-100" loading={props.loading} />
        }
        {(props.dismissText || 'No') && props.onDismiss && (
          <Button label={props.dismissText || 'No'} onClick={props.onDismiss} className="btn-default p-button w-100" disabled={props.loading} />
        )}
      </div>
    </Dialog>
  );
}

export default ConfirmationDialog;
