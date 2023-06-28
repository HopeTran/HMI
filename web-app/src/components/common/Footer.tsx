import { withRouter, Link, useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import CONSTANTS from 'constants/common';
import { useUser } from 'store/hooks';

import footerLogo from 'statics/images/footerLogo.svg';

const FOOTER_MENUS = [
  {link: '/',  value: 'Become an HMI chef', checkPermission: true},
  {link: '/',  value: 'Amazing meals near me', checkPermission: false},
  {link: '/',  value: 'Sign up to deliver', checkPermission: false},
  {link: '/',  value: 'About HomeMadeInn', checkPermission: false},
  {link: '/',  value: 'Privacy Policy', checkPermission: false},
  {link: '/',  value: 'Terms of use',checkPermission: false},
]

Footer.propTypes = {};

function Footer() {
  const user = useUser();
  const location = useLocation();

  const routes = ['/','/store-listing']
  
  return (
    <>
      {routes.includes(location.pathname) && <div className="section footer-lg bg-viridian-green ">
        <div className="d-lg-flex justify-content-between">
          <div className="footer-content-right mb-4">
            <img src={footerLogo} alt="Footer Logo" className="mb-4" />
            <p className="text-small clr-white-light">
              <FormattedMessage
                id="t-this-site-is-protected-by-"
                defaultMessage="This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply."
              />
            </p>
          </div>
          <div className="row footer-menu">
            {FOOTER_MENUS.map((menu: any) => {
              return !menu.checkPermission ||
                (menu.checkPermission && !user.hasPermission(CONSTANTS.NPL_PERMISSIONS.CHEF)) ? (
                <div className="col-6 mb-3">
                  <Link to={menu.link}>
                    <FormattedMessage
                      id={`t-${menu.value.replace(/\s+/g, '-').toLowerCase()}`}
                      defaultMessage={menu.value}
                    />
                  </Link>
                </div>
              ) : (
                ''
              );
            })}
          </div>
        </div>
        <div className="social-media d-flex">
          <a href="/" target="_blank" className="">
            <span className="facebookIcon social-icon" />
          </a>
          <a href="/" target="_blank" className="">
            <span className="twitterIcon social-icon" />
          </a>
          <a href="/" target="_blank" className="">
            <span className="instagramIcon social-icon" />
          </a>
        </div>
      </div>}
    </>
  );
}

export default withRouter(Footer);
