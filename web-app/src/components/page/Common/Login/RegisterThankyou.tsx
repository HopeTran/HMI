import React from 'react';
import { Row, Col } from 'react-flexbox-grid';

function RegisterThankyou() {
  return (
    <Row className="register-thankyou" center="xs" middle="xs">
      <Col xs={6}>
        <div className="register-thankyou-content">
          <h1 className='pi pi-check-circle clr-olive-drab mb-4'></h1>
          <h3 className="msg-ty">Thank You For Signing Up</h3>
          <h3>Please Confirm Your Email!</h3>
        </div>
      </Col>
    </Row>
  );
}

export default RegisterThankyou;
