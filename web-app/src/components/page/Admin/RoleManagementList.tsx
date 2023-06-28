import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import React, { useEffect, useState } from 'react';
import { Grid, Row } from 'react-flexbox-grid';
import { isEmpty } from 'lodash';

import Role from '../../../models/role';
import adminService from '../../../services/Admin';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import DataActions from '../../common/DataActions';
import AddOrEditRoleForm from './AddOrEditRoleForm';
import { findObjectByField } from '../../../utilities/common';
import NplTooltip from '../../common/NplTooltip';
import { DataTable } from 'primereact/datatable';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';
const permissionsBodyTemplate = (rowData: any) => {
  const permissions = rowData.permissionLabels;
  const displayPermissions =
    permissions.length > 5 ? `${permissions.slice(0, 5).join(', ')}, ...` : permissions.join(', ');

  return (
    <div className="role-labels">
      <NplTooltip id="permissions-tooltip" place="bottom" type="dark" effect="float" multiline={true} />
      <span data-tip={permissions.join('<br />')} data-for={'permissions-tooltip'}>
        {displayPermissions}
      </span>
    </div>
  );
};

export default function RoleManagementList() {
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionsMap, setPermissionsMap] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>({});
  const [isRoleFormVisible, setRoleFormVisible] = useState(false);
  const [isConfirmDeleteDialogVisible, setConfirmDeleteDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const intl = useIntl();

  const actionBodyTemplate = (rowData: Role) => {
    const handleEditRole = () => {
      setSelectedRole(rowData);
      setIsEdit(true);
      setRoleFormVisible(true);
    };

    const handleDeleteRole = () => {
      setSelectedRole(rowData);
      setConfirmDeleteDialogVisible(true);
    };

    return <DataActions data={rowData} deleteDisabled={rowData.system} onEditClick={handleEditRole} onDeleteClick={handleDeleteRole} />;
  };

  const handleRoleFormHide = () => {
    setRoleFormVisible(false);
  };

  const handleConfirmDeleteDismiss = () => {
    setSelectedRole(null);
    setConfirmDeleteDialogVisible(false);
  };

  const handleConfirmDialogAccept = async () => {
    setErrorMessage('');
    try {
      await adminService.deleteRole(selectedRole._id);
      await getRoles();

      setConfirmDeleteDialogVisible(false);
      setSelectedRole(null);
    } catch (err: any) {
      if (err.response) {
        setErrorMessage(err.response.data.message);
      }
    }
  };

  const handleAddNewClick = () => {
    setIsEdit(false);
    setSelectedRole(new Role());
    setRoleFormVisible(true);
  };

  const getPermissions = async () => {
    const data = await adminService.getPermissions();
    setPermissionsMap(data);
  };

  const getRoles = async () => {
    setIsLoading(true);
    const roles = await adminService.getRoles();

    roles.forEach((role: any) => {
      const permissions = role.permissions || [];
      role.permissionLabels = permissions
        .map(
          (permission: any) =>
            (
              findObjectByField(permissionsMap, 'value', permission) || {
                label: '',
              }
            ).label,
        )
        .filter(Boolean);
    });

    setRoles(roles);
    setIsLoading(false);
  };

  const handleSavingSuccess = async () => {
    setRoleFormVisible(false);
    setSelectedRole(null);
    await getRoles();
  };

  useEffect(() => {
    if (!isEmpty(permissionsMap)) {
      getRoles();
    }
  }, [permissionsMap]);

  useEffect(() => {
    getPermissions();
  }, []);

  return (
    <div className="wrapper container mt-24">
      <Grid className="role-management-list">
        <div className="d-flex justify-content-between align-items-center my-16">
          <h3><FormattedMessage id="t-role-management" defaultMessage="Role Management" /></h3>
          <div className="btn-col my-10">
            <Button label={intl.formatMessage({
        id: 'c-add-new',
        defaultMessage: 'Add New',
      })}  onClick={handleAddNewClick} />
          </div>
        </div>
        <Row className="role-list">
          <DataTable
            value={roles}
            loading={isLoading}
            sortMode="multiple"
          >
            <Column 
            header={intl.formatMessage({
              id: 't-name',
              defaultMessage: 'Name',
            })}  field="name" sortable={true} style={{ width: '150px' }} />
            <Column 
            header={intl.formatMessage({
            id: 't-description-',
            defaultMessage: 'Description',
          })} field="description" sortable={true} style={{ width: '170px' }} />
            <Column
              header={intl.formatMessage({
                id: 't-permission',
                defaultMessage: 'Permission',
              })}
              field="permissions"
              sortable={true}
              className={'permission-labels'}
              body={permissionsBodyTemplate}
            />
            <Column 
            header={intl.formatMessage({
              id: 't-action',
              defaultMessage: 'Action',
            })} body={actionBodyTemplate} style={{ width: '100px' }} />
          </DataTable>
          {isRoleFormVisible && (
            <AddOrEditRoleForm
              role={selectedRole}
              isEdit={isEdit}
              onHide={handleRoleFormHide}
              onSuccess={handleSavingSuccess}
            />
          )}
          <ConfirmationDialog
            header={intl.formatMessage({
              id: 't-confirm',
              defaultMessage: 'Confirm',
            })} 
            visible={isConfirmDeleteDialogVisible}
            acceptText="Yes"
            dismissText="No"
            onAccept={handleConfirmDialogAccept}
            onDismiss={handleConfirmDeleteDismiss}
            message={intl.formatMessage({
              id: 'm-are-you-sure-to-delete-selected-item?',
              defaultMessage: 'Are you sure to delete selected item?',
            })} 
          />
        </Row>
        <Row>
          <span className={'error-message'}>{errorMessage}</span>
        </Row>
      </Grid>
    </div>
  );
}
