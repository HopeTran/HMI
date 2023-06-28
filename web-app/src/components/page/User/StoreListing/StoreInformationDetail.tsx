import { useEffect, useState } from 'react';
import { RouteComponentProps, useParams } from 'react-router-dom';

import Store from 'models/store';
import hmiService from 'services/HomeMadeInn';
import StoreMenuCategory from './StoreMenuCategory';
import { config } from 'config';
import ViewMoreStoreInformationDialog from 'components/common/ViewMoreStoreInformationDialog ';
import CONSTANTS, { WEEKDAYS } from 'constants/common';
import { setItemLocalStorage } from 'utilities/common';
import { useFilterStore, useUser } from 'store/hooks';
import FavoriteButton from 'components/common/FavoriteButton';

import storeLogoDefault from '../../../../statics/images/store-logo-default.jpg';
import ratingIcon from '../../../../statics/images/ratingIcon.svg';
import locationIcon from '../../../../statics/images/location-green.png';
import storeBackgroundDefault from '../../../../statics/images/store-bg-default.png';
import './StoreListing.scss';

export default function StoreInformationDetail(props: RouteComponentProps) {
  const [storeInfo, setStoreInfo] = useState<Store>();
  const [storeInfoLocal, setStoreInfoLocal] = useState<any>();
  const [isConfirmOrderDialogVisible, setIsConfirmOrderDialogVisible] = useState(false);

  const { storeId }: any = useParams();
  const { filter } = useFilterStore();

  const storeLocalStorage = localStorage.getItem(CONSTANTS.STORAGE_KEY.STORE_INFO);
  const user = useUser();
  const getStoreInformation = async (storeId: any) => {
    let filterParams = { ...filter, preloads: ['Cuisines'], favoriteUserIds: [user?._id] };
    if (!filterParams?.weekDay) {
      filterParams = {
        ...filterParams,
        weekDay: WEEKDAYS[new Date().getDay()].value,
      };
    }
    const storeInformation = await hmiService.getStoreById(storeId, filterParams);
    if (
      storeInformation?.favoriteUsers &&
      storeInformation?.favoriteUsers.length > 0 &&
      storeInformation?.favoriteUsers[0].id === user?._id
    ) {
      storeInformation.isFavorite = true;
    }
    setStoreInfo(storeInformation);
  };

  const onHandleViewMoreStoreInformation = () => {
    setIsConfirmOrderDialogVisible(true);
  };

  const onHandleViewMoreStoreDismiss = () => {
    setIsConfirmOrderDialogVisible(false);
  };

  const handleFavoriteChanged = () => {
    getStoreInformation(storeId);
  };

  const checkStore = () => {
    let storeLocal;

    if (storeInfo) {
      const _storeInfo = {
        id: storeInfo.id,
        name: storeInfo.name,
        logo: storeInfo.logo,
        photo: storeInfo.photo,
        currency: storeInfo.currency,
      };
      if (storeLocalStorage !== 'undefined' && storeLocalStorage) {
        storeLocal = JSON.parse(storeLocalStorage);
        if (storeLocal.id !== storeId) {
          setStoreInfoLocal(_storeInfo);
        }
      } else {
        setStoreInfoLocal(_storeInfo);
        setItemLocalStorage(CONSTANTS.STORAGE_KEY.STORE_INFO, _storeInfo);
      }
    }
  };

  useEffect(() => {
    getStoreInformation(storeId);
  }, [storeId, filter]);

  useEffect(() => {
    checkStore();
  }, [storeInfo]);

  return (
    <div className="content-wrapper">
      
      {storeInfo && (
        <div
          className="storeInformationDetail d-flex"
          style={{
            backgroundImage: `url(${
              storeInfo.photo ? `${config.imageServerUrl}/${storeInfo.photo}` : storeBackgroundDefault
            })`,
          }}
        >
          <div className="store-information-wrapper section d-lg-flex justify-content-between align-items-end w-100">
            <div className="clr-white">
              <div className="d-flex mb-3">
                <img
                  className="me-3"
                  src={storeInfo.logo ? `${config.imageServerUrl}/${storeInfo.logo}` : storeLogoDefault}
                  width={50}
                  height={50}
                  alt="Store logo"
                />
                <div>
                  <h3>{storeInfo.name}</h3>
                  <p>{storeInfo.name}</p>
                </div>
              </div>
              <div className="d-flex align-items-center pb-4">
                {storeInfo.ratingScore && (
                  <div className="rating d-flex align-items-center pr-12">
                    <img src={ratingIcon} alt="ratingIcon" className="me-1" />
                    <span className="font-bold">{storeInfo.ratingScore}</span>
                  </div>
                )}
                <FavoriteButton store={storeInfo} onFavoriteChange={handleFavoriteChanged} />
              </div>

              <div className="platform-category-list">
                {storeInfo.platformCategories.length > 0 &&
                  storeInfo.platformCategories.map((item: any, index: number) => {
                    return (
                      <span className="me-3" key={index}>
                        {item.name}
                      </span>
                    );
                  })}
              </div>
              <div className="platform-category-list mt-4">
                {storeInfo.cuisines?.length > 0 &&
                  storeInfo.cuisines.map((item: any, index: number) => {
                    return (
                      <span className="me-3" key={index}>
                        {item.name}
                      </span>
                    );
                  })}
              </div>
            </div>
            <div className="mt-4 pt-4 mt-md-0 pt-lg-0">
              <div className="location d-flex justify-content-between">
                <div className="d-flex">
                  <img src={locationIcon} alt="locationIcon" className="me-2" />
                  <span className="me-4 text-overflow-1-v">
                    {storeInfo.address}, {storeInfo.countryCode}
                  </span>
                </div>
                <span onClick={onHandleViewMoreStoreInformation} className="link-hover d-flex">
                  View more
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="storeMenuCategory">
        <StoreMenuCategory categories={storeInfo && storeInfo.categories} storeInfo={storeInfoLocal} />
      </div>
      <div>
        <ViewMoreStoreInformationDialog
          header="Confirm"
          visible={isConfirmOrderDialogVisible}
          onAccept={onHandleViewMoreStoreDismiss}
          onDismiss={onHandleViewMoreStoreDismiss}
          message="Are you sure to delete selected item?"
          storeInfo={storeInfo}
        />
      </div>
    </div>
  );
}
