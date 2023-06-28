import { Carousel } from 'primereact/carousel';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isEmpty, keys } from 'lodash';
import { FormattedMessage } from 'react-intl';

import hmiService from 'services/HomeMadeInn';
import StoreItem from '../StoreListing/StoreItem';

export default function FavoriteStores() {
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteStores, setFavoriteStores] = useState<any>({});
  const [storeCarouselNumber, setStoreCarouselNumber] = useState(4)

  const getUserFavoriteStores = async () => {
    setIsLoading(true);
    const data = await hmiService.getFavoriteStores({
      preloads: ['FavoriteStores.PlatformCategories', 'FavoriteStores'],
    });
    setFavoriteStores(groupStoreByCategory(data));
    setIsLoading(false);
  };

  const storeTemplate = (store: any) => {
    return <StoreItem store={store} filterDay={''} onFavoriteChange={getUserFavoriteStores} />;
  };

  useEffect(() => {
    getUserFavoriteStores();
    var w = window.innerWidth;    
    if (w > 992) 
    setStoreCarouselNumber(4)
    if (w < 991 && w > 769)
    setStoreCarouselNumber(3)
    if (w < 768 && w > 576)
    setStoreCarouselNumber(2)
    if (w < 575)
    setStoreCarouselNumber(1)
  }, []);

  return (
    <>
      {!isLoading && !isEmpty(favoriteStores) ? (
        keys(favoriteStores).map((categoryName: string, index: number) => {
          return (
            favoriteStores[categoryName].length > 0 && (
              <div className="row storeListing mb-4" key={index}>
                <div className="d-flex justify-content-between font-bold mb-4">
                  <p>{categoryName}</p>
                  <Link
                    to={`/store-listing/${categoryName}`}
                    className={`font-bold seeAll ${
                      favoriteStores[categoryName].length > storeCarouselNumber ? '' : 'button-disable'
                    }`}
                  >
                    <FormattedMessage id="t-see-all" defaultMessage="See All" />
                  </Link>
                </div>
                <div
                  className={
                    favoriteStores[categoryName].length > storeCarouselNumber
                      ? `col-md-12`
                      : `col-lg-${favoriteStores[categoryName].length * 3} col-md-${favoriteStores[categoryName].length * 4} col-sm-${favoriteStores[categoryName].length * 6} button-disable`
                  }
                >
                  {storeCarouselNumber && 
                    <Carousel
                      value={favoriteStores[categoryName]}
                      itemTemplate={storeTemplate}
                      numVisible={storeCarouselNumber}
                    />
                  }
                </div>
              </div>
            )
          );
        })
      ) : (
        <div> <FormattedMessage id="m-you-don't-have-any-favorite-store" defaultMessage="You don't have any favorite store" /></div>
      )}
    </>
  );
}

const groupStoreByCategory = (stores: any[]) => {
  const d = stores.reduce((groupedData: any, store: any) => {
    store.platformCategories?.forEach((category: any) => {
      if (!groupedData[category.name]) {
        groupedData[category.name] = [];
      }
      groupedData[category.name].push({ ...store, isFavorite: true });
    });
    return groupedData;
  }, {});
  return d;
};
