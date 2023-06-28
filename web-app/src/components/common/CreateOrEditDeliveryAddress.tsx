import { Field, Form, Formik } from 'formik';
import { capitalize } from 'lodash';
import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import AddressAutocomplete from './AddressAutoComplete';
import hmiService from 'services/HomeMadeInn';
import TextInput from './TextInput';
import { DELIVERY_OPTIONS, ICON_TYPES } from 'constants/common';
import DropdownField from './DropdownField';
import ConfirmationDialog from './ConfirmationDialog';
import { useUser } from 'store/hooks';
import { useFilterStore } from 'store/hooks';


interface Props {
  visible: (e: any) => void;
  onEditClick?: (e: any) => void;
}

export default function CreateOrEditDeliveryAddress(props: Props) {
  const [isShowAddOrEditForm, setIsShowAddOrEditForm] = useState(false);
  const [editDeliveryAddress, setEditDeliveryAddress] = useState<any>(null);
  const [isDeleteAddress, setIsDeleteAddress] = useState(false);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<any>();
  const [userDeliveryAddress, setUserDeliveryAddress] = useState([]);
  const dispatch = useDispatch();
  const storesFilter = useFilterStore();

  const user = useUser();

  const getUserDeliveryAddress = async () => {
    const data = await hmiService.fetchUserDeliveryAddress();
    setUserDeliveryAddress(data);
  };

  const onLocationSelected = (selectedAddress: any) => {
    if (selectedAddress) {
      dispatch({
        type: 'filter_store',
        filter: {
          ...storesFilter,
          deliveryAddress: selectedAddress.address,
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude,
          country: selectedAddress.country,
          currency: selectedAddress.currency,
        },
      });
      props.visible(false);
    }
  };

  const handleEditAction = (e: any) => {
    if (props.onEditClick) {
      props.onEditClick({ data: userDeliveryAddress, event: e });
    }
    setIsShowAddOrEditForm(true);
    setEditDeliveryAddress(e);
  };

  const onAddDeliveryAddressForm = () => {
    setIsShowAddOrEditForm(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (data.id) {
      hmiService.updateUserDeliveryAddress({
        ...data,
        addressText: selectedDeliveryAddress?.address || editDeliveryAddress.addressText,
        latitude: selectedDeliveryAddress?.latitude || editDeliveryAddress.latitude,
        longitude: selectedDeliveryAddress?.longitude || editDeliveryAddress.longitude,
      });
    } else {
      hmiService.addUserDeliveryAddress({
        ...data,
        addressText: selectedDeliveryAddress?.address || "",
        latitude: selectedDeliveryAddress?.latitude || 0,
        longitude: selectedDeliveryAddress?.longitude || 0,
      });
    }
    setIsShowAddOrEditForm(false);
    setEditDeliveryAddress(null);
    getUserDeliveryAddress();
  };

  const onHideDeliveryAddressForm = () => {
    props.visible(false);
  };

  const handleBackAction = () => {
    setIsShowAddOrEditForm(false);
    setEditDeliveryAddress(null);
  };

  const handleChooseAddress = (selectedAddress: any) => {
    dispatch({
      type: 'filter_store',
      filter: {
        ...storesFilter,
        deliveryAddress: selectedAddress.addressText,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude
      },
    });
    props.visible(false);
  };

  const onDeleteSavedAddress = () => {
    setIsDeleteAddress(true);
  };

  const completeConfirmDeleteAddressDialog = async() => {
    hmiService.deleteUserDeliveryAddress(editDeliveryAddress.id);
    setIsDeleteAddress(false);
    setIsShowAddOrEditForm(false);
    setEditDeliveryAddress(null);
  };

  const handleHideConfirmDeleteAddressDialog = () => {
    setIsDeleteAddress(false);
  };

  const handleAddressAutoCompleteFormChanged = (addressInfo: any) => {
    setSelectedDeliveryAddress(addressInfo)
  }

  useEffect(() => {
    if (user?._id.length > 0) {
      getUserDeliveryAddress();
    }
  }, [user]);

  return (
    <div className="add-edit-delivery-address">
      {!isShowAddOrEditForm ? (
        <>
          <div className="d-flex justify-content-end mt-6">
            <Button className="p-1 mb-4" label="+ Add new" onClick={onAddDeliveryAddressForm} />
          </div>
          <AddressAutocomplete onChange={onLocationSelected} />
          {!userDeliveryAddress || userDeliveryAddress.length === 0 && <div className="mb-4 mt-4"><FormattedMessage id={"no-saved-delivery-address"} defaultMessage={"No saved delivery addresses yet."} /></div>}
          {userDeliveryAddress?.map((item: any) => {
            return (
              <div className="mb-4">
                <hr />
                <div className="d-flex justify-content-between align-items-center cursor-pointer w-100">
                  <div className="d-flex align-items-center col-11" onClick={() => handleChooseAddress(item)}>
                    <span className="mr-8 col-1 d-flex justify-content-center">
                      <i className={`pi pi-${item.addressType} mr-4 w-100"`} />
                    </span>
                    <div>
                      <h6>{capitalize(item.label)}</h6>
                      <span className="text-overflow-1-v">{item.addressText}</span>
                    </div>
                  </div>
                  <div className="col-1">
                    <Button icon="pi pi-pencil" onClick={() => handleEditAction(item)} className="p-button-text p-link" />
                  </div>                  
                </div>
              </div>
            );
          })}
          <div className="d-flex justify-content-center mt-6">
            <Button label="Done" onClick={onHideDeliveryAddressForm} className="p-2 w-100" />
          </div>
        </>
      ) : (
        <>
          <p className="cursor-pointer" onClick={handleBackAction}>
            <i className="pi pi-arrow-left" />
          </p>
          <hr />
          <Formik initialValues={{ ...editDeliveryAddress }} onSubmit={handleFormSubmit} enableReinitialize={true}>
            {({ isSubmitting }) => {
              return (
                <Form>
                  <h6>Save this address</h6>
                  <div className="d-flex justify-content-between gap-2">
                    <div className="col-4">
                      <Field
                        name="addressType"
                        isRequired={true}
                        component={DropdownField}
                        options={ICON_TYPES}
                        optionLabel="label"
                        optionValue="value"
                        className="input-default"
                      />
                    </div>
                    <Field
                      type="text"
                      name="label"
                      placeholder="Save this address"
                      className="p-2 input-default"
                      component={TextInput}
                    />
                  </div>
                  <div className="w-100 mb-4">
                    <AddressAutocomplete onChange={handleAddressAutoCompleteFormChanged} defaultAddress={editDeliveryAddress?.addressText} />
                  </div>

                  <h6>Delivery options</h6>
                  <Field
                    name="deliveryPlace"
                    component={DropdownField}
                    options={DELIVERY_OPTIONS}
                    optionLabel="label"
                    optionValue="value"
                    className="input-default col-12 mb-2"
                  />
                  <Field
                    type="text"
                    name="deliveryContactName"
                    placeholder="Business name"
                    className="p-inputtext mb-3 p-2"
                    component={TextInput}
                  />
                  <Field
                    type="textarea"
                    name="deliveryInstruction"
                    placeholder="Add delivery instructions"
                    className="p-inputtext mb-5"
                    component={TextInput}
                  />
                  <div className="d-flex justify-content-center">
                    <p
                      className="p-link p-2 px-4 bg-pink mb-2 clr-white"
                      onClick={onDeleteSavedAddress}
                    >Remove saved address</p>
                  </div>
                  <Button type="submit" label="Save" className="p-2 w-100" />
                </Form>
              );
            }}
          </Formik>
          <ConfirmationDialog
            visible={isDeleteAddress}
            onAccept={completeConfirmDeleteAddressDialog}
            onDismiss={handleHideConfirmDeleteAddressDialog}
            message={`Are you sure to delete this address?`}
          />
        </>
      )}
    </div>
  );
}
