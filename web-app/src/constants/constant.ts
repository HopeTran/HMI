export const CURRENCY = {
  BTC: 'btc',
  ETH: 'eth',
  USDT: 'usdt',
  USD: 'usd',
  TRX: 'trx',
  VND: 'vnd',
  LTC: 'ltc',
};

export const DATE_FORMAT = {
  LONG_DATE_TIME: 'YYYY-MM-DD HH:mm:ss',
};

export const ROWS_PER_PAGE = 20;

export const PERCENTAGE_TYPE = 'percentage';
export const SUPPORTED_CURRENCY_EXPONENT: { [key: string]: number } = {
  BTC: 8,
  ETH: 8,
  TRX: 8,
  USDT: 2,
  USD: 2,
  VND: 0,
};

export const ROWS_PER_PAGE_OPTIONS = [15, 25, 50, 100, 500];

export const REACT_QUERY_KEYS = {
  ACTIVITIES_TRACKING: 'activities_tracking',
  HEALTH: 'health',
  USER_STATISTIC: 'user_statistic',
};

export const ROUTES = {
  LOGIN: '/login',
  LOGOUT: '/logout',
  REGISTER: '/register',
  STORE_REGISTER: '/store/register',
  ADMIN: '/admin',
  ERROR: '/error',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
};

export const DEFAULT_DATATABLE_FORMAT_TIME = 'MM-DD HH:mm:ss';
export const DEFAULT_DATATABLE_ROW_HEIGHT = 60;
