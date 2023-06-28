import React, { useEffect, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { Field, Form, Formik } from 'formik';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import * as Yup from 'yup';

import AdminService from '../../../services/Admin';
import { useIntl } from 'react-intl';

interface Props {
  visible: boolean;
  onHide: () => void;
}

interface NewUserFormValues {
  username: string;
  email: string;
  password: string;
}

const DIALOG_STYLE = { width: '500px' };
function CreateUserDialog(props: Props) {
  const [errorMsg, setErrorMsg] = useState('');
  const [savingMessage, setSavingMessage] = useState('');

  let emptyUser: NewUserFormValues = {
    username: '',
    email: '',
    password: '',
  };
  const intl = useIntl();
  const UserInfoSchema = Yup.object().shape({
    email: Yup.string().required(intl.formatMessage({
      id: 'm-email-is-required',
      defaultMessage: 'Email is required',
    })),
    password: Yup.string().required(intl.formatMessage({
      id: 'm-name-is-required',
      defaultMessage: 'Name is required',
    })),
  });

  const handleFormSubmit = async (values: NewUserFormValues, { setSubmitting }: any) => {
    try {
      setErrorMsg('');
      setSavingMessage('');

      await AdminService.createUser(values.email, values.username, values.password);
      setSavingMessage(intl.formatMessage({
        id: 'm-created-user-success!',
        defaultMessage: 'Created user success!',
      }));
    } catch (error: any) {
      const { message } = error.response.data;
      setErrorMsg(message);
    }
    setSubmitting(false);
  };

  useEffect(() => {
    setErrorMsg('');
    setSavingMessage('');
  }, [props.visible]);

  /* Rendering */
  return (
    <Dialog
      className="create-user-dialog"
      header={intl.formatMessage({
        id: 't-create-user',
        defaultMessage: 'Create User',
      })}
      style={DIALOG_STYLE}
      visible={props.visible}
      onHide={props.onHide}
    >
      <Formik
        initialValues={{ ...emptyUser }}
        validationSchema={UserInfoSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
      >
        {({ isSubmitting, handleSubmit }) => {
          const onCreateClick = (e: any) => {
            handleSubmit(e);
          };
          return (
            <Form className="form-group register-form tw-flex tw-flex-col">
              {/*Email*/}
              <div className="d-inline-block w-100 relative">
                <Field type="email" name="email" placeholder="Email" className="p-inputtext mb-4" label="Email" />
              </div>
              {/*Password*/}
              <div className="d-inline-block w-100 relative">
                <Field
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="p-inputtext mb-4"
                  label="Password"
                />
              </div>

              {!isEmpty(errorMsg) && <div className="text-error text-danger tw-mb-4">{errorMsg}</div>}
              {savingMessage && <div className="tw-mb-4 clr-viridian-green">{savingMessage}</div>}
              <div className="m-auto signup buttons-group tw-mb-4 mt-4">
                {isSubmitting ? (
                  <i className="pi pi-spin pi-spinner" />
                ) : (
                  <>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      label="Create"
                      className="signup-btn"
                      onClick={onCreateClick}
                    />
                  </>
                )}
              </div>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
}

export default CreateUserDialog;
