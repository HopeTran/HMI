import { findIndex } from 'lodash';
import { TabPanel, TabView } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import hmiService from 'services/HomeMadeInn';

import ConfirmationOrderDialog from 'components/common/ConfirmationOrderDialog';
import AddOrEditOrder from 'components/common/AddOrEditOrderForm';
import { config } from 'config';
import Cart from 'models/cart';
import Store from 'models/store';
import { useCart, useUser } from 'store/hooks';
import { getCartLocalStorage } from 'utilities/common';
import { currency } from 'components/common/templates/Templates';

import mealPhotoDefault from 'statics/images/store-photo-default.png';

export default function StoreMenuCategory(props: any) {
  const [storeMenuCategory, setStoreMenuCategory] = useState<Store[]>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [numberOrder, setNumberOrder] = useState(1);
  const [isConfirmOrderDialogVisible, setIsConfirmOrderDialogVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const [orderedProduct, setOrderedProduct] = useState<Cart[]>([]);

  const user = useUser();
  const cartOrdered = useCart();
  const orderLocalStorage: any = getCartLocalStorage();
  const toast: any = useRef();

  const onHandleConfirmOrder = (product: any, numberOrder: number) => {
    setIsConfirmOrderDialogVisible(true);
    setSelectedProduct(product);
    setNumberOrder(1);
  };

  const onHandleConfirmDialogAcceptOrder = () => {
    setIsConfirmOrderDialogVisible(false);
  };

  const onHandleConfirmDialogDismissOrder = () => {
    setIsConfirmOrderDialogVisible(false);
  };

  const onHandleQuantityChange = async (quantity: any, id: any) => {
    const _orderProduct: any = orderedProduct && orderedProduct.length > 0 ? [...orderedProduct] : [];
    const product = await hmiService.getProductById(id);
    console.log(product);
    const orderItem: Cart = {
      userId: user._id,
      productId: id,
      quantity: quantity,
      product: product,
    };
    const orderIndex: any = findIndex(_orderProduct, { productId: id });
    if (orderIndex !== -1) {
      _orderProduct.splice(orderIndex, 1, orderItem);
      setOrderedProduct(_orderProduct);
    } else {
      _orderProduct.push(orderItem);
      setOrderedProduct(_orderProduct);
    }
    toast.current.show({ severity: 'success', summary: 'Add To Cart', detail: 'Add item to cart success' });
  };

  const onHandleAddToCart = (product: any, quantity: number) => {
    const _orderProduct: any = orderedProduct && orderedProduct.length > 0 ? [...orderedProduct] : [];
    const orderItem: Cart = {
      userId: user._id,
      productId: product.id,
      quantity: quantity,
      product: product.product,
    };
    const orderIndex: any = findIndex(_orderProduct, { productId: product.id });
    if (orderIndex !== -1) {
      _orderProduct.splice(orderIndex, 1, orderItem);
      setOrderedProduct(_orderProduct);
    } else {
      _orderProduct.push(orderItem);
      setOrderedProduct(_orderProduct);
    }
    toast.current.show({ severity: 'success', summary: 'Add To Cart', detail: 'Add item to cart success' });
  };

  useEffect(() => {
    if (cartOrdered.cart && cartOrdered.cart.length > 0) {
      setOrderedProduct(cartOrdered.cart);
    } else {
      const order = orderLocalStorage?.data || [];
      setOrderedProduct(order);
    }
  }, []);

  useEffect(() => {
    setStoreMenuCategory(props.categories);
  }, [props.categories]);

  //MenuCategory Template
  const menuCategoryTemplate = (product: any, index: number) => {
    return (
      <div className="col-lg-4 col-md-6 col-12 p-md-4" key={index}>
        <div className="meal">
          <div className="d-flex justify-content-between gap-4 mb-4">
            <div>
              <h5 className="font-bold">{product.name}</h5>
              <p className="meal-description">{product.description}</p>
              <span className="clr-dell link-hover" onClick={() => onHandleConfirmOrder(product, numberOrder)}>
                Learn more &gt;{' '}
              </span>
              <h4 className="mt-4">{currency(product.price, props.storeInfo?.currency || 'usd')}</h4>
            </div>
            <img
              src={product.photo ? `${config.imageServerUrl}/${product.photo}` : mealPhotoDefault}
              width={130}
              height={130}
              alt="Meal"
            />
          </div>
          <div className="d-flex justify-content-between gap-4">
            <AddOrEditOrder
              quantity={numberOrder}
              selectedProduct={product}
              onNumberOrderChange={() => onHandleAddToCart(product, numberOrder)}
              hasAddToCartButton={true}
              storeInfo={props.storeInfo}
              resetValue={true}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="section pt-4">
      <Toast ref={toast} position="bottom-right" />
      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        {storeMenuCategory &&
          storeMenuCategory.map((category: any) => {
            return (
              <TabPanel key={category.id} header={category.name}>
                <div className="row">
                  {category.products.map((product: any, index: number) => {
                    return menuCategoryTemplate(product, index);
                  })}
                </div>
              </TabPanel>
            );
          })}
      </TabView>
      <ConfirmationOrderDialog
        header="Confirm"
        visible={isConfirmOrderDialogVisible}
        onAccept={onHandleConfirmDialogAcceptOrder}
        onDismiss={onHandleConfirmDialogDismissOrder}
        quantity={numberOrder}
        selectedProduct={selectedProduct}
        onNumberOrderChange={() => onHandleQuantityChange(numberOrder, selectedProduct.id)}
        currency={props.storeInfo?.currency}
        storeInfo={props.storeInfo}
      />
    </div>
  );
}
