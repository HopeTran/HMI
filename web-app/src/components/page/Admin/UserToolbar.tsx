import React, { useState } from 'react';
import { Button } from 'primereact/button';

import AdminService from '../../../services/Admin';
import { USER_MANAGEMENT_TYPE } from '../../../constants/admin';
import CONSTANTS from '../../../constants/common';
import PermissionRequire from '../../common/PermissionRequire';
import ConfirmationWithReasonDialog from '../../common/ConfirmationWithReasonDialog';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import CreateUserDialog from './CreateUser';
import { useIntl } from 'react-intl';
interface UserToolbarProps {
  type: string;
  totalUsers: number;
  userFilter: any;
  displayedColumns: any[];
  selectedUsers: any[];
  onSuccess?: (event: any) => void;
  onFail?: (event: any) => void;
}


export const USER_TOOLBAR_ACTIONS = {
    UNBAN_USER: 'unban-user',
    BAN_USER: 'ban-user',
    CLOSE_USER: 'close-user',
    UPDATE_DISPLAYED_COLUMNS: 'update-displayed-columns',
    UPDATE_REFERRAL: 'update-referral',
  };

export default function UsersToolbar(props: UserToolbarProps) {
  
  const [isCreateUserVisible, setCreateUserVisible] = useState(false);
  const [isBanUsersConfirmVisible, setBanUsersConfirmVisible] = useState(false);
  const [isCloseUsersConfirmVisible, setCloseUsersConfirmVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unableClosedEmails, setUnableClosedEmails] = useState<string[]>([]);
  const [isAlertClosedEmailsShow, setAlertClosedEmailsShow] = useState<boolean>(false);
  const intl = useIntl();

  const onCreateUserClick = () => {
    setCreateUserVisible(true);
  };

  const handleHideCreateUser = () => {
    setCreateUserVisible(false);
  };

  const onConfirmBanUsers = () => {
    setBanUsersConfirmVisible(true);
  };

  const onBannedUsers = async (reason: string) => {
    setIsLoading(true);
    try {
      await AdminService.banUsers(
        props.selectedUsers.map((user) => user._id),
        reason,
      );
      handleSaveSuccess({ action: USER_TOOLBAR_ACTIONS.BAN_USER, data: reason });
    } catch (e) {
      handleSaveFailed(intl.formatMessage({
        id: 'm-can-not-ban-users',
        defaultMessage: 'Can not ban users',
      }));
    }
    setBanUsersConfirmVisible(false);
    setIsLoading(false);
  };

  const onHideConfirmBanUsers = () => {
    setBanUsersConfirmVisible(false);
  };

  const onHideConfirmCloseUsers = () => {
    setCloseUsersConfirmVisible(false);
  };

  const onConfirmCloseUsers = () => {
    setCloseUsersConfirmVisible(true);
  };

  const onCloseUsers = async (reason: string) => {
    setIsLoading(true);
    try {
    } catch (e) {}
    setIsLoading(false);

    setIsLoading(true);
    try {
      const data = await AdminService.closeUsers(
        props.selectedUsers.map((user) => user._id),
        reason,
      );
      if (data.length > 0) {
        setUnableClosedEmails(data);
        setAlertClosedEmailsShow(true);
      }
      handleSaveSuccess({ action: USER_TOOLBAR_ACTIONS.CLOSE_USER, data: reason });
    } catch (e) {
      handleSaveFailed(intl.formatMessage({
        id: 'm-can-not-close-users',
        defaultMessage: 'Can not close users',
      }));
    }
    setCloseUsersConfirmVisible(false);
    setIsLoading(false);
  };

  const onRevokeBanUsers = async () => {
    setIsLoading(true);
    try {
      await AdminService.revokeBanUsers(props.selectedUsers.map((user) => user._id));
      handleSaveSuccess({ action: USER_TOOLBAR_ACTIONS.UNBAN_USER });
    } catch (e) {
      handleSaveFailed(intl.formatMessage({
        id: 'm-can-not-remove-ban-on-users',
        defaultMessage: 'Can not remove ban on users',
      }));
    }
    setIsLoading(false);
  };

  const handleSaveSuccess = (event: any) => {
    if (props.onSuccess) {
      props.onSuccess(event);
    }
  };

  const handleSaveFailed = (error: string) => {
    if (props.onFail) {
      props.onFail(error);
    }
  };

  const handleOKClosedEmail = () => {
    setAlertClosedEmailsShow(false);
  };

  return (
    <div>
      <div className="ban-btn-group d-md-flex d-inline-flex
      ">
        {props.type === USER_MANAGEMENT_TYPE.ACTIVE && (
          <div className="w-100">
            <PermissionRequire permission={CONSTANTS.NPL_PERMISSIONS.CREATE_USER}>
              <Button 
              label={intl.formatMessage({
                id: 't-create-user',
                defaultMessage: 'Create User',
              })} className="create-user-btn me-2 mb-2 col-5 col-md-auto" onClick={onCreateUserClick} />
            </PermissionRequire>

            <PermissionRequire permission={CONSTANTS.NPL_PERMISSIONS.EDIT_USER}>
              <Button
                label={intl.formatMessage({
                  id: 't-ban-users',
                  defaultMessage: 'Ban Users',
                })}
                className="ban-users-btn me-2 mb-2 col-5 col-md-auto"
                onClick={onConfirmBanUsers}
                disabled={props.selectedUsers.length === 0 || isLoading}
              />

              <Button
                label={intl.formatMessage({
                  id: 't-unban-users',
                  defaultMessage: 'Unban Users',
                })}
                className="unban-users-btn me-2 mb-2 col-5 col-md-auto"
                onClick={onRevokeBanUsers}
                disabled={props.selectedUsers.length === 0 || isLoading}
              />

              <Button
                label={intl.formatMessage({
                  id: 't-close-users',
                  defaultMessage: 'Close Users',
                })}
                className="close-users-btn me-2 mb-2 col-5 col-md-auto"
                onClick={onConfirmCloseUsers}
                disabled={props.selectedUsers.length === 0 || isLoading}
              />
              </PermissionRequire>
          </div>
        )}
      </div>
      <CreateUserDialog visible={isCreateUserVisible} onHide={handleHideCreateUser} />

      <ConfirmationWithReasonDialog
        header={intl.formatMessage({
          id: 'm-are-you-sure-to-ban-these-users-?',
          defaultMessage: 'Are you sure to ban these users ?',
        })}
        visible={isBanUsersConfirmVisible}
        acceptText="Yes"
        dismissText="No"
        onAccept={onBannedUsers}
        onDismiss={onHideConfirmBanUsers}
        defaultReason=""
      />
      <ConfirmationWithReasonDialog
        header={intl.formatMessage({
          id: 't-confirm',
          defaultMessage: 'Confirm',
        })}
        message={intl.formatMessage({
          id: 'm-are-you-sure-to-closed-these-users?',
          defaultMessage: 'Are you sure to closed these users?',
        })}
        visible={isCloseUsersConfirmVisible}
        acceptText="Yes"
        dismissText="No"
        onAccept={onCloseUsers}
        onDismiss={onHideConfirmCloseUsers}
        defaultReason=""
      />
      <ConfirmationDialog
        appendTo={document.body}
        header="Alert"
        acceptText="OK"
        messageAlignment="center"
        message={`Unable to close these accounts<br/><small>${unableClosedEmails.join(
          '<br/>',
        )}</small>`}
        visible={isAlertClosedEmailsShow}
        onAccept={handleOKClosedEmail}
      />
    </div>
  );
}
