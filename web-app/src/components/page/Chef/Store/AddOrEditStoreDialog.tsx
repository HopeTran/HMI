import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Field, Form, Formik, FieldArray } from 'formik';
import { capitalize } from 'lodash';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import * as Yup from 'yup';

import CalendarField from 'components/common/CalendarField';
// import CountryDropdown from 'components/common/CountryDropdown';
import ConfirmationDialog from 'components/common/ConfirmationDialog';
import DropdownField from 'components/common/DropdownField';
import ErrorMessage from 'components/common/ErrorMessage';
import TextInput from 'components/common/TextInput';
import { STORE_CURRENCY, WEEKDAYS } from 'constants/common';
import { config } from 'config';
import { useUser } from 'store/hooks';
import hmiService from 'services/HomeMadeInn';
import Store from 'models/store';
import SearchLatLongDialog from 'components/common/SearchLatLongDialog';
import MultiSelectField from '../../../common/MutiSelectField';
import { RadioButton } from 'primereact/radiobutton';
import { InputText } from 'primereact/inputtext';

interface StoreProps {
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
  storeInfo?: any;
  onSaved: () => void;
}

const DIALOG_STYLE = { width: '700px' };

const StoreSchema = Yup.object().shape({
  name: Yup.string().required('Product name is required'),
  platformCategories: Yup.array().min(1, 'Categories is required'),
});

export default function AddOrEditStoreDialog(props: StoreProps) {
  const [store, setStore] = useState<Store>();
  const [platformCategoryOptions, setPlatformCategoryOptions] = useState<any[]>([]);
  const [cuisineOptions, setCuisineOptions] = useState<any[]>([]);
  const [photoURL, setPhotoURL] = useState('');
  const [logoURL, setLogoURL] = useState('');
  const [address, setAddress] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<any>();
  const [selectedLogo, setSelectedLogo] = useState<any>();
  const [selectedAddress, setSelectedAddress] = useState<any>({
    address: '',
    latitude: 0,
    longitude: 0,
    country: '',
    currency: '',
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [latLongDialogVisible, setLatLongDialogVisible] = useState(false);
  const [currency, setCurrency] = useState(STORE_CURRENCY[0]);

  const fileUploadRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<any>();
  const user = useUser();

  const getStore = () => {
    const store = props.storeInfo;
    if (store) {
      store?.operationTimes?.forEach((operationTime: any, index: number) => {
        if (operationTime.availableFrom && operationTime.availableTo) {
          const availableFrom = operationTime.availableFrom.split(':');
          const availableTo = operationTime.availableTo.split(':');

          store.operationTimes[index]['availableFromDate'] = new Date();
          store?.operationTimes[index].availableFromDate.setHours(availableFrom[0]);
          store?.operationTimes[index].availableFromDate.setMinutes(availableFrom[1]);
          store?.operationTimes[index].availableFromDate.setSeconds(availableFrom[2]);

          store.operationTimes[index].availableToDate = new Date();
          store?.operationTimes[index].availableToDate.setHours(availableTo[0]);
          store.operationTimes[index].availableToDate.setMinutes(availableTo[1]);
          store.operationTimes[index].availableToDate.setSeconds(availableTo[2]);
        }
      });
      setStore(store);

      setSelectedAddress({
        address: store.address,
        latitude: store.latitude,
        longitude: store.longitude,
      });

      setPhotoURL(store?.photo);
      setLogoURL(store?.logo);
      setCurrency(store?.currency);
      setAddress(store?.address);
    } else {
      setStore(new Store());
    }
  };

  const getPlatformCategories = async () => {
    const platformCategories = await hmiService.getPlatformCategories();
    setPlatformCategoryOptions(platformCategories);
  };

  const getCuisines = async () => {
    const cusines = await hmiService.getCuisines();
    setCuisineOptions(cusines);
  };

  const handleFileUploadChange = (event: any) => {
    if (event.target.files[0]) {
      setSelectedPhoto(event.target.files[0]);
    }
  };

  const handleFileUploadLogoChange = (event: any) => {
    if (event.target.files[0]) {
      setSelectedLogo(event.target.files[0]);
    }
  };

  const handleShowConfirmDialog = () => {
    setConfirmDialogVisible(true);
  };

  const handleAcceptConfirmDialog = () => {
    setConfirmDialogVisible(false);

    if (formRef && formRef.current) {
      formRef.current.handleSubmit();
    }
  };

  const handleHideConfirmDialog = () => {
    setConfirmDialogVisible(false);
  };

  const onHandleChangeLatitude = (e: any) => {
    setSelectedAddress({
      ...selectedAddress,
      latitude: e.value,
    });
  };

  const onHandleChangeLongitude = (e: any) => {
    setSelectedAddress({
      ...selectedAddress,
      longitude: e.value,
    });
  };

  const handleSearchLatLongDialogShow = () => {
    setLatLongDialogVisible(true);
  };

  const handleSearchLatLongDialogHide = () => {
    setLatLongDialogVisible(false);
  };

  const onCurrencyHandleChange = (e: any) => {
    setCurrency(e.value);
  };

  const onHandleSearchLatLong = (e: any) => {
    setSelectedAddress({ ...e });
    setAddress(e.address);
  };

  const handleDialogHide = () => {
    if (props.onDismiss) {
      props.onDismiss();
    }
    if (props.onHide) {
      props.onHide();
    }
  };

  const handleSubmitForm = async (values: any, { setSubmitting, resetForm }: any) => {
    setSuccessMessage('');
    setErrorMessage('');

    const selectedPlatformCategoryOptions = values.platformCategories?.map((item: any) => {
      return { id: item?.id };
    });
    const selectedCuisineOptions = values.cuisines?.map((item: any) => {
      return { id: item?.id };
    });

    const storeData = {
      photoUpload: selectedPhoto,
      logoUpload: selectedLogo,
      latitude: selectedAddress.latitude,
      longitude: selectedAddress.longitude,
      platformCategories: selectedPlatformCategoryOptions,
      cuisines: selectedCuisineOptions,
      currency: currency,
      address: address,
      countryCode: selectedAddress.country,
    };

    try {
      if (store?.id !== 0) {
        await hmiService.updateStores({
          ...values,
          ...storeData,
          id: store?.id,
          userId: store?.userId,
        });
      } else {
        await hmiService.createStore({
          ...values,
          ...storeData,
          userId: user._id,
        });
      }

      setSuccessMessage('Save store information successfully!');
      setErrorMessage('');
      props.onSaved();
    } catch (e:any) {
      const message = e?.response?.data?.message || e?.response?.data?.data?.message;
      setErrorMessage(message?.replaceAll('_', ' '));
    }
    setSubmitting(false);
  };

  useEffect(() => {
    getStore();
    getPlatformCategories();
    getCuisines();
  }, []);

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
      header={props?.storeInfo?.id ? 'Edit Store' : 'Add Store'}
    >
      {store && (
        <>
          <Formik initialValues={store} onSubmit={handleSubmitForm} innerRef={formRef} validationSchema={StoreSchema}>
            {({ values, isSubmitting, setFieldValue }) => {
              return (
                <Form id="edit-store" className="form-group">
                  <div className="d-inline-block w-100 relative mb-4">
                    <p className="input-label me-2">Store Name</p>
                    <Field type="text" name="name" component={TextInput} placeholder="Store Name" />
                  </div>
                  <div className="mb-4">
                    <p className="input-label me-2">Store Logo</p>
                    {logoURL && logoURL !== '' && (
                      <div>
                        <img className="img-preview mb-4" width={50} src={`${config.imageServerUrl}/${logoURL}`} />
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileUploadLogoChange} ref={fileUploadRef} />
                  </div>
                  <div className="d-inline-block w-100 relative mb-4">
                    <p className="input-label me-2">Description</p>
                    <Field
                      type="textarea"
                      name="description"
                      component={TextInput}
                      placeholder="Description"
                      className="w-100"
                      rows="5"
                    />
                  </div>
                  <div className="d-inline-block w-100 relative mb-4">
                    <p className="input-label me-2">Store Background</p>
                    {photoURL && photoURL !== '' && (
                      <div>
                        <img className="img-preview mb-4" width={300} src={`${config.imageServerUrl}/${photoURL}`} />
                      </div>
                    )}

                    <input type="file" accept="image/*" onChange={handleFileUploadChange} ref={fileUploadRef} />
                  </div>

                  <div className="d-inline-block w-100 relative mb-4">
                    <p className="input-label me-2">
                      Categories <span className="clr-red">*</span>
                    </p>
                    <Field
                      name="platformCategories"
                      isRequired={true}
                      component={MultiSelectField}
                      options={platformCategoryOptions}
                      optionLabel="name"
                      className="input-default col-12"
                    />
                  </div>
                  <div className="d-inline-block w-100 relative mb-4">
                    <p className="input-label me-2">Cuisines</p>
                    <Field
                      name="cuisines"
                      component={MultiSelectField}
                      options={cuisineOptions}
                      optionLabel="name"
                      className="input-default col-12"
                    />
                  </div>

                  <div className="d-inline-block w-100 relative mb-4">
                    <p className="input-label mb-3">Operating Time</p>
                    <FieldArray
                      name="operationTimes"
                      render={(arrayHelpers: any) => {
                        return (
                          <div>
                            {values?.operationTimes &&
                              values?.operationTimes?.length > 0 &&
                              values?.operationTimes?.map((operationTime: any, index) => {
                                return (
                                  <div
                                    key={index}
                                    className="d-flex gap-md-4 gap-2 justify-content-between align-items-center mb-4"
                                  >
                                    <Field
                                      name={`operationTimes.${index}.weekDay`}
                                      options={WEEKDAYS}
                                      component={DropdownField}
                                      className="w-100"
                                      style={{ minWidth: '120px' }}
                                    />
                                    <Field
                                      name={`operationTimes.${index}.availableFromDate`}
                                      timeOnly
                                      showTime
                                      hourFormat="24"
                                      component={CalendarField}
                                      className="w-100"
                                    />
                                    <Field
                                      name={`operationTimes.${index}.availableToDate`}
                                      timeOnly
                                      showTime
                                      hourFormat="24"
                                      component={CalendarField}
                                      className="w-100"
                                    />
                                    <a type="button" onClick={() => arrayHelpers.remove(index)}>
                                      <span className="pi pi-trash"></span>
                                    </a>
                                  </div>
                                );
                              })}
                            <button
                              type="button"
                              onClick={() => arrayHelpers.push({ weekday: '', availableFrom: '', availableTo: '' })}
                              className="btn-secondary"
                            >
                              Add operation times
                            </button>
                          </div>
                        );
                      }}
                    />
                  </div>

                  {/* Choose address*/}
                  <div className="d-flex w-100 gap-md-4 gap-2 mb-4">
                    <div className="mr-4 w-100">
                      <p className="input-label me-2">
                        Latitude <span className="clr-red">*</span>
                      </p>
                      <InputNumber
                        placeholder="Latitude"
                        value={selectedAddress.latitude}
                        onChange={onHandleChangeLatitude}
                        mode="decimal"
                        maxFractionDigits={7}
                        className="w-100"
                        required={true}
                      />
                    </div>
                    <div className="mr-4 w-100">
                      <p className="input-label me-2">
                        Longitude <span className="clr-red">*</span>
                      </p>
                      <InputNumber
                        placeholder="Longitude"
                        value={selectedAddress.longitude}
                        onChange={onHandleChangeLongitude}
                        mode="decimal"
                        maxFractionDigits={7}
                        className="w-100"
                        required={true}
                      />
                    </div>
                    <div className="w-100 d-inline-flex align-items-end">
                      <Button
                        className="btn-secondary p-button w-100"
                        type="button"
                        label="Search lat, long"
                        onClick={handleSearchLatLongDialogShow}
                      />
                    </div>
                  </div>
                  <SearchLatLongDialog
                    visible={latLongDialogVisible}
                    onHide={handleSearchLatLongDialogHide}
                    onSelectedAdrress={onHandleSearchLatLong}
                  />
                  <div className="d-inline-block w-100 relative mb-4">
                    <p className="input-label me-2">Address </p>
                    <InputText value={address} disabled={true} />
                  </div>
                  {/* Choose currency */}
                  <div className="d-inline-block w-100 relative mb-4">
                    <p className="input-label me-2">
                      Currency <span className="clr-red">*</span>
                    </p>
                    <p className="d-flex gap-4 item-align-center">
                      {STORE_CURRENCY.map((item: any) => {
                        return (
                          <div key={item.value} className="field-radiobutton">
                            <RadioButton
                              inputId={item.value}
                              value={item.value}
                              name="currency"
                              onChange={onCurrencyHandleChange}
                              checked={currency === item.value}
                              className="mr-2"
                            />
                            <label htmlFor={item.value}>{item.label}</label>
                          </div>
                        );
                      })}
                    </p>
                    {selectedAddress.country && selectedAddress.currency !== currency ? (
                      <p>
                        Your location country is <span className="clr-red">{selectedAddress.country}</span> then your
                        currency should be <span className="clr-red">{selectedAddress.currency}</span> <br />
                        If you choose another currency then maybe your store can not be found.
                      </p>
                    ) : (
                      ''
                    )}
                  </div>
                  <div className="d-inline-block w-100 relative">
                    {errorMessage && <ErrorMessage message={capitalize(errorMessage)} />}
                  </div>

                  <div className="d-inline-block w-100 relative mt-4">
                    {isSubmitting ? (
                      <i className="pi pi-spin pi-spinner " />
                    ) : (
                      <>
                        <Button
                          className="btn-submit-question"
                          type="button"
                          label={props?.storeInfo.active ? 'Save' : 'Request approve'}
                          onClick={handleShowConfirmDialog}
                        />
                      </>
                    )}
                  </div>
                  <div className="d-inline-block mt-10 w-100 relative">
                    {successMessage && <span>{successMessage}</span>}
                  </div>
                </Form>
              );
            }}
          </Formik>
          <ConfirmationDialog
            visible={confirmDialogVisible}
            onAccept={handleAcceptConfirmDialog}
            onDismiss={handleHideConfirmDialog}
            message={`Are you sure to save the change?`}
          ></ConfirmationDialog>
        </>
      )}
    </Dialog>
  );
}
