import { Button } from 'primereact/button';
import React, { useEffect, useRef, useState } from 'react';
import { Field, FieldArray, Form, Formik } from 'formik';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';

import accountService from 'services/Account';
import TextInput from 'components/common/TextInput';
import ConfirmationDialog from 'components/common/ConfirmationDialog';
import ErrorMessage from 'components/common/ErrorMessage';
import {
  getCountryOptions,
  getCitiesByCountryName,
  getCitiesByCountryCode,
  getDialCodeByCountryName,
} from 'components/common/Countries';
import DropdownField from 'components/common/DropdownField';
import { useDispatch } from 'react-redux';
import { SET_USER } from 'store/user/types';
import { useUser } from 'store/hooks';
import User from 'models/user';
import { setUserStorage } from 'store/user/utils';

const defaultFormValue = {
  emails: [],
  phoneNumbers: [],
  addresses: {},
  searchLocationRadius: 1,
  geoLocation: {},
};

export default function ContactInformation() {
  const [customerInfo, setCustomerInfo] = useState<any>(defaultFormValue);
  const [selectedPhoneCode, setSelectedPhoneCode] = useState<any>();
  const [countries, setCountries] = useState<any>([]);
  const [cityList, setCityList] = useState<any>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isEdit, setIsEdit] = useState(false);
  const [confirmAddNewDialog, setConfirmAddNewDialog] = useState(false);

  const formRef = useRef<any>();
  const user = useUser();
  const dispatch = useDispatch();
  const intl = useIntl();

  const getCustomerInformation = async () => {
    const customers = await accountService.fetchAccountInfo();
    setCustomerInfo(customers);
  };

  const handleShowConfirmDialog = () => {
    setConfirmAddNewDialog(true);
  };

  const completeConfirmDialog = () => {
    setConfirmAddNewDialog(false);

    if (formRef && formRef.current) {
      formRef.current.handleSubmit();
    }
  };

  const handleHideConfirmDialog = () => {
    setConfirmAddNewDialog(false);
  };

  const handleSubmitForm = async (values: any, { resetForm }: any) => {
    const data: any = {
      emails: values?.emails,
      addresses: values?.addresses,
      phoneNumbers: Array.isArray(values?.phoneNumbers) ? values?.phoneNumbers : [values?.phoneNumbers],
      geoLocation: values?.geoLocation,
      searchLocationRadius: values?.searchLocationRadius,
    };
    setErrorMessage('');
    try {
      await accountService.updateAccountInfo(data);
      await getCustomerInformation();

      const newUser = new User({
        ...user,
        geoLocation: values?.geoLocation,
        searchLocationRadius: values?.searchLocationRadius,
      });
      setUserStorage(newUser);
      dispatch({
        type: SET_USER,
        payload: newUser,
      });
      resetForm();
      setIsEdit(false);
      customerInfo(defaultFormValue);
    } catch (err:any) {
      if (err.response && err.response.status && err.response.status === 500) {
        setErrorMessage('Internal Server Error');
      } else {
        const { message } = err.response.data ? err.response.data : 'Unknown Error';
        let errMessage = message;
        if (message.indexOf('msg=') > -1) {
          errMessage = message.substr(message.indexOf('msg=') + 4);
        } else if (message.indexOf('message=') !== -1) {
          errMessage = message.substr(message.indexOf('message') + 8);
        }
        setErrorMessage(errMessage);
      }
    }
  };

  useEffect(() => {
    setCountries(getCountryOptions);
    getCustomerInformation();
  }, []);

  useEffect(() => {
    if (customerInfo.phoneNumbers) {
      setSelectedPhoneCode(customerInfo.phoneNumbers[0]);
    }

    if (customerInfo.addresses) {
      const country = customerInfo.addresses?.country;
      setCityList(getCitiesByCountryName(country));
      setSelectedPhoneCode(getDialCodeByCountryName(country));
    }
  }, [customerInfo]);

  useEffect(() => {
    setCityList(getCitiesByCountryCode(selectedPhoneCode));
  }, [selectedPhoneCode]);

  return (
    <div className="block-wrapper mb-4">
      <div className="mb-4">
        <Formik initialValues={customerInfo} enableReinitialize={true} onSubmit={handleSubmitForm} innerRef={formRef}>
          {(formikProps: any) => {
            return (
              <Form className="form-content-dialog form-group none-border-fields">
                {/* Phone Numbers */}
                <div className="mb-5 section-wrapper">
                  <p className="block-title">
                    <FormattedMessage id="t-phone-number" defaultMessage="Phone Number" />
                  </p>
                  <FieldArray
                    name="phoneNumbers"
                    render={({ insert, remove, push }) => (
                      <div>
                        {formikProps.values.phoneNumbers?.length > 0 &&
                          formikProps.values?.phoneNumbers?.map((item: any, index: any) => (
                            <div
                              className="d-md-flex justify-content-between gap-4 mb-2 align-items-center"
                              key={index}
                            >
                              <div className="col-md-2 d-flex d-md-inline-flex justify-content-between mb-3">
                                <label htmlFor={`phoneNumbers.${index}`}>
                                  <FormattedMessage id="t-phone-number" defaultMessage="Phone Number" /> #{index + 1}
                                </label>
                                <a className="grid-img-action-btn cursor-pointer d-inline-block d-md-none">
                                  <span className="pi pi-trash" onClick={() => remove(index)} />
                                </a>
                              </div>
                              <div className="col-md-9 d-flex gap-3 align-items-center">
                                <Field
                                  name={`phoneNumbers.${index}`}
                                  placeholder={intl.formatMessage({
                                    id: 't-phone-number',
                                    defaultMessage: 'Phone Number',
                                  })}
                                  type="text"
                                  component={TextInput}
                                />
                              </div>
                              <a className="grid-img-action-btn cursor-pointer d-none d-md-inline-block">
                                <span className="pi pi-trash" onClick={() => remove(index)} />
                              </a>
                            </div>
                          ))}
                        <button type="button" className="btn-secondary mt-4" onClick={() => push('')}>
                          <FormattedMessage id="t-add-more-phone-number" defaultMessage="Add more phone number" />
                        </button>
                      </div>
                    )}
                  />
                </div>
                {/* Addresses */}
                <div className="mb-5 section-wrapper">
                  <p className="block-title">
                    <FormattedMessage id="t-addresses" defaultMessage="Addresses" />
                  </p>
                  <FieldArray
                    name="[addresses]"
                    render={({ insert, remove, push }) => (
                      <div>
                        {formikProps.values.addresses?.length > 0 &&
                          formikProps.values?.addresses.map((addresses: any, index: any) => (
                            <div
                              className="d-md-flex justify-content-between gap-4 mb-2 align-items-start mb-4"
                              key={index}
                            >
                              <div className="col-md-2 d-flex d-md-inline-block justify-content-between mb-3">
                                <label htmlFor={`addresses[${index}]`}>
                                  <FormattedMessage id="t-addresses" defaultMessage="Addresses" /> #{index + 1}
                                </label>
                                <a className="grid-img-action-btn cursor-pointer d-inline-block d-md-none">
                                  <span className="pi pi-trash" onClick={() => remove(index)} />
                                </a>
                              </div>
                              <div className="col-md-9">
                                <div className="w-100 d-md-flex justify-content-between gap-3">
                                  <div className="mb-2 col">
                                    <Field
                                      type="text"
                                      component={TextInput}
                                      name={`addresses[${index}].streetAddress1`}
                                      placeholder={intl.formatMessage({
                                        id: 't-street-address',
                                        defaultMessage: 'Street Address',
                                      })}
                                    />
                                  </div>
                                  <div className="mb-2 col">
                                    <Field
                                      type="text"
                                      component={TextInput}
                                      name={`addresses[${index}].streetAddress2`}
                                      placeholder={intl.formatMessage({
                                        id: 't-street-address',
                                        defaultMessage: 'Street Address',
                                      })}
                                    />
                                  </div>
                                  <div className="mb-2 col">
                                    <Field
                                      type="text"
                                      component={TextInput}
                                      name={`addresses[${index}].state`}
                                      placeholder={intl.formatMessage({
                                        id: 't-state',
                                        defaultMessage: 'State',
                                      })}
                                    />
                                  </div>
                                </div>
                                <div className="w-100 d-md-flex justify-content-between gap-3">
                                  <div className="col mb-2 mb-md-0">
                                    <Field
                                      name={`addresses.${index}.city`}
                                      options={cityList}
                                      component={DropdownField}
                                      className="w-100"
                                    />
                                  </div>
                                  <div className="col">
                                    <Field
                                      type="text"
                                      component={TextInput}
                                      name={`addresses.${index}.zipcode`}
                                      placeholder="Zip code"
                                    />
                                  </div>
                                  <div className="col">
                                    <Field
                                      name={`addresses.${index}.country`}
                                      options={countries}
                                      component={DropdownField}
                                      className="w-100"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-1 d-none d-md-block">
                                <a className="grid-img-action-btn cursor-pointer">
                                  <span className="pi pi-trash" onClick={() => remove(index)} />
                                </a>
                              </div>
                            </div>
                          ))}
                        <button type="button" className="btn-secondary mt-4" onClick={() => push('')}>
                          <FormattedMessage id="t-add-more-address" defaultMessage="Add more address" />
                        </button>
                      </div>
                    )}
                  />
                </div>

                {/* Emails */}
                <div className="section-wrapper">
                  <p className="block-title">
                    <FormattedMessage id="c-email" defaultMessage="Email" />
                  </p>
                  <FieldArray
                    name="emails"
                    render={({ insert, remove, push }) => (
                      <div>
                        {formikProps.values.emails?.length > 0 &&
                          formikProps?.values?.emails.map((item: any, index: any) => (
                            <div className="d-md-flex justify-content-between gap-4 mb-2 align-items-start" key={index}>
                              <div className="col-md-3 d-flex d-md-inline-block justify-content-between mb-3">
                                <label htmlFor={`emails.${index}`}>
                                  {' '}
                                  <FormattedMessage id="t-email-address" defaultMessage="Email Address" /> #{index + 1}
                                </label>
                                <a className="grid-img-action-btn cursor-pointer d-inline-block d-md-none">
                                  <span className="pi pi-trash" onClick={() => remove(index)} />
                                </a>
                              </div>
                              <div className="col-md-8 d-flex gap-3 align-items-center">
                                <Field
                                  name={`emails.${index}`}
                                  placeholder={intl.formatMessage({
                                    id: 't-email-address',
                                    defaultMessage: 'Email Address',
                                  })}
                                  type="text"
                                  component={TextInput}
                                />
                              </div>
                              <a className="grid-img-action-btn me-4 cursor-pointer d-none d-md-inline-block">
                                <span className="pi pi-trash" onClick={() => remove(index)} />
                              </a>
                            </div>
                          ))}
                        <button type="button" className="btn-secondary mt-4" onClick={() => push('')}>
                          <FormattedMessage id="t-add-more-email-address" defaultMessage="Add more email address" />
                        </button>
                      </div>
                    )}
                  />
                </div>

                {/* Location */}
                <div className="section-wrapper mt-4">
                  <p className="block-title">
                    <FormattedMessage id="t-latitude" defaultMessage="Latitude" />
                  </p>
                  <div className="w-100 d-md-flex">
                    <div className="col-md-5 mr-md-4">
                      <Field
                        type="number"
                        component={TextInput}
                        name="geoLocation.latitude"
                        placeholder={intl.formatMessage({
                          id: 't-latitude',
                          defaultMessage: 'Latitude',
                        })}
                      />
                    </div>
                    <div className="col-md-5 ml-md-4">
                      <Field
                        type="number"
                        component={TextInput}
                        name="geoLocation.longitude"
                        placeholder={intl.formatMessage({
                          id: 't-longtitude',
                          defaultMessage: 'Longtitude',
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="section-wrapper mt-4">
                  <p className="block-title">
                    <FormattedMessage id="t-search-location-radius" defaultMessage="Search location radius" />
                  </p>
                  <div className="col-12 col-md-6 d-flex">
                    <div className="ml-4">
                      <Field
                        type="number"
                        component={TextInput}
                        name={intl.formatMessage({
                          id: 't-search-location-radius',
                          defaultMessage: 'Search location radius',
                        })}
                      />
                    </div>
                    <span className="p-2 mt-1">km (s)</span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="clr-red">
                    <ErrorMessage message={errorMessage} />
                  </div>
                )}

                <div className="mb-4 mt-3 flex gap-4 pt-4">
                  {formikProps.isSubmitting ? (
                    <i className="pi pi-spin pi-spinner " />
                  ) : (
                    <Button
                      type="button"
                      className="btn-default mb-2"
                      label={intl.formatMessage({
                        id: 'c- submit',
                        defaultMessage: 'Submit',
                      })}
                      onClick={handleShowConfirmDialog}
                    />
                  )}
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
      <ConfirmationDialog
        visible={confirmAddNewDialog}
        onAccept={completeConfirmDialog}
        onDismiss={handleHideConfirmDialog}
        message={`Are you sure to ${isEdit ? 'edit' : 'add'} account information?`}
      />
    </div>
  );
}
