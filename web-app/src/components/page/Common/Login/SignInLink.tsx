import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from 'constants/constant';

interface Props {
  for?: 'vip';
  label?: string;
  className?: string;
  children?: ReactNode;
}

export default function SignInLink(props: Props) {
  return (
    <Link to={props.for ? `/${props.for}/login` : ROUTES.LOGIN} className={props.className ? props.className : ''}>
      {props.children ? props.children : props.label ? props.label : 'Sign In'}
    </Link>
  );
}
