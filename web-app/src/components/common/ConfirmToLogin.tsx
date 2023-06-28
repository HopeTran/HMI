import { Dialog } from 'primereact/dialog';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { ROUTES } from '../../constants/constant';

export interface Props extends RouteComponentProps {
  content: string;
  isVisible: boolean;
  onHide?: (props: any) => void;
}

const DIALOG_STYLE = { width: '400px' };
function ConfirmToLoginRaw(props: Props) {
  const [isVisible, setIsvisible] = useState(props.isVisible);
 
  useEffect(() => {
    setIsvisible(props.isVisible);
  }, [props.isVisible]);

  const handleLoginClick = () => {
    props.history.push(ROUTES.LOGIN);
  };

  const handleDialogHide = () => {
    if (props.onHide) {
      props.onHide(props);
    } else {
      props.history.push('/');
    }
  };

  return (
    <Dialog visible={isVisible} onHide={handleDialogHide} style={DIALOG_STYLE}>
      <Col className="confirm-login">
        <Row>
          <span className="text-green">{props.content}</span>
        </Row>
        <Row className="btn-groups">
          <button className="btn" onClick={handleLoginClick}>
          <FormattedMessage id="c-login" defaultMessage="Log in" />
          </button>
        </Row>
      </Col>
    </Dialog>
  );
}

export const ConfirmToLogin = withRouter(ConfirmToLoginRaw);
