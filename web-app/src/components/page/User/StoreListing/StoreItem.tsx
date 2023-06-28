import { config } from 'config';
import moment from 'moment';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import FavoriteButton from 'components/common/FavoriteButton';
import { roundUpNumberByDecimalNumber } from 'utilities/common';

import storePhotoDefault from 'statics/images/store-logo-default.png';
import locationIcon from 'statics/images/location.png';
import storeLogoDefault from 'statics/images/store-logo-default.jpg';
import clockIcon from 'statics/images/clockIcon.svg';
import ratingIcon from 'statics/images/ratingIcon.svg';

interface StoreProps extends RouteComponentProps {
  store: any;
  filterDay: string;
  onFavoriteChange: (value: boolean) => void;
}

function StoreItem({ store, filterDay, history, onFavoriteChange }: StoreProps) {
  const handleStoreClick = (e: any) => {
    if (e.target.id !== 'favorite') {
      history.push(`/store-info/${store.id}`);
    }
  };

  return (
    <div className="px-2 px-md-4 storeItem">
      <div onClick={handleStoreClick} className="cursor-pointer">
        <div className="mb-3">
          <div className="bg-product">
            {store.photo && store.photo !== '' ? (
              <img
                className="img-preview w-100"
                src={`${config.imageServerUrl}/${store.photo}`}
                alt="Store background"
              />
            ) : (
              <img className="img-preview w-100" src={storePhotoDefault} alt="Store background" />
            )}
          </div>
          <span className="location">
            <img src={locationIcon} alt="locationIcon" className="me-2" /> {roundUpNumberByDecimalNumber(store?.totalKm, 2)} km (s)
          </span>
          <FavoriteButton store={store} onFavoriteChange={onFavoriteChange} />
        </div>
        <div className="d-flex justify-content-between mb-3">
          <div className="rating d-flex align-items-center">
            {store.ratingScore && (
              <>
                <img src={ratingIcon} alt="ratingIcon" className="me-1" />
                <span className="font-bold">{store.ratingScore}</span>
              </>
            )}
          </div>
          <div className="openingTime d-flex align-items-center">
            <img src={clockIcon} alt="clock" className="me-1" />
            <span>{getOperatingTimeByFilterTime(store, filterDay)}</span>
          </div>
        </div>
        <div className="d-flex align-items-center mb-4">
          {store.logo && store.logo !== '' ? (
            <img className="me-2" src={`${config.imageServerUrl}/${store.logo}`} width={30} alt="Store logo" />
          ) : (
            <img className="me-2" src={storeLogoDefault} width={30} alt="Store logo" />
          )}
          <span className="font-bold">{store.name}</span>
        </div>
      </div>
    </div>
  );
}

export default withRouter(StoreItem);

const getOperatingTimeByFilterTime = (store: any, filters: any) => {
  const currentDay = moment().format('ddd');
  const operatingTime = store?.operationTimes?.find(
    (item: any) =>
      (filters.weekDay && item.weekDay === filters.weekDay?.toUpperCase()) || item.weekDay === currentDay.toUpperCase(),
  );
  if (operatingTime) {
    return `${moment(operatingTime?.availableFrom, 'HH:mm:ss').format('LT')} - ${moment(
      operatingTime?.availableTo,
      'HH:mm:ss',
    ).format('LT')}`;
  } else {
    return `${moment('09:00:00', 'HH:mm:ss').format('LT')} - ${moment('12:00:00', 'HH:mm:ss').format('LT')}`;
  }
};
