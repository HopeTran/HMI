import { Dialog } from 'primereact/dialog';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import hmiService from 'services/HomeMadeInn';
import CONSTANTS from 'constants/common';
import { setCartLocalStorage } from 'utilities/common';
import { useUser } from 'store/hooks';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';

import '../../../../statics/styles/percent_circle.scss';

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
  data: any;
}

const DIALOG_STYLE = { width: '450px' };

function OrderProgressing(props: Props) {
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState();

  const history = useHistory();
  const user = useUser();
  const dispatch = useDispatch();
  const intl = useIntl();

  const handleDialogHide = () => {
    setProgressPercent(0);
    if (props.onDismiss) {
      props.onDismiss();
    }
    if (props.onHide) {
      props.onHide();
    }
  };

  const handleCreateOrder = async () => {
    //Add cart to order
    if (props.data) {
      try {
        await hmiService.addOrder(props.data);
      } catch (err:any) {
        if (err.response) {
          setErrorMessage(err.response.data.message);
        } else {
          setErrorMessage(err.message);
        }
      }
    }
    //Delete cart from cartItem
    const cartData = props.data.products;
    if (cartData) {
      for (const item of cartData) {
        await hmiService.deleteCartItem(item.productId);
      }
    }
    setCartLocalStorage(user._id, null);
    localStorage.setItem(CONSTANTS.STORAGE_KEY.ORDER_DETAIL, JSON.stringify(props.data));
    dispatch({ type: 'cart_order', cart: [] });
    history.push('/order-delivering');
    props.onDismiss();
  };

  const countDownDay = () => {
    return (
      <div className="order-progressing-circle">
        <div className="tw-h-full tw-w-full tw-flex tw-justify-center tw-items-center">
          <div className="tw-inline-table tw-text-center">
            <div className={`c100 p${progressPercent * 10} green`}>
              <div className="slice">
                <div className="bar"></div>
                <div className="fill"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (props.visible) {
      const interval = setInterval(async () => {
        if (progressPercent <= 10) {
          setProgressPercent((prevCounter) => prevCounter + 1);
        } else {
          setProgressPercent(10);
          clearInterval();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [props.visible]);

  useEffect(() => {
    if (progressPercent === 10) {
      handleCreateOrder();
    }
  }, [progressPercent]);

  return (
    <Dialog
      appendTo={document.body}
      visible={props.visible}
      style={props.width ? { width: props.width } : DIALOG_STYLE}
      onHide={handleDialogHide}
      maximizable={false}
    className={intl.formatMessage({
      id: 't-order-progressing',
      defaultMessage: 'Order Progressing',
    })}
      closeOnEscape={true}
      closable={false}
    >
      <div className="text-center">
        <h4 className="mb-4 clr-white"><FormattedMessage id="t-order-progressing" defaultMessage="Order Progressing" /></h4>
        <div className="my-4 py-4 d-flex justify-content-center">{countDownDay()}</div>
        <button className="mt-4 px-4 d-inline btn-default" onClick={handleDialogHide}>
          Cancel Order
        </button>
        {errorMessage}
      </div>
    </Dialog>
  );
}

export default OrderProgressing;
