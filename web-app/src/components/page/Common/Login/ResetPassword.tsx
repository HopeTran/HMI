import { isEmpty } from 'lodash';
import { Field, Form, Formik } from 'formik';
import { Button } from 'primereact/button';
import qs from 'query-string';
import React, { useEffect, useState } from 'react';
import { Col, Grid, Row } from 'react-flexbox-grid';
import { RouteComponentProps } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';

import { addPasswordSchema, getPasswordValidationWithIndicators } from 'utilities/validator';
import AccountService from '../../../../services/Account';
import adminService from '../../../../services/Admin';
import CONSTANTS from 'constants/common';
import { ROUTES } from 'constants/constant';
import { setUser } from 'store/user/actions';
import TextInput from 'components/common/TextInput';
import InputTwoFACode from 'components/page/User/AccountInfo/InputTwoFACode';
import FormLayout from 'components/common/FormLayout';
import FullPageLayout from 'components/common/FullPageLayout';

import EmailIcon from '../../../../statics/images/email-icon.svg';
import PasswordIcon from '../../../../statics/images/password-icon.svg';

const resetPasswordValidators = [
  {
    field: 'email',
    type: 'string',
    validations: [
      {
        type: 'required',
        params: ['Email is required'],
      },
      {
        type: 'maxLength',
        params: [50, 'Email Address must not exceed 50 characters'],
      },
      {
        type: 'email',
        params: ['Invalid email address'],
      },
    ],
  },
  {
    field: 'passwordConfirm',
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
  },
];

export default function ResetPassword(props: RouteComponentProps) {
  const query: any = qs.parse(props.location.search);
  const [errorMsg, setErrorMsg] = useState('');
  const [initFormData, setInitFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [visibleLoginWithTwoFA, setVisibleLoginWithTwoFA] = useState(false);
  const [dataForLoginWithTwoFA, setDataForLoginWithTwoFA] = useState<any>({});
  const [password, setPassword] = useState('');
  const [passwordTooltip, setPasswordTooltip] = useState('');
  const [validationSchema, setValidationSchema] = useState<any>();
  const dispatch = useDispatch();

  useEffect(() => {
    AccountService.checkResetPasswordToken(query.token)
      .then((response: any) => {
        setInitFormData({ ...initFormData, email: response.data });
      })
      .catch((error: any) => {
        if (error.response.data.statusCode === CONSTANTS.STATUS_CODES.NOT_FOUND) {
          props.history.push(ROUTES.LOGIN);
        } else {
          const { message } = error?.response?.data;
          setErrorMsg(message);
        }
      });
  }, []);

  const submitHandler = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      setErrorMsg('');
      const { data } = await AccountService.changePassword(query.token, values.password);
      dispatch(setUser(data));
    } catch (error:any) {
      const { message } = error?.response?.data;
      if (message === CONSTANTS.ERROR_CODES.REQUIRED_2FA) {
        setErrorMsg(message);
        setVisibleLoginWithTwoFA(true);
        setDataForLoginWithTwoFA({ ...values });
      } else {
        setErrorMsg(message);
      }
    }

    setSubmitting(false);
  };

  const handleHideLoginWithTwoFA = () => {
    setVisibleLoginWithTwoFA(false);
  };

  const handleLoginWithTwoFASuccess = (data: any) => {
    dispatch(setUser(data));
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
    (async () => {
      const data = await adminService.fetchPasswordValidators();
      const formValidationSchema = addPasswordSchema(resetPasswordValidators, data);
      setValidationSchema(formValidationSchema);
    })()
  }, []);

  return (
    <FullPageLayout>
      <div className="form-layout-container">
        <FormLayout 
          className="reset-pw-container"
          headline={'Reset password'}
          subHeadline={'If you need help resetting your password, we can help by sending you a link to reset it.'}
        >
          <Formik
            initialValues={initFormData}
            onSubmit={submitHandler}
            validationSchema={validationSchema}
            enableReinitialize={true}
          >
            {(formikProps: any) => {
              return (
                <Form>
                  <Grid className="change-password-content">
                        <div className="d-inline-block w-100 relative">
                          <Field
                            type="email"
                            name="email"
                            readOnly={true}
                            component={TextInput}
                            placeholder="Email"
                            value={formikProps.values.email}
                            icon={EmailIcon}
                            label="Email"
                            className="p-inputtext w-full"
                          />
                        </div>
                        <div className="d-inline-block w-100 relative">
                          <Field
                            type="password"
                            name="password"
                            component={TextInput}
                            value={formikProps.values.password}
                            placeholder="New Password"
                            icon={PasswordIcon}
                            tooltip={passwordTooltip}
                            setInputValue={setPassword}
                            label="New Password"
                            className="p-inputtext w-full"
                          />
                        </div>
                        <div className="d-inline-block w-100 relative">
                          <Field
                            type="password"
                            name="passwordConfirm"
                            component={TextInput}
                            value={formikProps.values.passwordConfirm}
                            placeholder="Confirm Password"
                            icon={PasswordIcon}
                            label="Confirm Password"
                            className="p-inputtext w-full"
                          />
                        </div>
                    <Row start="xs">
                      <Col xs={true}>
                        <div className="mt-4">
                          {formikProps.isSubmitting ? (
                            <i className="pi pi-spin pi-spinner" />
                          ) : (
                            <Button
                              type="submit"
                              label="Submit"
                              className="spot-btn btn-default submit-login w-100"
                            />
                          )}
                          {errorMsg && errorMsg.length > 0 && <div className="mt-2 clr-red d-flex justify-content-start">{errorMsg}</div>}
                        </div>
                      </Col>
                    </Row>
                  </Grid>
                </Form>
              );
            }}
          </Formik>
        </FormLayout>
      </div>

      {/* Show Turn off 2FA popup */}
      <InputTwoFACode
        visible={visibleLoginWithTwoFA}
        dataLogin={dataForLoginWithTwoFA}
        isLogin={true}
        onHide={handleHideLoginWithTwoFA}
        onSuccess={handleLoginWithTwoFASuccess}
        key={Math.random()}
      />
    </FullPageLayout>
  );
}
