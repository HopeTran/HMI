import React from 'react';
import { FormattedDate } from 'react-intl';
import { DEFAULT_ROLE, SUFFIX } from '../../constants/admin';
import NplTooltip from './NplTooltip';

export const timeStampTemplate = (rowData: any, column: any) => {
  return <FormattedDate value={rowData[column.field]} year="numeric" month="long" day="2-digit" />;
};

export const usernameTemplate = (data: any, column: any) => {
  const value = data[column.field] || data.owner;
  return (
    <span>{value}</span>
  );
};

export const userEmailTemplate = (data: any, column: any) => {
  return data[column.field].lastIndexOf(SUFFIX.NPL_CLOSED) >= 0
    ? data[column.field].substring(0, data[column.field].lastIndexOf(SUFFIX.NPL_CLOSED))
    : data[column.field].lastIndexOf(SUFFIX.CLOSED) >= 0
    ? data[column.field].substring(0, data[column.field].lastIndexOf(SUFFIX.CLOSED))
    : data[column.field];
};

export const statusTemplate = (data: any, column: any) => {
  return data[column.field] ? "Actived" : "Inactive";
};

export const rolesBodyTemplate = (rowData: any) => {
  const roles = rowData.roleNames && rowData.roleNames.length > 0 ? rowData.roleNames : [DEFAULT_ROLE];
  const displayRole = roles.length > 1 ? `${roles[0]}, ...` : roles[0];

  return (
    <div className="role-labels">
      <NplTooltip id="roles-tooltip" place="top" type="dark" effect="float" multiline={true} />
      <span data-tip={roles.join('<br />')} data-for="roles-tooltip">
        {displayRole}
      </span>
    </div>
  );
};
