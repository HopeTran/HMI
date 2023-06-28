import { Field, Form, Formik, useFormikContext } from 'formik';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import React, { createRef, useEffect, useState } from 'react';
import { Col, Grid, Row } from 'react-flexbox-grid';
import * as Yup from 'yup';

import AccountService from '../../../../services/Account';
import ErrorMessage from '../../../common/ErrorMessage';

interface Props {
  visible: boolean;
  dataLogin?: any;
  isLogin?: boolean;
  wantCheck?: boolean;
  onHide: () => void;
  onSuccess?: (data: any) => void;
}

const DIALOG_STYLE = { width: '460px' };

const TwoFACodeInputSchema = Yup.object().shape({
  twoFACode: Yup.string()
    .required("Google 2FA code is required.")
    .min(6, 'Please enter a 6-digit verification code.')
    .max(6, 'Please enter a 6-digit verification code.'),
});

const AutoSubmitToken = () => {
  const { values, submitForm } = useFormikContext<any>();
  useEffect(() => {
    if (values.twoFACode.length === 6) {
      submitForm();
    }
  }, [values, submitForm]);
  return null;
};

export default function InputTwoFACode(props: Props) {
  const [serverError, setServerError] = useState('');
  const inputRef: any = createRef();
  
  const submitHandler = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      setServerError('');
      let userData;
      if (props.dataLogin && props.isLogin) {
        const { data } = await AccountService.login({
          ...values,
          ...props.dataLogin,
        });
        userData = data;
      } else if (props.wantCheck) {
        await AccountService.checkGoogleTwoFA({ ...values });
      } else {
        const { data } = await AccountService.turnOffGoogleTwoFA({ ...values });
        userData = data;
      }

      if (props.onSuccess) {
        props.onSuccess(userData);
      }
      resetForm();
      props.onHide();
    } catch (error: any) {
      const { message } = error.response.data;
      setServerError(message);
    }
    setSubmitting(false);
  };

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <Dialog
      visible={props.visible}
      style={DIALOG_STYLE}
      onHide={props.onHide}
      dismissableMask={true}
      header="Google Authentication"
      className="two-fa-form"
    >
      <Formik
        initialValues={{ twoFACode: '' }}
        onSubmit={submitHandler}
        validationSchema={TwoFACodeInputSchema}
        enableReinitialize={true}
      >
        {(formikProps: any) => {
          return (
            <Form className="change-password-content form-group none-border-fields">
              <Grid className="dialog-content-container">
                <Row className="form-row">
                  <Col xs={12} className="infos">
                    <p className="left-panel">
                      Google 2FA
                    </p>
                    <p className="right-panel">
                      Input the 6-digit code in your Google Authenticator app
                    </p>
                  </Col>

                  <Col xs={12} className="infos">
                    <p>
                    Google Authentication Code
                    </p>
                    <div className="two-fa-code">
                      <Field
                        innerRef={inputRef}
                        className="p-inputtext input-two-fa-code"
                        type="text"
                        name="twoFACode"
                        maxLength={6}
                      />
                    </div>
                    {serverError && serverError.length > 0 && <ErrorMessage message={serverError} />}
                  </Col>
                </Row>

                <Row>
                  <Col className="confirm-btn-group text-right" xs={true}>
                    {formikProps.isSubmitting && <i className="pi pi-spin pi-spinner" />}
                    <Button
                      type="submit"
                      className="npl-btn btn-positive btn-small"
                      label="Submit"
                    />
                  </Col>
                </Row>
              </Grid>
              <AutoSubmitToken />
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
}
