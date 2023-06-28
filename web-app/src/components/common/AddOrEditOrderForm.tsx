import { findIndex } from 'lodash';
import { InputNumber } from 'primereact/inputnumber';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Toast } from 'primereact/toast';

import { useCart, useUser } from 'store/hooks';
import hmiService from 'services/HomeMadeInn';
import ConfirmationDialog from './ConfirmationDialog';
import CONSTANTS from 'constants/common';
import Cart from 'models/cart';
import { setCartLocalStorage, setItemLocalStorage } from 'utilities/common';

import cartIcon from '../../statics/images/cart.png';
import { FormattedMessage } from 'react-intl';

interface Props {
  quantity: any;
  selectedProduct?: any;
  onNumberOrderChange: (e: any, id: any) => void;
  hasAddToCartButton?: boolean;
  classNames?: any;
  storeInfo?: any;
  resetValue?: boolean;
}

function AddOrEditOrderForm(props: Props) {
  const [numberOrder, setNumberOrder] = useState(1);
  const [productInfo, setProductInfo] = useState<any>();
  const [initialOrder, setInitialOrder] = useState<any>({});
  const [confirmRenewCart, setConfirmRenewCart] = useState(false);
  const [renewCartData, setRenewCartData] = useState<any>();

  const dispatch = useDispatch();
  const user = useUser();
  const cartOrdered = useCart();
  const cartOrderLocalStorage = localStorage.getItem(CONSTANTS.STORAGE_KEY.CART_ORDER);

  const toast: any = useRef();

  //Get initial cart
  const getCarts = async () => {
    if (cartOrderLocalStorage) {
      setInitialOrder(JSON.parse(cartOrderLocalStorage));
    } else {
      if (user.status) {
        const data = await hmiService.getCarts();
        if (data.length > 0) {
          setInitialOrder(data);
        }
      }
    }
  };

  //on Handle add to cart
  const onHandleAddToCart = (numberOrder?: any, product?: any) => {
    let currentCartItems: any[] = initialOrder ? initialOrder : [];

    const orderItem: Cart = {
      userId: user._id,
      productId: product.id,
      quantity: numberOrder,
      product: product,
    };

    // Check if the adding product existed in the cart
    const orderIndex: any = findIndex(currentCartItems, { productId: product.id || product.productId });
    // Check if there're no product of other store in the cart
    const storeIndex = findIndex(
      currentCartItems,
      (e) => e.product?.storeId === (props.selectedProduct?.storeId || props.selectedProduct?.product.storeId),
    );
    
    if (numberOrder > 0) {
      if (storeIndex > -1) {
        // The added product belongs to the current store so push it to cart
        if (orderIndex > -1) {
          currentCartItems[orderIndex].quantity = props.hasAddToCartButton
            ? currentCartItems[orderIndex].quantity + numberOrder
            : numberOrder;
        } else {
          currentCartItems.push(orderItem);
        }
        dispatch({ type: 'cart_order', cart: currentCartItems });
        setCartLocalStorage(user._id, currentCartItems);
        if (props.resetValue) {
          setNumberOrder(1);
        }
        props.onNumberOrderChange(numberOrder, product.productId);
      } else {
        // The added product belongs to another store that different from the store
        // in the cart so have to confirm to user if the cart isn't empty.
        if (currentCartItems.length > 0) {
          currentCartItems = [orderItem];
          setConfirmRenewCart(true);
          setRenewCartData(currentCartItems);
        } else {
          currentCartItems = [orderItem];
          setItemLocalStorage(CONSTANTS.STORAGE_KEY.STORE_INFO, props.storeInfo);
          dispatch({ type: 'cart_order', cart: currentCartItems });
          setCartLocalStorage(user._id, currentCartItems);
          if (props.resetValue) {
            setNumberOrder(1);
          }
          props.onNumberOrderChange(numberOrder, product.productId);
        }
      }
    } else {
      toast.current.show({
        severity: 'warn',
        summary: 'Order Quantity',
        detail: 'The quantity of order have to greater than 0',
      });
    }
    return;
  };

  const handleOrderAmountChange = (e: any) => {
    if (props.hasAddToCartButton) {
      setNumberOrder(e.value);
    } else {
      onHandleAddToCart(e.value, productInfo);
    }
  };

  //Confirm renew store dialog
  const confirmRenewStoreDialog = () => {
    setCartLocalStorage(user._id, renewCartData);
    setItemLocalStorage(CONSTANTS.STORAGE_KEY.STORE_INFO, props.storeInfo);
    dispatch({ type: 'cart_order', cart: renewCartData });
    setConfirmRenewCart(false);
  };

  const handleHideConfirmRenewDialog = () => {
    setConfirmRenewCart(false);
  };

  //Get initial cart
  useEffect(() => {
    getCarts();
  }, []);

  useEffect(() => {
    if (cartOrdered?.cart) {
      setInitialOrder(cartOrdered.cart);
    }
  }, [cartOrdered]);

  useEffect(() => {
    setProductInfo(props.selectedProduct);
    setNumberOrder(props.quantity);
  }, [props.selectedProduct, props.quantity]);

  return (
    <>
      <Toast ref={toast} />
      {productInfo && (
        <>
          <div className="numberOrder">
            <InputNumber
              inputId="numberOrder"
              value={numberOrder}
              onValueChange={handleOrderAmountChange}
              mode="decimal"
              showButtons
              decrementButtonClassName="p-button-secondary"
              incrementButtonClassName="p-button-secondary"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              buttonLayout="horizontal"
              step={1}
              min={1}
              max={productInfo.inventory > 0 ? productInfo.inventory : 1}
              className="1"
            />
          </div>
          {props.hasAddToCartButton && (
            <div
              className={`addToCart d-flex flex-grow-1 align-items-center justify-content-center ${
                props?.classNames || ''
              }`}
              onClick={(e) => onHandleAddToCart(numberOrder, productInfo)}
            >
              <img src={cartIcon} alt="Cart icon" className="me-3" />
              <span className="d-flex"><FormattedMessage id="t-add-to-cart" defaultMessage="Add to Cart" /></span>
            </div>
          )}
        </>
      )}
      <ConfirmationDialog
        visible={confirmRenewCart}
        onAccept={confirmRenewStoreDialog}
        onDismiss={handleHideConfirmRenewDialog}
        message={`Would you like to clear the cart at current store to the ${props.storeInfo?.name} and add this item instead?`}
      />
    </>
  );
}

export default AddOrEditOrderForm;
