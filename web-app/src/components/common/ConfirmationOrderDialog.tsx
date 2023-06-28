import { Dialog } from 'primereact/dialog';
import { useEffect, useState } from 'react';

import { config } from 'config';
import AddOrEditOrderForm from './AddOrEditOrderForm';

import mealPhotoDefault from "../../statics/images/store-photo-default.png";
import { currency } from './templates/Templates';

interface Props {
  appendTo?: HTMLElement;
  header?: string;
  acceptText?: string;
  dismissText?: string;
  visible: boolean;
  message?: string;
  messageAlignment?: string;
  onAccept: any;
  onDismiss?: any;
  onHide?: any;
  width?: string;
  errorMsg?: string;
  disabled?: boolean;
  loading?: boolean;
  quantity: any;
  selectedProduct: any;
  currency: string;
  onNumberOrderChange: (e:any, id: any) => void;
  storeInfo?: any;
}

const DIALOG_STYLE = { width: '450px' };

function ConfirmationOrderDialog(props: Props) {
  
  const [numberOrder, setNumberOrder] = useState(1);
  const [productInfo, setProductInfo] = useState<any>();

  const handleDialogHide = () => {
    if (props.onDismiss) {
      props.onDismiss();
    }
    if (props.onHide) {
      props.onHide();
    }
  };

  const onHandleQuantityChange = (numberOrder: any, id: any) => {
    props.onDismiss();
    props.onNumberOrderChange(numberOrder, id)
  }

  useEffect(() => {
    setProductInfo(props.selectedProduct);
    setNumberOrder(props.quantity);
  }, [props.selectedProduct, props.quantity])

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
    >
      {productInfo && 
        <div className="meal p-2 storeMenuCategory">
          <div className="mb-4">
            <h5 className="font-bold">{productInfo.name}</h5>
            <p>{productInfo.description}</p>
          </div>
          <div className='mb-4'>
            <img src={productInfo.photo ?  `${config.imageServerUrl}/${productInfo.photo}` : mealPhotoDefault} alt="Meal" className="w-100"/>
          </div>
          <div className="d-flex justify-content-between align-items-center gap-4 mb-4">
            <div className="col-6 mb-4">
              <span className='mb-2'>Price</span><br/>
              <h5>{currency(productInfo.price, props.currency || 'usd')}</h5>
            </div>
            <AddOrEditOrderForm
              quantity={numberOrder}
              selectedProduct={productInfo}
              onNumberOrderChange={onHandleQuantityChange}
              hasAddToCartButton={true}
              storeInfo={props.storeInfo}
              classNames="btn-absolute"
            />
          </div>
        </div>
      }
    </Dialog>
  );
}

export default ConfirmationOrderDialog;
