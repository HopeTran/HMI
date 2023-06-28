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
import { FormattedMessage, useIntl } from 'react-intl';

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
import PasswordIcon from 'statics/images/password-icon.svg';

interface NewUserFormValues {
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

let emptyUser: NewUserFormValues = {
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
  termAgreed: false,
};

function RegisterForm(props: RegisterFormProps) {
  const { newSignUpPage, setNewSignUpPage } = useNewSignUpPage();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const dispatch = useDispatch();
  const [acceptTermsDate, setAcceptTermsDate] = useState<Date>(new Date());
  const [password, setPassword] = useState('');
  const [passwordTooltip, setPasswordTooltip] = useState('');
  const [validationSchema, setValidationSchema] = useState<any>();
  const [captchaToken, setCaptchaToken] = useState<string>('');

  const intl = useIntl();

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userValidators = [
    {
      field: 'email',
      type: 'string',
      validations: [
        {
          type: 'required',
          params: [
            intl.formatMessage({
              id: 'm-email-is-required',
              defaultMessage: 'Email is required',
            }),
          ],
        },
        {
          type: 'maxLength',
          params: [
            50,
            intl.formatMessage({
              id: 'm-email-address-must-not-exceed-50-characters',
              defaultMessage: 'Email Address must not exceed 50 characters',
            }),
          ],
        },
        {
          type: 'email',
          params: [
            intl.formatMessage({
              id: 'm-invalid-email-address',
              defaultMessage: 'Invalid email address',
            }),
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
            intl.formatMessage({
              id: 'm-password-confirm-is-required',
              defaultMessage: 'Password confirm is required',
            }),
          ],
        },
        {
          type: 'oneOf',
          params: [
            [Yup.ref('password'), ''],
            intl.formatMessage({
              id: 'm-passwords-must-match',
              defaultMessage: 'Passwords must match',
            }),
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
            intl.formatMessage({
              id: 'm-terms-agreed-is-required',
              defaultMessage: 'Terms agreed is required',
            }),
          ],
        },
        {
          type: 'oneOf',
          params: [
            [true],
            intl.formatMessage({
              id: 'm-please-check-this-box-to-proceed',
              defaultMessage: 'Please check this box to proceed',
            }),
          ],
        },
      ],
    },
  ];

  /* Event handlers */
  const executeFormSubmission = (values: NewUserFormValues) => {
    if (props.enableCaptcha && captchaToken.length === 0) {
      setIsSubmitting(true);
      const grecaptcha = (window as any).grecaptcha;
      if (grecaptcha) {
        grecaptcha.reset();
        grecaptcha.execute();
      }
    } else {
      handleFormSubmit(values, captchaToken);
    }
  };

  const handleFormSubmit = async (values: NewUserFormValues, token: string) => {
    try {
      setErrorMsg('');
      await Authenticate.verifyEmail(values.email, token);

      const { data } = await Authenticate.createAccount(
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
      // Parse user info
      const query = qs.parse(props.location.search);
      if (query?.email) {
        setEmail(query.email as string);
      }
      if (query?.code) {
        setCode(query.code as string);
      }
      // Set form validation schema
      const data = await adminService.fetchPasswordValidators();
      const formValidationSchema = addPasswordSchema(userValidators, data);
      setValidationSchema(formValidationSchema);
    })();

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
      {({ values, touched, errors, submitForm }: FormikProps<NewUserFormValues>) => {
        const captchaResponseHandler = (response: any) => {
          if (response.response) {
            setCaptchaToken(response.response);
            submitForm();
          }
        };

        return (
          <Form id={props.id} className="form-group register-form user-authen-form" autoComplete="off">
            <div>
              {/*Email*/}
              <div className="d-inline-block w-100 relative">
                <Field
                  type="email"
                  name="email"
                  component={TextInput}
                  placeholder={intl.formatMessage({
                    id: 'c-email',
                    defaultMessage: 'Email',
                  })}
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
                  placeholder={intl.formatMessage({
                    id: 'c-password',
                    defaultMessage: 'Password',
                  })}
                  tooltip={passwordTooltip}
                  icon={PasswordIcon}
                  setInputValue={setPassword}
                />
              </div>

              {/*Password Confirm*/}
              <div className="d-inline-block w-100 relative">
                <Field
                  type="password"
                  name="passwordConfirm"
                  component={TextInput}
                  placeholder={intl.formatMessage({
                    id: 'c-confirm-password',
                    defaultMessage: 'Confirm Password',
                  })}
                />
              </div>
            </div>

            {/*Checkboxes*/}
            <div className="checkboxes-container mt-2 mb-4">
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
                    {/* <Checkbox inputId="cb1" value="New York" checked={false}></Checkbox> */}
                  </div>
                  <div className="content text-left">
                    <FormattedMessage id="t-i-accept-the" defaultMessage="I accept the" />
                    &nbsp;
                    <Link to="/terms-of-service" target="blank" rel="noopener noreferrer" className="clr-olive-drab">
                      <FormattedMessage id="t-terms-of-service" defaultMessage="Terms of Service" />
                    </Link>
                    &nbsp; <FormattedMessage id="t-and-i-understand-the" defaultMessage="and I understand the" />
                    &nbsp;
                    <Link to="/privacy-notice" target="blank" rel="noopener noreferrer" className="clr-olive-drab">
                      <FormattedMessage id="t-privacy-notice" defaultMessage="Privacy Notice" />
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
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    label={props.signUpLabel}
                    className="spot-btn w-100 text-large"
                  />

                  {props.showSignInLink && (
                    <SignInLink
                      className="clr-dell d-flex justify-content-center text-h5 mt-5"
                      label={`${intl.formatMessage({
                        id: 't-i-already-have-an-account',
                        defaultMessage: 'I already have an account',
                      })}\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t`}
                    />
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

export default RegisterForm;
