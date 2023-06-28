import React, { useEffect, useState, useRef } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { Field, Form, Formik, FieldArray } from 'formik';
import { capitalize } from 'lodash';
import { InputNumber } from 'primereact/inputnumber';

import CalendarField from 'components/common/CalendarField';
import CountryDropdown from 'components/common/CountryDropdown';
import ConfirmationDialog from 'components/common/ConfirmationDialog';
import DropdownField from 'components/common/DropdownField';
import ErrorMessage from 'components/common/ErrorMessage';
import TextInput from 'components/common/TextInput';
import { WEEKDAYS } from 'constants/common';
import { config } from 'config';
import hmiService from 'services/HomeMadeInn';
import Store from 'models/store';
import SearchLatLongDialog from 'components/common/SearchLatLongDialog';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';
interface EditStoreProps extends RouteComponentProps {
  onSaved: () => void;
}

export default function EditStore(props: EditStoreProps) {
  const [store, setStore] = useState<Store>();
  const [country, setCountry] = useState('');
  const [platformCategoryOptions, setPlatformCategoryOptions] = useState<any[]>([]);
  const [cuisineOptions, setCuisineOptions] = useState<any[]>([]);
  const [selectedPlatformCategories, setSelectedPlatformCategories] = useState<any[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<any[]>();
  const [photoURL, setPhotoURL] = useState('');
  const [logoURL, setLogoURL] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<any>();
  const [selectedLogo, setSelectedLogo] = useState<any>();
  const [selectedAddress, setSelectedAddress] = useState<any>({
    address: '',
    latitude: 0,
    longitude: 0,
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [latLongDialogVisible, setLatLongDialogVisible] = useState(false);

  const fileUploadRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<any>();
  const intl = useIntl();

  const getStore = async () => {
    const stores: Store[] = await hmiService.getStores({
      preloads: ['Cuisines', 'PlatformCategories', 'OperationTimes'],
    });
    const store: Store = stores[0];

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

    setCountry(store?.countryCode);

    setPhotoURL(store?.photo);

    setLogoURL(store?.logo);

    const selectedPlatformCategoryItems = store?.platformCategories?.map((item: any) => item?.id);
    setSelectedPlatformCategories(selectedPlatformCategoryItems);

    const selectedCuisineItems = store?.cuisines?.map((item: any) => item?.id);
    setSelectedCuisines(selectedCuisineItems);
  };

  const getPlatformCategories = async () => {
    const platformCategories = await hmiService.getPlatformCategories();
    setPlatformCategoryOptions(platformCategories);
  };

  const getCuisines = async () => {
    const cusines = await hmiService.getCuisines();
    setCuisineOptions(cusines);
  };

  const handleCountryChange = (e: any) => {
    setCountry(e.value);
  };

  const handlePlatformCategoriesChange = (e: any) => {
    setSelectedPlatformCategories(e.value);
  };

  const handleCuisinesChange = (e: any) => {
    setSelectedCuisines(e.value);
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

  const onHandleSearchLatLong = (e: any) => {
    setSelectedAddress({ ...e });
  };

  const handleSubmitForm = async (values: any, { setSubmitting, resetForm }: any) => {
    setSuccessMessage('');
    setErrorMessage('');

    const selectedPlatformCategoryOptions = selectedPlatformCategories?.map((item) => {
      return { id: item };
    });
    const selectedCuisineOptions = selectedCuisines?.map((item) => {
      return { id: item };
    });

    try {
      await hmiService.updateStores({
        ...values,
        id: store?.id,
        userId: store?.userId,
        platformCategories: selectedPlatformCategoryOptions,
        cuisines: selectedCuisineOptions,
        photoUpload: selectedPhoto,
        logoUpload: selectedLogo,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
      });
      setSuccessMessage(intl.formatMessage({
        id: 'm-save-store-information-successfully!',
        defaultMessage: 'Save store information successfully!',
      }));
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
    <>
      {store && (
        <>
          <Formik initialValues={store} onSubmit={handleSubmitForm} innerRef={formRef}>
            {({ values, isSubmitting, setFieldValue }) => {
              return (
                <Form id="edit-store" className="form-group">
                  <div className="section-wrapper">
                    <div className="col-6">
                      <div className="d-inline-block w-100 relative mb-4">
                        <p className="input-label me-2"><FormattedMessage id="t-store-name" defaultMessage="Store Name" /></p>
                        <Field type="text" name="name" component={TextInput} placeholder="Store Name" />
                      </div>
                      <div className="mb-4">
                        <p className="input-label me-2"><FormattedMessage id="t-store-logo" defaultMessage="Store Logo" /></p>
                        {logoURL && logoURL !== '' && (
                          <div>
                            <img className="img-preview mb-4" width={50} src={`${config.imageServerUrl}/${logoURL}`} />
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleFileUploadLogoChange} ref={fileUploadRef} />
                      </div>
                      <div className="d-inline-block w-100 relative mb-4">
                        <p className="input-label me-2"><FormattedMessage id="t-description-" defaultMessage="Description" /></p>
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
                        <p className="input-label me-2"><FormattedMessage id="t-store-background" defaultMessage="Store Background" /></p>
                        {photoURL && photoURL !== '' && (
                          <div>
                            <img
                              className="img-preview mb-4"
                              width={300}
                              src={`${config.imageServerUrl}/${photoURL}`}
                            />
                          </div>
                        )}

                        <input type="file" accept="image/*" onChange={handleFileUploadChange} ref={fileUploadRef} />
                      </div>
                      <div className="d-inline-block w-100 relative mb-4">
                        <p className="input-label me-2"><FormattedMessage id="t-categories" defaultMessage="Categories" /></p>
                        <MultiSelect
                          display="chip"
                          optionLabel="name"
                          optionValue="id"
                          value={selectedPlatformCategories}
                          options={platformCategoryOptions}
                          onChange={handlePlatformCategoriesChange}
                          className="input-default col-12"
                        />
                      </div>
                      <div className="d-inline-block w-100 relative mb-4">
                        <p className="input-label me-2"><FormattedMessage id="t-cuisines" defaultMessage="Cuisines" /></p>
                        <MultiSelect
                          display="chip"
                          optionLabel="name"
                          optionValue="id"
                          value={selectedCuisines}
                          options={cuisineOptions}
                          onChange={handleCuisinesChange}
                          className="col-12"
                        />
                      </div>

                      <div className="d-inline-block w-100 relative mb-4">
                        <p className="input-label mb-2"><FormattedMessage id="t-operating-time" defaultMessage="Operating Time" /></p>
                        <FieldArray
                          name="operationTimes"
                          render={(arrayHelpers: any) => {
                            return (
                              <div>
                                {values?.operationTimes &&
                                  values?.operationTimes?.length > 0 &&
                                  values?.operationTimes?.map((operationTime: any, index) => {
                                    return (
                                      <div key={index} className="d-flex gap-4 justify-content-between mb-4">
                                        <Field
                                          name={`operationTimes.${index}.weekDay`}
                                          options={WEEKDAYS}
                                          component={DropdownField}
                                          className="w-100"
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
                                  <FormattedMessage id="t-add-operation-times" defaultMessage="Add operation times" /></button>
                              </div>
                            );
                          }}
                        />
                      </div>

                      <div className="d-inline-block w-100 relative mb-4">
                        <p className="input-label me-2"><FormattedMessage id="t-country" defaultMessage="Country" /></p>
                        <Field
                          name="countryCode"
                          label="Country"
                          component={CountryDropdown}
                          value={country}
                          onChange={handleCountryChange}
                          className="col-6 input-default"
                        />
                      </div>

                      <div className="d-inline-block w-100 relative">
                        <Field type="text" name="address" component={TextInput} placeholder="Address" label="Address" />
                      </div>

                      <div className="d-flex w-100 gap-4 mb-4">
                        <div className="mr-4 w-100">
                          <p className="input-label me-2"><FormattedMessage id="t-latitue" defaultMessage="Latitue" /></p>
                          <InputNumber
                            placeholder="Latitude"
                            value={selectedAddress.latitude}
                            onChange={onHandleChangeLatitude}
                            mode="decimal"
                            maxFractionDigits={7}
                            className="w-100"
                          />
                        </div>
                        <div className="mr-4 w-100">
                          <p className="input-label me-2"><FormattedMessage id="t-longtitue" defaultMessage="Longtitue" /></p>
                          <InputNumber
                            placeholder="Longitude"
                            value={selectedAddress.longitude}
                            onChange={onHandleChangeLongitude}
                            mode="decimal"
                            maxFractionDigits={7}
                            className="w-100"
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
                              label="Save"
                              onClick={handleShowConfirmDialog}
                            />
                          </>
                        )}
                      </div>
                      <div className="d-inline-block mt-10 w-100 relative">
                        {successMessage && <span>{successMessage}</span>}
                      </div>
                    </div>
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
    </>
  );
}
