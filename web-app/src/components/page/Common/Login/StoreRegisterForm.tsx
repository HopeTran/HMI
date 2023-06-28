import isEmpty from 'lodash/isEmpty';
import { Field, Form, Formik, FormikProps } from 'formik';
import { Button } from 'primereact/button';
import { Captcha } from 'primereact/captcha';
import qs from 'query-string';
import React, { ReactNode, useEffect, useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { Link, RouteComponentProps } from 'react-router-dom';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

import TextInput from 'components/common/TextInput';
import CheckboxField from 'components/common/CheckboxField';
import Authenticate from 'services/Authenticate';
import { addPasswordSchema, getPasswordValidationWithIndicators } from 'utilities/validator';
import { useNewSignUpPage } from 'store/hooks';
import { setUser } from 'store/user/actions';
import { config } from 'config';
import SignInLink from './SignInLink';
import adminService from 'services/Admin';
import ErrorMessage from 'components/common/ErrorMessage';

import EmailIcon from 'statics/images/email-icon.svg';

interface NewUserFormValues {
  storeName: string;
  storeAddress: string;
  storeFloor: string;
  storePhone: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  termAgreed: boolean;
}

export interface RegisterFormProps extends RouteComponentProps {
  id: string;
  showSignInLink: boolean;
  signUpLabel: string;
  enableCaptcha?: boolean;
  otherLinks?: ReactNode;
}

function StoreRegisterForm(props: RegisterFormProps) {
  const { newSignUpPage, setNewSignUpPage } = useNewSignUpPage();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const dispatch = useDispatch();
  const [acceptTermsDate, setAcceptTermsDate] = useState<Date>(new Date());
  const [password, setPassword] = useState('');
  const [passwordTooltip, setPasswordTooltip] = useState('');
  const [validationSchema, setValidationSchema] = useState<any>();
  const [captchaToken, setCaptchaToken] = useState<string>("");

  const intl = useIntl();

  let emptyUser: NewUserFormValues = {
    storeName: '',
    storeAddress: '',
    storeFloor: '',
    storePhone: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    termAgreed: false,
  };

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getUserSchema = (validators: any) => {
    const userValidators = [
      {
        field: 'email',
        type: 'string',
        validations: [
          {
            type: 'required',
            params: [
              'Email is required',
            ],
          },
          {
            type: 'maxLength',
            params: [
              50,
              'Email Address must not exceed 50 characters',
            ],
          },
          {
            type: 'email',
            params: [
              'Invalid email address',
            ],
          },
        ],
      },
      {
        field: 'passwordConfirm',
        type: 'string',
        validations: [
          {
            type: 'required',
            params: [
              'Password confirm is required',
            ],
          },
          {
            type: 'oneOf',
            params: [
              [Yup.ref('password'), ''],
              'Passwords must match',
            ],
          },
        ],
      },
      {
        field: 'termAgreed',
        type: 'boolean',
        validations: [
          {
            type: 'required',
            params: [
              'Terms agreed is required',
            ],
          },
          {
            type: 'oneOf',
            params: [
              [true],
              'Please check this box to proceed',
            ],
          },
        ],
      },
    ];

    return addPasswordSchema(userValidators, validators);
  };

  
  const parseUserInfo = () => {
    const query = qs.parse(props.location.search);
    if (query?.email) {
      setEmail(query.email as string);
    }
    if (query?.code) {
      setCode(query.code as string);
    }
  };

  const getPasswordValidator = async () => {
    const data = await adminService.fetchPasswordValidators();
    setValidationSchema(getUserSchema(data));
  };

  /* Event handlers */
  const executeCaptcha = () => {
    setIsSubmitting(true);
    const grecaptcha = (window as any).grecaptcha;
    if (grecaptcha) {
      grecaptcha.reset();
      grecaptcha.execute();
    }
  };

  const executeFormSubmission = (values: NewUserFormValues) => {
    if (props.enableCaptcha && captchaToken.length === 0) {
      executeCaptcha();
    } else {
      handleFormSubmit(values, captchaToken);
    }
  };

  const handleFormSubmit = async (values: NewUserFormValues, token: string) => {
    try {
      setErrorMsg('');
      await Authenticate.verifyEmail(values.email, token);

      const { data } = await Authenticate.createStore(
        values.storeName,
        values.storeAddress,
        values.storeFloor,
        values.storePhone,
        values.firstName,
        values.lastName,
        values.email,
        values.username,
        values.password,
        acceptTermsDate.getTime(),
        code,
      );

      if (data.token) {
        dispatch(setUser(data));
      } else {
        if (newSignUpPage) {
          props.history.push(`/register/thankyou-special-aff${window.location.search}`);
        } else {
          props.history.push(`/register/thankyou${window.location.search}`);
        }
      }
    } catch (error: any) {
      const { message } = error.response.data;
      setErrorMsg(intl.formatMessage({ id: `error.${message}`, defaultMessage: message }));
    }
    setIsSubmitting(false);
  };

  const handleAcceptTermsChange = (e: any) => {
    if (e.checked) {
      setAcceptTermsDate(new Date());
    }
  };

  useEffect(() => {
    const validatePassword = async () => {
      if (!isEmpty(validationSchema?.fields?.password) && !isEmpty(password)) {
        const tooltip = await getPasswordValidationWithIndicators(validationSchema?.fields?.password, password);
        setPasswordTooltip(tooltip);
      }
    };
    validatePassword();
  }, [password]);

  useEffect(() => {
    parseUserInfo();
    getPasswordValidator();
    return () => {
      setTimeout(() => {
        setNewSignUpPage(false); // without setTimeout newSignUpPage won't update correctly on other place
      });
    };
  }, []);

  /* Rendering */
  return (
    <Formik
      initialValues={{ ...emptyUser, email }}
      validationSchema={validationSchema}
      onSubmit={executeFormSubmission}
      enableReinitialize={true}
    >
      {({ touched, errors, submitForm }: FormikProps<NewUserFormValues>) => {
        const captchaResponseHandler = (response: any) => {
          if (response.response) {
            setCaptchaToken(response.response)
            submitForm();
          }
        };

        return (
          <Form id={props.id} className="form-group register-form user-authen-form" autoComplete="off">
            <div>
              {/*Store Name*/}
              <div className="d-inline-block w-100 relative">
                <Field type="text" name="storeName" component={TextInput} placeholder="Store Name" className="relative" />
              </div>
              {/*Store Name*/}
              <div className="d-inline-block w-100 relative">
                <Field
                  type="text"
                  name="storeAddress"
                  component={TextInput}
                  placeholder="Store Address"
                  className="relative"
                />
              </div>
              {/*Floor/Suite*/}
              <div className="d-inline-block w-100 relative">
                <Field
                  type="text"
                  name="storeFloor"
                  component={TextInput}
                  placeholder="Floor/Suite (Optional)"
                  className="relative"
                />
              </div>
              <div className="d-flex justify-content-between w-100 relative gap-4">
                {/*First Name*/}
                <div className="w-48">
                  <Field type="text" name="firstName" component={TextInput} placeholder="First Name" className="relative" />
                </div>
                {/*Last Name*/}
                <div className="w-48">
                  <Field type="text" name="lastName" component={TextInput} placeholder="Last Name" className="relative" />
                </div>
              </div>
              {/*Store Phone*/}
              <div className="d-inline-block w-100 relative">
                <Field type="text" name="storePhone" component={TextInput} placeholder="Phone Number" className="relative" />
              </div>

              {/*Email*/}
              <div className="d-inline-block w-100 relative">
                <Field
                  type="email"
                  name="email"
                  component={TextInput}
                  placeholder="Email"
                  icon={EmailIcon}
                  className="relative"
                />
              </div>

              {/*Password*/}
              <div className="d-inline-block w-100 relative">
                <Field
                  type="password"
                  name="password"
                  component={TextInput}
                  placeholder={'Password'}
                  tooltip={passwordTooltip}
                  setInputValue={setPassword}
                />
              </div>
              {/*Password Confirm*/}
              <div className="d-inline-block w-100 relative">
                <Field type="password" name="passwordConfirm" component={TextInput} placeholder={'Confirm Password'} />
              </div>
            </div>

            {/*Checkboxes*/}
            <div className="checkboxes-container mt-2 mb-4 d-inline-flex">
              {/*Terms*/}
              <div id="terms" className="terms">
                <label className="d-flex">
                  <div className="cb-wrapper me-2">
                    <Field
                      className="termAgreed"
                      name="termAgreed"
                      component={CheckboxField}
                      onChange={handleAcceptTermsChange}
                    />
                  </div>
                  <div className="content text-left">
                    {'I accept the'}
                    &nbsp;
                    <Link to="/terms-of-service" target="blank" rel="noopener noreferrer" className="clr-olive-drab">
                      {'Terms of Service'}
                    </Link>
                    &nbsp;{' '}
                    {'and I understand the'}
                    &nbsp;
                    <Link to="/privacy-notice" target="blank" rel="noopener noreferrer" className="clr-olive-drab">
                      {'Privacy Notice'}
                    </Link>
                  </div>
                </label>
                {touched.termAgreed && errors.termAgreed && <div className="input-feedback">{errors.termAgreed}</div>}
              </div>
            </div>

            {!isEmpty(errorMsg) && <ErrorMessage message={errorMsg} displayBlock={true} />}
            <div className="mt-4">
              {props.enableCaptcha && (
                <Captcha
                  siteKey={config.googleRecaptchaKey}
                  size="invisible"
                  onResponse={captchaResponseHandler}
                ></Captcha>
              )}
            </div>

            <div className="form-control signup buttons-group mb-4">
              {isSubmitting ? (
                <i className="pi pi-spin pi-spinner" />
              ) : (
                <>
                  <Button type="submit" disabled={isSubmitting} label={props.signUpLabel} className="spot-btn w-100 text-large" />

                  {props.showSignInLink && (
                    <div className='d-flex justify-content-center text-h5 mt-5'>
                    <p className='text-h5 me-2'>Already have an account?</p>
                      <SignInLink
                        className="clr-dell"
                        label={'Log in\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t'}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            <Row className="form-control info-panel" middle="xs">
              <Col className="register-link pl-8 pl-8-xs">{props.otherLinks}</Col>
            </Row>
            <Row>
              <Col className="register-link pl-8 pl-8-xs">{props.otherLinks}</Col>
            </Row>
          </Form>
        );
      }}
    </Formik>
  );
}

export default StoreRegisterForm;
