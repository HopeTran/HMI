export interface ColumnOptions {
  label: string;
  value: string;
  field: string;
  style?: object;
}
  
export const COLUMN_OPTIONS: { [prop: string]: ColumnOptions } = {
  username: {
    label: 'Username',
    value: 'Username',
    field: 'username',
    style: { width: '120px' },
  },
  email: {
    label: 'Email',
    value: 'Email',
    field: 'email',
    style: { width: '120px' },
  },
  createdAt: {
    label: 'Registered At',
    value: 'Registered At',
    field: 'createdAt',
    style: { width: '190px' },
  },
  ipAddress: {
    label: 'Registered IP',
    value: 'Registered IP',
    field: 'ipAddress',
    style: { width: '150px' },
  },
  lastLoggedIP: {
    label: 'Last Logged IP',
    value: 'Last Logged IP',
    field: 'lastLoggedIP',
    style: { width: '150px' },
  },
  status: {
    label: 'Status',
    value: 'Status',
    field: 'status',
    style: { width: '100px' },
  },
  roleNames: {
    label: 'Roles',
    value: 'Roles',
    field: 'roles',
    style: { width: '100px' },
  },
};

export const DEFAULT_SELECTED_COLUMNS = [
  COLUMN_OPTIONS.username.value,
  COLUMN_OPTIONS.email.value,
  COLUMN_OPTIONS.roleNames.value,
];

export const ACTIONS = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
};

export const USER_MANAGEMENT_TYPE = {
    ACTIVE: 'active',
    CLOSED: 'closed',
};

export const STORE_INFORMAITON_FIELDS = [
    {name: 'User email', value:'email'},
    {name: 'User name', value:'username'},
    {name: 'User country', value:'countryCode'},
    {name: 'Store name', value:'name'},
    {name: 'Store address', value:'address'},
    {name: 'Store photo', value:'photo'},
    {name: 'Store description', value:'description'},
    {name: 'Longitude', value:'longitude'},
    {name: 'Latitude', value:'latitude'},
    {name: 'Operation times', value:'operationTimes'},
    {name: 'Cuisines', value:'cuisines'},
    {name: 'Categories', value:'categories'},
]

export const DEFAULT_ROLE = 'User';

export const SUFFIX = {
    NPL_CLOSED: '_nplclosed',
    CLOSED: '_closed',
};

export const STORE_MANAGEMENT_TYPE = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};