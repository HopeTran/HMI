import { useIntl } from "react-intl";

import { config } from "config";
import { redirectToLink } from "utilities/common";

import fbIcon from 'statics/images/icons/facebook.png';
import ggIcon from 'statics/images/icons/google.png';

export default function LoginSocialButtons() {
  const intl = useIntl();

  const handleFbIconClick = () => {
    handleSocialClick('facebook');
  };

  const handleGgIconClick = () => {
    handleSocialClick('google');
  };
  
  const handleSocialClick = (provider: string) => {
    redirectToLink(`${config.apiServerUrl}/social/login/${provider}`);
  };
  
  return (
    <div className="other-logins fsi-14">
      <div className="text-h5">
        {intl.formatMessage({
          id: 'login.or_sign_in_with',
          defaultMessage: 'Or log in with',
        })}
      </div>
      <div className="d-flex justify-content-center">
        <img className="fb-icon" src={fbIcon} onClick={handleFbIconClick} alt="" />
        <img src={ggIcon} onClick={handleGgIconClick} alt="" />
      </div>
    </div>
  );
};