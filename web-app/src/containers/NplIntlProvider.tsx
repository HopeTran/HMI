import { IntlProvider } from 'react-intl';
import { connect } from 'react-redux';

import { AppState } from '../store';

const mapStateToProps = ({ locales: { locale, messages } }: AppState) => ({
  key: locale,
  locale,
  messages,
});

export default connect(mapStateToProps)(IntlProvider as any);
