import React  from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useIntl } from 'react-intl';

import FullPageLayout from 'components/common/FullPageLayout';
import FormLayout from 'components/common/FormLayout';
import RegisterForm from './RegisterForm';

function Register(props: RouteComponentProps) {

  const intl = useIntl();
  
  return (
    <FullPageLayout>
      <div className="form-layout-container">
        <FormLayout
          className="register-container"
          headline={intl.formatMessage({
            id: 'c-sign-up',
            defaultMessage: 'Sign Up',
          })}
          subHeadline={intl.formatMessage({
            id: 't-become-an-hmi-user',
            defaultMessage: 'Become an HMI user',
          })}
        >
          <RegisterForm
            id="registration"
            showSignInLink={true}
            signUpLabel={intl.formatMessage({
              id: 'c-sign-up',
              defaultMessage: 'Sign Up',
            })}
            enableCaptcha={true}
            {...props}
          />
        </FormLayout>
      </div>
    </FullPageLayout>
  );
}

export default Register;
