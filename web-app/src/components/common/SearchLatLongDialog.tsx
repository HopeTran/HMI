import { Dialog } from "primereact/dialog";

import AddressAutoComplete from "components/common/AddressAutoComplete";

interface Props {
  appendTo?: HTMLElement;
  header?: string;
  acceptText?: string;
  dismissText?: string;
  visible: boolean;
  message?: string;
  messageAlignment?: string; 
  onDismiss?: any;
  onHide?: any;
  width?: string;
  onSelectedAdrress : (e:any) => void
}

const DIALOG_STYLE = { width: '450px' };

export default function SearchLatLongDialog(props: Props) {

  const handleDialogHide = () => {
    if (props.onDismiss) {
      props.onDismiss();
    }
    if (props.onHide) {
      props.onHide();
    }
  };

  const handleStoreAddressChanged = (addressInfo: any) => {
    props.onSelectedAdrress({
      address: addressInfo.address || '',
      latitude: addressInfo.latitude || 0,
      longitude: addressInfo.longitude || 0,
      country: addressInfo.country || '',
      currency: addressInfo.currency
    });
    props.onHide();
  };

  return (
    <Dialog
      appendTo={document.body}
      visible={props.visible}
      style={props.width ? { width: props.width } : DIALOG_STYLE}
      onHide={handleDialogHide}
      maximizable={false}
      className="confirm-dialog"
      closeOnEscape={true}
      closable={true}
      header='Search Geocode'
    >
      <div className="w-100">
        <div className="mr-4 w-100" style={{minHeight: '150px'}}>
          <AddressAutoComplete onChange={handleStoreAddressChanged} defaultAddress={''} className="w-100"/>
        </div>
      </div>
    </Dialog>
  )
}