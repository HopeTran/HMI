import moment from 'moment';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Col } from 'react-flexbox-grid';
import { InputText } from 'primereact/inputtext';

import DateRangeFilter from '../../common/DateRangeFilter';
import CONSTANTS from '../../../constants/common';
import { USER_MANAGEMENT_TYPE } from '../../../constants/admin';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';
interface UserFilterProps {
  type: string;
  isLoading: boolean;
  roleOptions: any;
  onFilterSubmit: (filter: any) => void;
}
export const FILTER_ACCOUNT_STATUS_OPTIONS = [
  { label: 'Unactivated', value: 'unactivated' },
  {
    label: 'Activated',
    value: 'activated',
  },
  {
    label: 'Banned',
    value: 'banned',
  },
  {
    label: 'Unbanned',
    value: 'unbanned',
  },
  { label: 'All', value: 'all' },
];

export default function UserFilter(props: UserFilterProps) {
  const intl = useIntl();
  const [range, setRange] = useState<any>({
    range: 'all-time',
    from: moment().startOf('day').format(CONSTANTS.DATE_FORMAT.SHORT_DATE),
    to: moment().endOf('day').format(CONSTANTS.DATE_FORMAT.SHORT_DATE),
  });
  const [selectedAccountStatus, setSelectedAccountStatus] = useState<string>(FILTER_ACCOUNT_STATUS_OPTIONS[1].value);
  const [selectedRoles, setSelectedRoles] = useState<any[]>([]);
  const [userSearchText, setUserSearchText] = useState<string>('');

  const handleDateRangeChanged = (e: any) => {
    setRange(e);
    props.onFilterSubmit({
      userSearchText,
      statuses: selectedAccountStatus,
      roles: selectedRoles,
      dateRange: e,
    });
  };

  const handleStatusChanged = (e: any) => {
    setSelectedAccountStatus(e.value);
  };

  const handleRoleChanged = (e: any) => {
    setSelectedRoles(e.value);
  };

  const handleUserSearchTextChange = (e: any) => {
    setUserSearchText(e.target.value);
  };

  return (
    <div className="filter-container">
      <div className="filter-row d-md-flex">
        {props.type === USER_MANAGEMENT_TYPE.ACTIVE && (
          <div className="d-flex">
            <Col className="me-4 mb-2">
              <div className="mb-2">
                <FormattedMessage id="t-user-name" defaultMessage="User Name" />
              </div>
              <div className="dropdown-group">
                <InputText
                  className="search-users-input"
                  value={userSearchText}
                  onChange={handleUserSearchTextChange}
                />
              </div>
            </Col>

            <Col className="me-4 mb-2">
              <div className="mb-2">
                <FormattedMessage id="t-status" defaultMessage="Status" />
              </div>
              <div className="dropdown-group">
                <Dropdown
                  options={FILTER_ACCOUNT_STATUS_OPTIONS}
                  value={selectedAccountStatus}
                  onChange={handleStatusChanged}
                  disabled={props.isLoading}
                  className="account-type"
                />
              </div>
            </Col>
          </div>
        )}
        <div className="d-flex">
        <Col className="me-4 mb-2">
          <div className="mb-2">
            <FormattedMessage id="t-roles" defaultMessage="Roles" />
          </div>
          <div className="dropdown-group">
            <MultiSelect
              className="multi-select"
              value={selectedRoles}
              filter={true}
              disabled={props.isLoading}
              options={props.roleOptions}
              optionLabel="name"
              onChange={handleRoleChanged}
            />
          </div>
        </Col>
        <Col className="me-4">
          <div className="mb-2">
            {props.type === USER_MANAGEMENT_TYPE.ACTIVE
              ? intl.formatMessage({
                  id: 't-resgiter-time',
                  defaultMessage: 'Resgiter Time',
                })
              : intl.formatMessage({
                  id: 't-closed-time',
                  defaultMessage: 'Closed Time',
                })}
          </div>
          <DateRangeFilter
            onDateRangeChange={handleDateRangeChanged}
            disabled={!isEmpty(userSearchText)}
            dateRange={range}
            submitBtnLabel={intl.formatMessage({
              id: 't-filter',
              defaultMessage: 'Filter',
            })}
          />
        </Col>
        </div>
      </div>
    </div>
  );
}
