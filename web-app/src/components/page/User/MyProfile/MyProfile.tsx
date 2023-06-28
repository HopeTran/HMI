import { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { RouteComponentProps } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';

import { useUser } from '../../../../store/hooks';
import ChangePasswordDialog from './ChangePasswordDialog';
import ContactInformation from './ContactInformation';
import AddOrEditStoreDialog from 'components/page/Chef/Store/AddOrEditStoreDialog';

import avatarImg from '../../../../statics/images/avatar.png';
import CONSTANTS from 'constants/common';

const DIALOG_STYLE = { width: '650px' };

export default function MyProfile(props: RouteComponentProps) {
  const user = useUser();
  const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);
  const [chefFormDialogVisible, setChefFormDialogVisible] = useState(false);  
  const intl = useIntl();
  const toast = useRef<Toast>(null);

  const isCheckRoleChef = user.roles.findIndex((role) => {return role.name.toUpperCase() === CONSTANTS.NPL_PERMISSIONS.CHEF.toUpperCase()})

  const handleChangePasswordClick = () => {
    setPasswordDialogVisible(true);
  };

  const handleChangePasswordDialogHide = () => {
    setPasswordDialogVisible(false);
  };

  const handleChangePasswordSuccess = () => {
    setPasswordDialogVisible(false);
  };

  const handleRequestBecomeChefClick = () => {
    setChefFormDialogVisible(true);
  };

  const onHandleDismissStore = () => {
    setChefFormDialogVisible(false);
  };

  const handleStoreInfoSaved = async () => {
    setChefFormDialogVisible(false);
    if (toast.current) {
      toast.current.show({ severity: 'success', summary: 'Store Info Saved', life: 3000 });
    }
  };

  return (
    <>
      <div className="account-container d-md-flex justify-content-between gap-5 w-100">
        <Toast ref={toast} />
        <div className="section-wrapper col-md-4 ">
          <p className="block-title"><FormattedMessage id="t-account-info" defaultMessage="Account Info" /></p>
          <div className="block-wrapper mb-4">
            <div className="mb-4 d-flex">
              <img src={avatarImg} alt="avatar" className="me-4 accountAvatar" />
              <div>
                <p className="clr-dell">{user.firstName}</p>
                <p>{user.email}</p>
              </div>
            </div>
            <Button className="btn-secondary mb-4" onClick={handleChangePasswordClick} 
            label={intl.formatMessage({
        id: 't-change-password',
        defaultMessage: 'Change Password',
      })} />
            <br />
            {isCheckRoleChef === -1 && (
              <Button className="btn-secondary" onClick={handleRequestBecomeChefClick} label= {intl.formatMessage({
                id: 't-become-an-hmi-chef',
                defaultMessage: 'Become an HMI chef',
              })}/>
            )}
          </div>
        </div>
        <div className="w-100">
          <ContactInformation />
        </div>
      </div>
      <ChangePasswordDialog
        visible={passwordDialogVisible}
        style={DIALOG_STYLE}
        user={user}
        onHide={handleChangePasswordDialogHide}
        onSuccess={handleChangePasswordSuccess}
      />
      {!user.hasPermission(CONSTANTS.NPL_PERMISSIONS.CHEF) && (
      <AddOrEditStoreDialog
        onSaved={handleStoreInfoSaved}
        visible={chefFormDialogVisible}
        onDismiss={onHandleDismissStore}
      />
      )}
    </>
  );
}
