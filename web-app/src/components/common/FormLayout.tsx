import React, { ReactNode } from 'react';
import classnames from 'classnames';

interface Props {
  className?: string;
  childClassName?: string;
  children: ReactNode;
  headline?: any;
  subHeadline?: string;
  footer?: any;
}

export default function FormLayout(props: Props) {
  return (
    <div className={classnames('form-layout', props.className)}>
      <div className={classnames('form-layout-content-wrapper', props.childClassName)}>
        <div className='form-layout-content'>
          <div className="auth-head">
            {/*Headline*/}
            {props.subHeadline && <span className='text-h5 clr-oxford-blue'>{props.subHeadline}</span>}
            {props.headline && <p className='authen-title mb-4'>{props.headline}</p>}
          </div>

          <div className="form-layout-content-main">
            {props.children}
          </div>

          {/*Footer*/}
          {props.footer && <div className="form-layout-footer mt-4">{props.footer}</div>}
        </div>
      </div>
    </div>
  );
}
