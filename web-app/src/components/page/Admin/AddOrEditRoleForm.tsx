import partition from 'lodash/partition';
import sortBy from 'lodash/sortBy';
import { Button } from 'primereact/button';
import { PickList } from 'primereact/picklist';
import React, { useEffect, useState } from 'react';
import { Col, Grid, Row } from 'react-flexbox-grid';
import { Dialog } from 'primereact/dialog';

import adminService from '../../../services/Admin';
import { isDesktop } from '../../../utilities/common';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';
interface Permission {
  value: string;
  label: string;
}

const loadingStyle = { fontSize: '2em' };
const PICK_LIST_STYLE = { height: isDesktop() ? '400px' : '200px' };
const DIALOG_WIDTH = { width: '800px'}

const sortPermissions = (permissions: Permission[]) => {
  return sortBy(permissions, permission => permission.label);
};

interface RoleFormProps {
  role: any;
  isEdit: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

export default function AddOrEditRoleForm({ role, isEdit, onHide, onSuccess }: RoleFormProps) {
  const rolePermissions = isEdit ? role.permissions : [];
  const [roleName, setRoleName] = useState(isEdit ? role.name : '');
  const [source, setSource] = useState<Permission[]>([]);
  const [target, setTarget] = useState<Permission[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const intl = useIntl();
  const itemTemplate = (data: any) => {
    return <span>{data.label}</span>;
  };

  const handleChange = (event: any) => {
    setSource(sortPermissions(event.source));
    setTarget(sortPermissions(event.target));
  };

  const getAllPermissions = async () => {
    const allPermissions = await adminService.getPermissions();
    const twoGroups = partition(allPermissions, permission => rolePermissions.indexOf(permission.value) === -1);
    
    setSource(sortPermissions(twoGroups[0]));
    setTarget(sortPermissions(twoGroups[1]));
  };
 
  const handleSaveClick = async () => {
    if (!roleName.trim()) {
      setErrorMessage(intl.formatMessage({
        id: 'm-name-is-required',
        defaultMessage: 'Name is required',
      }));
      return;
    }

    const permissions = target.map(permission => permission.value);

    setErrorMessage('');
    setLoading(true);
    try {
      const storeRole = {
        ...role,
        name: roleName,
        permissions,
      };

      if (isEdit) {
        await adminService.updateRole(storeRole);
      } else {
        await adminService.addRole(storeRole);
      }

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
    getAllPermissions();
  }, []);

  return (
    <Dialog className="role-form" header={'Role'} visible={true} onHide={onHide} style={DIALOG_WIDTH}>
      <div className="role-name-row mb-4">
        <label className="tw-mr-4 mb-2"><FormattedMessage id="t-role-name" defaultMessage="Role Name" /></label>
        <input className="p-inputtext" type="text" value={roleName} onChange={e => setRoleName(e.target.value)} disabled={isEdit && role.system} />
      </div>
      <Grid className="roles-management">
        <label className="tw-mr-4 mb-2"><FormattedMessage id="t-permissions" defaultMessage="Permissions" /></label>
        <PickList
          source={source}
          target={target}
          itemTemplate={itemTemplate}
          sourceHeader={intl.formatMessage({
            id: 't-all-permissions',
            defaultMessage: 'All Permissions',
          })}
          targetHeader={intl.formatMessage({
            id: 't-role-permissions',
            defaultMessage: 'Role Permissions',
          })}
          showSourceControls={false}
          showTargetControls={false}
          sourceStyle={PICK_LIST_STYLE}
          targetStyle={PICK_LIST_STYLE}
          onChange={handleChange}
        />
        <Row className="save mt-16 justify-content-center">
          <Col md={3}>
            {isLoading ? (
              <i className="pi pi-spin pi-spinner" style={loadingStyle} />
            ) : (
              <Button label={intl.formatMessage({
                id: 'c-save',
                defaultMessage: 'Save',
              })}
               type="submit" className="btn-positive w-100" onClick={handleSaveClick} />
            )}
          </Col>
          
        </Row>
        <Row>
          <span className={'error-message'}>{errorMessage}</span>
        </Row>
      </Grid>
    </Dialog>
  );
}
