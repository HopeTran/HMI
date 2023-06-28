import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import FullPageLayout from 'components/common/FullPageLayout';
import FormLayout from 'components/common/FormLayout';
import StoreRegisterForm from './StoreRegisterForm';

function StoreRegister(props: RouteComponentProps) {
  return (
    <FullPageLayout>
      <div className="form-layout-container store-register">
        <FormLayout className="register-container" headline="Sign up" subHeadline="Become an HMI chef">
          <StoreRegisterForm
            id="registration"
            showSignInLink={true}
            signUpLabel="Sign Up"
            enableCaptcha={true}
            {...props}
          />
        </FormLayout>
      </div>
    </FullPageLayout>
  );
}

export default StoreRegister;
