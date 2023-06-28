import { NavLink } from 'react-router-dom';
import { ROUTES } from 'constants/constant';
import { useUser } from 'store/hooks';
import { useRef } from 'react';

import { OverlayPanel } from 'primereact/overlaypanel';
import AccountProfilePopup from 'components/page/User/AccountInfo/AccountProfilePopup';

import accountIcon from '../../statics/images/accountIcon.svg';
import { FormattedMessage } from 'react-intl';
export default function UserInfoTemplate() {
  const accountOpRef = useRef<OverlayPanel>(null);
  const user = useUser();
  const handleAccountProfileClick = (e: any) => {
    if (accountOpRef && accountOpRef.current) {
      accountOpRef.current.toggle(e, null);
    }
  };
  return (
    <div className="tw-flex tw-justify-between tw-items-center tw-mb-4 tw-px-4">
      <div>
        {(!user || !user.token) && (
          <div>
            <NavLink to={ROUTES.LOGIN} className="btn-header">
              <p><FormattedMessage id="c-login" defaultMessage="Log in" /></p>
            </NavLink>
          </div>
        )}
        {user.token && (
          <div className="tw-justify-self-end account">
            <div onClick={handleAccountProfileClick} className='d-flex align-items-center cursor-pointer gap-2'>
              <img src={accountIcon} alt="accountIcon" className='me-sm-2'/>
              <span className='clr-green-house font-bold cursor-pointer d-flex align-items-center' id="username">
                <span className="username">{user.username.length > 7 ? user.username.substr(0, 7) + '..' : user.username}</span>
                <i className="pi pi-angle-down pl-2"></i>
              </span>
              <OverlayPanel ref={accountOpRef} className="account-profile-op">
                <AccountProfilePopup />
              </OverlayPanel>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}