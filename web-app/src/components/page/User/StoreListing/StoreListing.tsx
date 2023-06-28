import { findIndex, uniqBy, upperCase } from 'lodash';
import { Carousel } from 'primereact/carousel';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import Category from 'models/category';
import hmiService from 'services/HomeMadeInn';
import { useFilterStore, useUser } from 'store/hooks';
import StoreItem from './StoreItem';

interface Props {
  selectedCategory: string;
}

export default function StoreListing(props: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [platformCategories, setPlatformCategories] = useState<Category[]>([]);
  // const [filters, setFilters] = useState<any>({});
  const [favoriteStores, setFavoriteStores] = useState<any[]>([]);
  const [storeCarouselNumber, setStoreCarouselNumber] = useState(4);
  const [width, setWidth] = useState(window.innerWidth);

  const responsiveOptions = [
    {
      breakpoint: '992px',
      numVisible: 3,
      numScroll: 3,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 2,
    },
    {
      breakpoint: '576px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  const storesFilter = useFilterStore();
  const user = useUser();

  //Get paltform categories with filters
  const getPlatformCategories = async (filters: any) => {
    let _platformCats = [];

    const searchData = {
      ...filters,
      weekDay: filters.weekDay && upperCase(filters.weekDay),
      name: props.selectedCategory,
    };

    if (searchData.weekDay) {
      const platformCategories = await hmiService.getPlatformCategories(searchData);
      setIsLoading(true);

      if (platformCategories.length > 0) {
        if (props.selectedCategory.length > 0) {
          const catIndex = findIndex(platformCategories, { name: props.selectedCategory });
          if (catIndex > -1) {
            _platformCats = [platformCategories[catIndex]];
          }
        } else {
          _platformCats = platformCategories;
        }
      }
      setPlatformCategories(_platformCats);
      setIsLoading(false);
    }
  };

  const getUserFavoriteStores = async () => {
    if (user.token) {
      const data = await hmiService.getFavoriteStores({ preloads: 'FavoriteStores' });
      setFavoriteStores(data);
    }
  };

  const storeTemplate = (store: any) => {
    return (
      <StoreItem
        store={updateFavoriteStore(store, favoriteStores)}
        filterDay={storesFilter.weekDay}
        onFavoriteChange={getUserFavoriteStores}
      />
    );
  };

  //Parse intial filters data
  useEffect(() => {
    if (storesFilter) {
      getPlatformCategories(storesFilter);
    }
  }, [storesFilter]);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  useEffect(() => {
    getUserFavoriteStores();
    var w = width;
    if (w > 992) setStoreCarouselNumber(4);
    if (w <= 992 && w > 769) setStoreCarouselNumber(3);
    if (w <= 769 && w > 576) setStoreCarouselNumber(2);
    if (w <= 576) setStoreCarouselNumber(1);
  }, [width]);

  return (
    <>
      {!props.selectedCategory &&
        !isLoading &&
        platformCategories.map((cat: any, index: number) => {
          return (
            cat?.stores?.length > 0 && (
              <div className="row storeListing mb-4" key={index}>
                <div className="d-flex justify-content-between align-items-center font-bold mb-4 mt-1">
                  <span>{cat.name}</span>
                  <span>
                    <Link
                      to={`/store-listing/${cat.name}`}
                      className={`font-bold seeAll ${cat.stores.length > storeCarouselNumber ? '' : 'button-disable'}`}
                    >
                      <FormattedMessage id="t-see-all" defaultMessage="See All" />
                    </Link>
                  </span>
                </div>
                <div
                  className={
                    cat.stores.length > storeCarouselNumber
                      ? `col-12`
                      : cat.stores.length === storeCarouselNumber
                      ? `col-12 button-disable`
                      : `col-12 col-sm-${cat.stores.length * 6} col-md-${cat.stores.length * 4} col-lg-${cat.stores.length * 3} button-disable`
                  }
                > {storeCarouselNumber && 
                    <Carousel value={cat.stores} itemTemplate={storeTemplate} numVisible={storeCarouselNumber} responsiveOptions ={responsiveOptions}/>
                  }
                </div>
              </div>
            )
          );
        })}
      {/* All stores */}
      {getDistinctStores(platformCategories).length > 0 ? (
        <>
          {!props.selectedCategory && (
            <div className="row mb-4 storeListing all-kitchen">
              <div className="d-flex justify-content-between font-bold mb-4">
                <p><FormattedMessage id="t-all-kitchen-chef" defaultMessage="All Kitchen/ Chef" /></p>
              </div>
              {!isLoading &&
                getDistinctStores(platformCategories)?.map((store: any, index: number) => {
                  return (
                    <div className="col-12 col-sm-6 col-md-4 mb-4" key={index}>
                      <StoreItem
                        store={updateFavoriteStore(store, favoriteStores)}
                        filterDay={storesFilter?.weekDay}
                        onFavoriteChange={getUserFavoriteStores}
                      />
                    </div>
                  );
                })}
            </div>
          )}
        </>
      ) : (
        <div className="mb-4">
          <p className="px-4"><FormattedMessage id="t-no-store-available" defaultMessage="No Store Available" /></p>
        </div>
      )}

      {props.selectedCategory && (
        <div className="row mb-4 storeListing ">
          {!isLoading &&
            platformCategories?.length > 0 &&
            platformCategories.map((cat: any) => {
              return cat.stores?.map((store: any, index: number) => {
                return (
                  <div className="col-md-4 mb-4" key={index}>
                    <StoreItem
                      store={updateFavoriteStore(store, favoriteStores)}
                      filterDay={storesFilter?.weekDay}
                      onFavoriteChange={getUserFavoriteStores}
                    />
                  </div>
                );
              });
            })}
        </div>
      )}
    </>
  );
}

const getDistinctStores = (categories: any[]) => {
  const stores: any[] = [];
  categories?.forEach((category: any) => {
    if (category.stores && category.stores.length > 0) {
      stores.push(...category.stores);
    }
  });
  return uniqBy(stores, 'id')?.sort((a: any, b: any) => {
    if (a.ratingScore && b.ratingScore) {
      if (a.ratingScore > b.ratingScore) {
        return -1;
      } else if (a.ratingScore < b.ratingScore) {
        return 1;
      } else return 0;
    } else {
      if (a.ratingScore) {
        return -1;
      } else if (b.ratingScore) {
        return 1;
      }
    }
    return 0;
  });
};

const updateFavoriteStore = (store: any, userFavoriteStores: any[]) => {
  const favStore = userFavoriteStores?.find((st: any) => st.id === store.id);
  store.isFavorite = favStore ? true : false;
  return store;
};
