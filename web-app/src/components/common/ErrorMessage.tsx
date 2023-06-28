import React from 'react';
import classnames from 'classnames';
import { useIntl } from 'react-intl';

interface Props {
  message: string | string[] | null;
  displayBlock?: boolean;
}

function ErrorMessage(props: Props) {
  const intl = useIntl();
  if (props.message && props.message !== '') {
    return (
      <span
        className={classnames('text-error text-danger', {
          'display-block': props.displayBlock,
        })}
      >
        {intl.formatMessage({ id: 'error.' + props.message.toString(), defaultMessage: props.message.toString() })}
      </span>
    );
  } else {
    return null;
  }
}
export default ErrorMessage;
