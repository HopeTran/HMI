import React from 'react';
import { Button } from 'react-bootstrap';
import { Link, RouteComponentProps } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import FindStoresForm from 'components/common/FindStoresForm';
import { useUser } from 'store/hooks';
import CONSTANTS from 'constants/common';
import Footer from 'components/common/Footer';

import howHMIWork1 from 'statics/images/Order-illustration.png';
import howHMIWork2 from 'statics/images/Safe-Food.png';
import howHMIWork3 from 'statics/images/Tracking-Maps.png';

export default function Landing(props: RouteComponentProps) {
  const user = useUser();

  return (
    <div>
      <div className="hero-section bg-landing">
        <div className="content-ld">
          <div className="hero-content-01">
            <p className="huge clr-everglade-light">
              <FormattedMessage id="p-delicious" defaultMessage="Delicious" />.
            </p>
            <p className="clr-mine-shaft-light first-heroText">
              <FormattedMessage id="p-party-meal" defaultMessage="Party meal, private kitchen or home chef" /> ?!
            </p>
          </div>
          <div className="mb-4">
            <p className="clr-mine-shaft italic second-heroText">
              <FormattedMessage
                id="p-start-your-order-"
                defaultMessage="Start your order by entering your address below"
              />
            </p>
            <div className="mt-2 mt-lg-4 mb-4">
              <FindStoresForm />
            </div>
            <p className="mb-2">
              <span className="clr-olive-drab underline font-bold">
                <Link to="/login">
                  <FormattedMessage id="c-login" defaultMessage="Login" />
                </Link>
              </span>{' or '}
              <span>
                <Link to="/register">
                  <FormattedMessage id="p-become-an-hmi-member" defaultMessage="Become an HMI member" />
                </Link>
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="section bg-viridian-green-light text-center">
        <h1 className="clr-white mb-4 d-inline-block">
          <FormattedMessage id="t-how-homemadeinn-works" defaultMessage="How HomeMadeInn works" />
        </h1>
        <div className="d-lg-flex d-justify-content-between gap-5 mt-4">
          <div className="py-4">
            <img src={howHMIWork1} alt="work01" className="mb-4" />
            <p className="text-large clr-everglade mt-4">
              <FormattedMessage id="t-find-the-meal-your-want" defaultMessage="Find the meal your want" />
            </p>
            <p className="clr-white">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida
              dolor sit amet lacus acc
            </p>
          </div>
          <div className="py-4">
            <img src={howHMIWork2} alt="work01" className="mb-4" />
            <p className="text-large clr-everglade mt-4">
              <FormattedMessage id="t-deliver-your-meal" defaultMessage="Deliver your meal" />
            </p>
            <p className="clr-white">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida
              dolor sit amet lacus acc
            </p>
          </div>
          <div className="py-4">
            <img src={howHMIWork3} alt="work01" className="mb-4" />
            <p className="text-large clr-everglade mt-4">
              <FormattedMessage id="t-enjoy-the-meal" defaultMessage="Enjoy the meal" />
            </p>
            <p className="clr-white">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida
              dolor sit amet lacus acc
            </p>
          </div>
        </div>
      </div>
      <div className="section howHMIWork">
        <div className="huge clr-white mb-4">
          <FormattedMessage id="t-your-kitchen" defaultMessage="Your kitchen" />
          ,
          <br /> <FormattedMessage id="t-gourmet-factory" defaultMessage="Gourmet Factory" />
        </div>
        {!user.hasPermission(CONSTANTS.NPL_PERMISSIONS.CHEF) && (
          <Link to="/store/register">
            <Button className="btn-default text-xlarge-bold">
              <FormattedMessage id="t-become-an-hmi-chef" defaultMessage="Become an HMI chef" /> &gt;
            </Button>
          </Link>
        )}
      </div>
      <Footer />
    </div>
  );
}
