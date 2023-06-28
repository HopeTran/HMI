import { Field, Form, Formik } from 'formik';
import { Button } from 'primereact/button';
import qs from 'query-string';
import React, { ReactNode, useEffect, useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import * as Yup from 'yup';

import ErrorMessage from 'components/common/ErrorMessage';
import FullPageLayout from 'components/common/FullPageLayout';
import FormLayout from 'components/common/FormLayout';
import TextInput from 'components/common/TextInput';
import InputTwoFACode from 'components/page/User/AccountInfo/InputTwoFACode';
import { config } from 'config';
import CONSTANTS from 'constants/common';
import StoresFilter from 'models/storesFilter';
import AccountService from 'services/Account';
import AuthenticateService from 'services/Authenticate';
import { setUser } from 'store/user/actions';
import { redirectToLink, setItemLocalStorage } from 'utilities/common';
import LoginSocialButtons from './LoginSocialButtons';

interface Props extends RouteComponentProps {
  otherLinks?: ReactNode;
  onCallTwoFA?: (data: any) => void;
}

function LoginForm(props: Props) {
  const [errorMsg, setErrorMsg] = useState('');
  const [attemptRemaining, setAttemptRemaining] = useState(0);

  const dispatch = useDispatch();
  const history = useHistory();

  const intl = useIntl();

  const NewUserSchema = Yup.object().shape({
    email: Yup.string()
      .required(
        intl.formatMessage({
          id: 'm-email-is-required',
          defaultMessage: 'Email is required',
        }),
      )
      .email(
        intl.formatMessage({
          id: 'm-invalid-email-address',
          defaultMessage: 'Invalid email address',
        }),
      ),
    password: Yup.string().required(
      intl.formatMessage({
        id: 'm-password-is-required',
        defaultMessage: 'Password is required',
      }),
    ),
  });

  const submitHandler = async (values: any, { setSubmitting }: any) => {
    try {
      const { data } = await AccountService.login(values);
      const preLink = localStorage.getItem(CONSTANTS.STORAGE_KEY.PRE_LINK);
      if (preLink && preLink !== 'null') {
        history.replace(`${JSON.parse(preLink)}`);
      } else {
        history.replace('/');
      }
      dispatch(setUser(data));
      dispatch({
        type: 'filter_store',
        filter: new StoresFilter(),
      })
      setItemLocalStorage(CONSTANTS.STORAGE_KEY.PRE_LINK, null);
    } catch (error: any) {
      const { message } = error?.response?.data;
      if (message === CONSTANTS.ERROR_CODES.REQUIRED_2FA && props.onCallTwoFA) {
        setErrorMsg('');
        props.onCallTwoFA({ ...values });
      } else {
        if (message === CONSTANTS.ERROR_CODES.INVALID_LOGIN_ATTEMPTS) {
          setErrorMsg(message);
          setAttemptRemaining(0);
        } else {
          setErrorMsg(message);
          const loginAttempts = error.response?.data?.data?.loginAttempts || 0;
          setAttemptRemaining(loginAttempts);
        }
      }
    }
    setSubmitting(false);
  };

  const parseUserInfo = async () => {
    const query = qs.parse(props.location.search);
    if (query?.email && query?.code) {
      try {
        const { data } = await AccountService.login({
          email: query.email,
          code: query.code,
        });
        dispatch(setUser(data));
      } catch (error: any) {
        const errorCode = error.response?.data?.errorCode || 0;
        if (errorCode === CONSTANTS.ERROR_CODES.REQUIRED_2FA && props.onCallTwoFA) {
          setErrorMsg('');
          props.onCallTwoFA({
            email: query.email,
            code: query.code,
          });
        }
      }
    }
  };

  useEffect(() => {
    parseUserInfo();
  }, []);

  return (
    <Formik initialValues={{ email: '', password: '' }} onSubmit={submitHandler} validationSchema={NewUserSchema}>
      {({ isSubmitting }: any) => (
        <Form>
          <div className="d-inline-block w-100">
            <Field
              type="email"
              name="email"
              className="p-inputtext w-full"
              component={TextInput}
              placeholder={intl.formatMessage({
                id: 't-account-email',
                defaultMessage: 'Account (Email)',
              })}
            />
          </div>
          <div className="d-inline-block w-100 relative">
            <Field
              type="password"
              name="password"
              className="p-inputtext w-full"
              component={TextInput}
              placeholder={intl.formatMessage({
                id: 'c-password',
                defaultMessage: 'Password',
              })}
            />
          </div>
          <div className="forgot-password-link mb-4 mt-2 d-flex justify-content-end">
            <Link to={'/forgot-password'} className="fs-11rem-xs clr-olive-drab">
              <FormattedMessage id="c-forgot-password" defaultMessage="Forgot Password?" />
            </Link>
          </div>
          <div className="my-4">
            {isSubmitting ? (
              <i className="pi pi-spin pi-spinner" />
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                label={intl.formatMessage({
                  id: 'c-login-now',
                  defaultMessage: 'Login now',
                })}
                className="spot-btn btn-default submit-login w-100 text-large"
              />
            )}
          </div>
          <div className="mb-4 clr-red mt-4">
            {errorMsg && <ErrorMessage message={errorMsg} displayBlock={true} />}
            {attemptRemaining > 0 && (
              <ErrorMessage message={`${attemptRemaining} attempts remaining ...!`} displayBlock={true} />
            )}
          </div>
          <div className="mb-4 mt-4 text-h5 d-flex justify-content-center pt-4">
            <span className="me-2">
              <FormattedMessage id="t-don't-have-an-account" defaultMessage="Don't have an account?" />
            </span>
            <Link to={'/register'} className="fs-11rem-xs clr-olive-drab me-2">
              <FormattedMessage id="t-join-free-today" defaultMessage="Join free today" />
            </Link>
          </div>
          <Row className="mb-4 mt-4 form-control info-panel" middle="xs">
            <Col className="register-link d-flex justify-content-center pl-8 pl-8-xs">{props.otherLinks}</Col>
          </Row>
          <div className="mb-4 text-h5 d-flex justify-content-center">
            <Link to={'/'} className="fs-11rem-xs clr-olive-drab me-2">
              <FormattedMessage id="t-back-to-homepage" defaultMessage="Back to Homepage" />
            </Link>
          </div>
        </Form>
      )}
    </Formik>
  );
}

function Login(props: RouteComponentProps) {
  const dispatch = useDispatch();
  const [singleSignInMsg, setSingleSignInMsg] = useState('');
  const [visibleLoginWithTwoFA, setVisibleLoginWithTwoFA] = useState(false);
  const [dataForLoginWithTwoFA, setDataForLoginWithTwoFA] = useState<any>({});

  const intl = useIntl();
  const { socialError, token, socialProvider } = qs.parse(props.location.search);

  const handleCallLoginWithTwoFA = (data: any) => {
    setVisibleLoginWithTwoFA(true);
    setDataForLoginWithTwoFA(data);
  };

  const handleHideLoginWithTwoFA = () => {
    setVisibleLoginWithTwoFA(false);
  };

  const handleLoginWithTwoFASuccess = (data: any) => {
    dispatch(setUser(data));
  };

  const signInWithSingleSignIn = async (token: string) => {
    try {
      const { data } = await AuthenticateService.loginWithSingleSignIn(token, '');

      if (data) {
        dispatch(setUser(data));
      }
    } catch (error: any) {
      if (error.response.data.message === CONSTANTS.ERROR_CODES.REQUIRED_2FA) {
        setSingleSignInMsg('');
        setDataForLoginWithTwoFA({ token });
        setVisibleLoginWithTwoFA(true);
      }
      if (error.response.data.message === CONSTANTS.ERROR_CODES.SESSION_TIMEOUT) {
        setTimeout(() => {
          redirectToLink(`${config.apiServerUrl}/social/login/${socialProvider}`);
        }, 3000);
      }
      if (error.response.data.statusCode === CONSTANTS.STATUS_CODES.NOT_FOUND) {
        console.log({ token, provider: socialProvider });
      } else {
        const { message } = error.response.data;
        setSingleSignInMsg(intl.formatMessage({ id: `error.${message}`, defaultMessage: message }));
      }
    }
  };

  useEffect(() => {
    if (token) {
      signInWithSingleSignIn(String(token));
    }
  }, [token]);

  return (
    <FullPageLayout>
      <div className="form-layout-container login">
        <FormLayout
          className="login-container"
          headline={intl.formatMessage({
            id: 't-login-to-your-account',
            defaultMessage: 'Login to your account',
          })}
          subHeadline={intl.formatMessage({
            id: 't-welcome-back',
            defaultMessage: 'Welcome back',
          })}
        >
          <LoginForm {...props} onCallTwoFA={handleCallLoginWithTwoFA} otherLinks={<LoginSocialButtons />} />
          <InputTwoFACode
            visible={visibleLoginWithTwoFA}
            dataLogin={dataForLoginWithTwoFA}
            isLogin={true}
            onHide={handleHideLoginWithTwoFA}
            onSuccess={handleLoginWithTwoFASuccess}
            key={Math.random()}
          />
          {singleSignInMsg && <div className="single-sign-in-error">{singleSignInMsg}</div>}
          {socialError && <div className="single-sign-in-error">{socialError}</div>}
        </FormLayout>
      </div>
    </FullPageLayout>
  );
}

export default Login;
