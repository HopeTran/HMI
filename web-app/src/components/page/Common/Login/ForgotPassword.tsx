import { Field, Form, Formik, FormikProps } from 'formik';
import { Button } from 'primereact/button';
import { Captcha } from 'primereact/captcha';
import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import * as Yup from 'yup';

import AccountService from '../../../../services/Account';
import FullPageLayout from 'components/common/FullPageLayout';
import FormLayout from 'components/common/FormLayout';
import TextInput from 'components/common/TextInput';
import { config } from 'config';
import SignInLink from './SignInLink';
import ErrorMessage from 'components/common/ErrorMessage';

import EmailIcon from '../../../../statics/images/email-icon.svg';
import { useIntl } from 'react-intl';

interface ForgotPasswordValues {
  email: string;
}

export default function ForgotPassword(props: RouteComponentProps) {
  const [isSubmitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const intl = useIntl();


  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email(intl.formatMessage({
          id: 'm-invalid-email-address',
          defaultMessage: 'Invalid email address',
      }))
      .max(
        50,
        intl.formatMessage({
          id: 'm-email-address-must-not-exceed-50-characters',
          defaultMessage: 'Email Address must not exceed 50 characters',
        }),
      )
      .required(
        intl.formatMessage({
          id: 'm-email-is-required',
          defaultMessage: 'Email is required',
        }),
      ),
  });

  const handleFormSubmit = async (email: string, token: string) => {
    try {
      await AccountService.forgotPassword(email, token);
      setErrorMsg('');
      setMsg(intl.formatMessage({
          id: 'm-reset-password-link-has-been-sent.-please-check-your-email.',
          defaultMessage: 'Reset password link has been sent. Please check your email.',
      }));
    } catch (error:any) {
      setMsg('');
      const { message } = error?.response?.data;
      setErrorMsg(message);
    }
    setSubmitting(false);
  };

  const executeCaptcha = () => {
    setSubmitting(true);
    (window as any).grecaptcha.reset();
    (window as any).grecaptcha.execute();
  };

  return (
    <FullPageLayout>
      <div className="form-layout-container">
        <FormLayout
          className="forgot-password-container"
          headline={intl.formatMessage({
            id: 't-forgot-password',
            defaultMessage: 'Forgot password',
          })}
          footer={intl.formatMessage({
            id: 't-if-you-need-help-resetting-your-password,-we-can-help-by-sending-you-a-link-to-reset-it.',
            defaultMessage: 'If you need help resetting your password, we can help by sending you a link to reset it.',
          })}
        >
          <Formik
            initialValues={{ email: '' }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={executeCaptcha}
            enableReinitialize={true}
          >
            {({ values }: FormikProps<ForgotPasswordValues>) => {
              const captchaResponseHandler = (response: any) => {
                if (response.response) {
                  handleFormSubmit(values.email, response.response);
                }
              };

              return (
                <Form>
                  <div className="d-inline-block w-100 relative">
                    <Field
                      type="text"
                      name="email"
                      component={TextInput}
                      placeholder={intl.formatMessage({
                        id: 't-your-registered-email',
                        defaultMessage: 'Your registered email',
                      })}
                      icon={EmailIcon}
                      className="p-inputtext w-full"
                    />
                  </div>
                  <div className="mt-2 clr-red d-flex justify-content-start">
                    {msg && <div className="msg-info">{msg}</div>}
                    {errorMsg && <ErrorMessage message={errorMsg} displayBlock={true} />}
                  </div>
                  <Captcha siteKey={config.googleRecaptchaKey} size="invisible" onResponse={captchaResponseHandler} />
                  <div className="mt-2">
                    {isSubmitting ? (
                      <i className="pi pi-spin pi-spinner" />
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        label={intl.formatMessage({
                          id: 't-send',
                          defaultMessage: 'Send',
                        })}
                        className="spot-btn btn-default submit-login w-100 mb-4"
                      />
                    )}
                  </div>
                  <div className="mt-4 mb-4">
                    <SignInLink
                      label={intl.formatMessage({
                        id: 't-back-to-sign-in',
                        defaultMessage: 'Back to Sign in',
                      })}
                        className='clr-dell d-flex justify-content-center'
                    />
                  </div>
                </Form>
              );
            }}
          </Formik>
        </FormLayout>
      </div>
    </FullPageLayout>
  );
}
