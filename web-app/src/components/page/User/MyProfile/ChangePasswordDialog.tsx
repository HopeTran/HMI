/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty } from 'lodash';
import { Field, Form, Formik } from 'formik';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import * as Yup from 'yup';

import AccountService from '../../../../services/Account';
import AdminService from '../../../../services/Admin';
import { addPasswordSchema, getPasswordValidationWithIndicators } from '../../../../utilities/validator';
import TextInput from '../../../common/TextInput';
import ErrorMessage from '../../../common/ErrorMessage';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';
const getChangePasswordSchema = (validators: any) => {
  const changePasswordValidators = [
    {
      field: 'password',
      type: 'string',
      validations: [
        {
          type: 'required',
          params: ['Old password is required'],
        },
        {
          type: 'minLength',
          params: [6, 'Password must have from 6 to 50 characters'],
        },
        {
          type: 'maxLength',
          params: [50, 'Password must have from 6 to 50 characters'],
        },
      ],
    },
    {
      field: 'confirmPassword',
      type: 'string',
      validations: [
        {
          type: 'required',
          params: ['Password confirm is required'],
        },
        {
          type: 'oneOf',
          params: [[Yup.ref('password'), ''], 'Passwords must match'],
        },
      ],
    }
  ];
  return addPasswordSchema(changePasswordValidators, validators);
};

const emptyChangePassword = {
  oldPassword: '',
  password: '',
  confirmPassword: '',
  google2FA: '',
};

interface ChangePasswordDialogProps {
  visible: boolean;
  style: any;
  user: any;
  isFromAdmin?: boolean;
  onHide: () => void;
  onSuccess?: (data: any) => void;
  className?: string;
}

export default function ChangePasswordDialog(props: ChangePasswordDialogProps) {
  const [serverError, setServerError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordTooltip, setPasswordTooltip] = useState('');
  const [validationSchema, setValidationSchema] = useState<any>();
  const intl = useIntl();
  const submitHandler = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      setServerError('');
      let data;
      if (props.isFromAdmin) {
        data = await AdminService.updateUser({
          userId: props.user._id,
          password: values.password,
        });
      } else {
          data = await AccountService.updatePassword(values.oldPassword, values.password, values.twoFACode);
      }
      if (props.onSuccess) {
        props.onSuccess(data);
      }
      resetForm();
    } catch (error: any) {
      const { message } = error.response.data;
      setServerError(message);
    }
    setSubmitting(false);
  };

  const getPasswordValidator = async () => {
    const data = await AdminService.fetchPasswordValidators();
    setValidationSchema(getChangePasswordSchema(data));
  };

  const validatePassword = async () => {
    if (!isEmpty(validationSchema?.fields?.password) && !isEmpty(password)) {
      const tooltip = await getPasswordValidationWithIndicators(validationSchema?.fields?.password, password);
      setPasswordTooltip(tooltip);
    }
  };

  useEffect(() => {
    validatePassword();
  }, [password]);

  useEffect(() => {
    getPasswordValidator();
  }, []);

  return (
    <Dialog
      visible={props.visible}
      style={props.style}
      onHide={props.onHide}
      dismissableMask={false}
      header={intl.formatMessage({
        id: 't-change-password',
        defaultMessage: 'Change Password',
      })}
      className={`confirm-dialog form-dialog change-password ${props.className ? props.className : ''}`}
    >
      <>
        <Formik initialValues={emptyChangePassword} onSubmit={submitHandler} validationSchema={getChangePasswordSchema}>
          {(formikProps: any) => {
            return (
              <Form className="form-content-dialog form-group none-border-fields mb-5">
                <div className="dialog-content-container">
                  {!props.isFromAdmin && (
                    <>
                      <Row className="mb-2">
                      <FormattedMessage id="t-current-password" defaultMessage="Current Password" />
                      </Row>
                      <Row>
                        <Field className="p-inputtext" type="password" component={TextInput} name="oldPassword" />
                      </Row>
                    </>
                  )}
                  <Row className="form-row mb-2">
                  <FormattedMessage id="t-new-password" defaultMessage="New Password" />
                  </Row>
                  <Row className="form-row">
                    <Field
                      className="p-inputtext"
                      type="password"
                      component={TextInput}
                      name="password"
                      tooltip={passwordTooltip}
                      setInputValue={setPassword}
                    />
                  </Row>
                  <Row className="form-row mb-2">
                  <FormattedMessage id="t-confirm-password" defaultMessage="Confirm Password" />
                  </Row>
                  <Row className="form-row">
                    <Field className="p-inputtext" type="password" component={TextInput} name="confirmPassword" />
                  </Row>
                  {!props.isFromAdmin && props.user.isTwoFA && (
                    <>
                      {' '}
                      <Row className="form-row">TwoFA Code</Row>
                      <Row className="form-row">
                        <Field className="p-inputtext" type="text" component={TextInput} name="twoFACode" />
                      </Row>
                    </>
                  )}
                  {serverError && (
                    <Row className="form-row mb-2">
                      <ErrorMessage message={serverError} />
                    </Row>
                  )}
                  <Row className="form-row mt-12">
                    <Col className="confirm-btn-item">
                      {formikProps.isSubmitting ? (
                        <i className="pi pi-spin pi-spinner" />
                      ) : (
                        <>
                          <Button type="submit" className="btn-positive" 
                          label={intl.formatMessage({
        id: 't-confirm-change',
        defaultMessage: 'Confirm Change',
      })}/>
                        </>
                      )}
                    </Col>
                  </Row>
                </div>
              </Form>
            );
          }}
        </Formik>
      </>
    </Dialog>
  );
}
