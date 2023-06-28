import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { find, findIndex, toUpper } from 'lodash';

import HMIService from 'services/HomeMadeInn';
import AdminService from 'services/Admin';
import ConfirmationWithReasonDialog from 'components/common/ConfirmationWithReasonDialog';
import ConfirmationDialog from 'components/common/ConfirmationDialog';
import { STORE_MANAGEMENT_TYPE } from 'constants/admin';
import ActiveStoreDialog from './ActiveStoreDialog';
import { useIntl } from 'react-intl';

interface StoreToolbarProps {
  type: string;
  totalUsers: number;
  // userFilter: any;
  displayedColumns: any[];
  selectedStores: any[];
  onActiveStore: boolean;
  onDismiss: () => void;
  onSuccess?: (event: any) => void;
  onFail?: (event: any) => void;
}

export const STORE_TOOLBAR_ACTIONS = {
  ACTIVE_STORE: 'active',
  INACTIVE_STORE: 'inactive',
  DELETE_STORE: 'delete',
};

export default function StoresToolbar(props: StoreToolbarProps) {
  const [isActiveStoreConfirmVisible, setActiveStoreConfirmVisible] = useState(false);
  const [isInactiveStoreConfirmVisible, setInactiveStoreConfirmVisible] = useState(false);
  const [isDeleteStoreConfirmVisible, setDeleteStoreConfirmVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [roles, setRoles] = useState([]);
  const intl = useIntl();

  const getAllRoles = async () => {
    const allRoles = await AdminService.getRoles();
    setRoles(allRoles)
  }

  const updateRoleUser = (active: boolean, store: any) => {
    const chefRoleId= find(roles, ((role:any) => {return toUpper(role.name) === toUpper('chef')}))._id;
    const chefRoleIndex = findIndex(Object.values(store.roles), ((role:any) => {return role === chefRoleId}))

    if (active) {
      if (chefRoleIndex === -1) {
        AdminService.setUserRoles(
          store.userId,
          Object.values(store.roles).concat(chefRoleId)
        )
      }
    } else {
      if (chefRoleIndex > -1) {
        AdminService.setUserRoles(
          store.userId,
          Object.values(store.roles).splice(chefRoleIndex, 0)
        )
      }          
    }
  }

  const onHandelAcceptActiveOrInactiveStore = async (active: boolean) => {    
    try {
      setIsLoading(true);
      props.selectedStores.map(async (store) => {
        HMIService.updateStores({...store, active}).then((result: any) => {
          if (result) {
            updateRoleUser(active, store);
            handleSaveSuccess({ action: active ? STORE_TOOLBAR_ACTIONS.ACTIVE_STORE : STORE_TOOLBAR_ACTIONS.INACTIVE_STORE});
            props.onDismiss();
          }})
        });
    } catch (e) {
      handleSaveFailed(intl.formatMessage({
        id: 'm-can-not-active-store',
        defaultMessage: 'Can not active store',
      }));
    }
    setActiveStoreConfirmVisible(false);
    setInactiveStoreConfirmVisible(false);
    setIsLoading(false);
  };

  const onHandelAcceptDeleteStores = () => {
    setIsLoading(true);   
    try {
      props.selectedStores.map((store) => {       
        HMIService.deleteStores(store.id);
        updateRoleUser(false, store);
      });
      handleSaveSuccess({ action: STORE_TOOLBAR_ACTIONS.DELETE_STORE });
      props.onDismiss()
    } catch (e) {
      handleSaveFailed(intl.formatMessage({
        id: 'm-can-not-delete-store',
        defaultMessage: 'Can not delete store',
      }));
    }
    setDeleteStoreConfirmVisible(false);
    setIsLoading(false);
  }

  const onHandleShowHideActiveStoreDialog = (status: boolean) => {
    setActiveStoreConfirmVisible(status);
  };

  const onHandleShowHideInactiveStoreDialog = (status: boolean) => {
    setInactiveStoreConfirmVisible(status);
  };

  const onHandleShowHideDeleteStoreDialog = (status: boolean) => {
    setDeleteStoreConfirmVisible(status);
  };

  const handleSaveSuccess = (event: any) => {
    if (props.onSuccess) {
      props.onSuccess(event);
    }
  };

  const handleSaveFailed = (error: string) => {
    if (props.onFail) {
      props.onFail(error);
      setErrorMessage(error);
    }
  };

  const handleActiveDialogHide = () => {
    props.onDismiss()
  }

  useEffect(() => {
    getAllRoles();
  }, [])

  return (
    <div>
      <div className="ban-btn-group d-flex">
        <>
          {props.type === STORE_MANAGEMENT_TYPE.ACTIVE ? (
            <Button
              label={intl.formatMessage({
                id: 't-inactive-stores',
                defaultMessage: 'Inactive Stores',
              })}
              className="ban-users-btn me-2"
              onClick={() => onHandleShowHideInactiveStoreDialog(true)}
              disabled={props.selectedStores.length === 0 || isLoading}
            />
          ) : (
            <Button
              label={intl.formatMessage({
                id: 't-actived-stores',
                defaultMessage: 'Actived Stores',
              })}
              className="ban-users-btn me-2"
              onClick={() => onHandleShowHideActiveStoreDialog(true)}
              disabled={props.selectedStores.length === 0 || isLoading}
            />
          )}

          <Button
            label={intl.formatMessage({
              id: 't-delete-stores',
              defaultMessage: 'Delete Stores',
            })}
            className="unban-users-btn me-2"
            onClick={() => onHandleShowHideDeleteStoreDialog(true)}
            disabled={props.selectedStores.length === 0 || isLoading}
          />
        
        </>
        {/* )} */}
      </div>

      <ConfirmationDialog
        header={intl.formatMessage({
          id: 'm-are-you-sure-to-active-these-stores-?',
          defaultMessage: 'Are you sure to active these stores ?',
        })}
        visible={isActiveStoreConfirmVisible}
        acceptText="Yes"
        dismissText="No"
        onAccept={() => onHandelAcceptActiveOrInactiveStore(true)}
        onDismiss={() => onHandleShowHideActiveStoreDialog(false)}
      />
      <ConfirmationDialog
        header={intl.formatMessage({
          id: 'm-are-you-sure-to-inactive-these-stores-?',
          defaultMessage: 'Are you sure to inactive these stores ?',
        })}
        visible={isInactiveStoreConfirmVisible}
        acceptText="Yes"
        dismissText="No"
        onAccept={() => onHandelAcceptActiveOrInactiveStore(false)}
        onDismiss={() => onHandleShowHideActiveStoreDialog(false)}
      />
      <ConfirmationWithReasonDialog
        header="Confirm"
        message={intl.formatMessage({
          id: 'm-are-you-sure-to-delete-these-stores?',
          defaultMessage: 'Are you sure to delete these stores?',
        })}
        visible={isDeleteStoreConfirmVisible}
        acceptText="Yes"
        dismissText="No"
        onAccept={onHandelAcceptDeleteStores}
        onDismiss={() => onHandleShowHideDeleteStoreDialog(false)}
        defaultReason=""
      />
      <ActiveStoreDialog 
        storeType={props.type}
        visible={props.onActiveStore}
        stores={props.selectedStores}
        errorMessage={errorMessage}
        onAccept={(e) => onHandelAcceptActiveOrInactiveStore(e)}
        onHide={handleActiveDialogHide}
        onDelete={onHandelAcceptDeleteStores}
      />
    </div>
  );
}
