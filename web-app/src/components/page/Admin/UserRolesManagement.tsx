import React, { useEffect, useState } from 'react';
import partition from 'lodash/partition';
import sortBy from 'lodash/sortBy';
import { Button } from 'primereact/button';
import { PickList } from 'primereact/picklist';
import { Grid, Row } from 'react-flexbox-grid';

import adminService from '../../../services/Admin';
import { isDesktop } from '../../../utilities/common';
import { DEFAULT_ROLE } from '../../../constants/admin';
import { useIntl } from 'react-intl';
interface Role {
  _id: string;
  name: string;
}

const loadingStyle = { fontSize: '2em' };
const PICK_LIST_STYLE = { height: isDesktop() ? '400px' : '200px' };

const sortRoles = (roles: Role[]) => {
  return sortBy(roles, role => role.name);
};

interface UserRolesManagementProps {
  user: any;
  onSuccess: () => void;
}

export default function UserRolesManagement({ user, onSuccess }: UserRolesManagementProps) {
  const userRoles = user.roles || (user.type ? [user.type] : []);
  const [source, setSource] = useState<Role[]>([]);
  const [target, setTarget] = useState<Role[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const intl = useIntl();

  const itemTemplate = (data: any) => {
    return <span>{data.name}</span>;
  };

  const handleChange = (event: any) => {
    setSource(sortRoles(event.source));
    setTarget(sortRoles(event.target));
  };

  const getAllRoles = async () => {
    let twoGroups: any[];
    const allRoles = await adminService.getRoles();
    if (userRoles.length > 0) {
      twoGroups = partition(allRoles, role => userRoles.indexOf(role._id) === -1);
    } else {
      twoGroups = partition(allRoles, role => role.name !== DEFAULT_ROLE);
    }
    setSource(sortRoles(twoGroups[0]));
    setTarget(sortRoles(twoGroups[1]));
  };

  const handleSaveClick = async () => {
    const roles = target.map(role => role._id);
    if (roles.length === 0) {
      setErrorMessage(intl.formatMessage({
        id: 'm-user-must-has-at-least-1-role',
        defaultMessage: 'User must has at least 1 role',
      }));
      return;
    }

    setErrorMessage('');
    setLoading(true);
    try {
      await adminService.setUserRoles(
        user._id,
        target.map(role => role._id),
      );

      onSuccess();
    } catch (err: any) {
      if (err.response) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage(err.message);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    getAllRoles();
  }, []);

  return (
    <Grid className="user-roles-management mt-4">
      <div>
        <PickList
          source={source}
          target={target}
          itemTemplate={itemTemplate}
          sourceHeader={intl.formatMessage({
            id: 't-all-roles',
            defaultMessage: 'All Roles',
          })}
          targetHeader={intl.formatMessage({
            id: 't-user-roles',
            defaultMessage: 'User Roles',
          })}
          showSourceControls={false}
          showTargetControls={false}
          sourceStyle={PICK_LIST_STYLE}
          targetStyle={PICK_LIST_STYLE}
          onChange={handleChange}
        />
      </div>
      <Row className="save mt-4">
        {isLoading ? (
          <i className="pi pi-spin pi-spinner" style={loadingStyle} />
        ) : (
          <Button label={intl.formatMessage({
            id: 'c-save',
            defaultMessage: 'Save',
          })} type="submit" className="btn-positive mt-4 col-md-3 m-auto" onClick={handleSaveClick} />
        )}
      </Row>
      <Row>
        <span className={'error-message'}>{errorMessage}</span>
      </Row>
    </Grid>
  );
}
