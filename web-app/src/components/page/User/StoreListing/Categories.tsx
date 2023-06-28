import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { toLower } from 'lodash';

import Category from 'models/category';
import hmiService from 'services/HomeMadeInn';
import { config } from 'config';

import riceImg from '../../../../statics/images/rice.png';

interface Props {
  onSelectedChange: (e: any) => void;
}

export default function Categories(props: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [platformCategories, setPlatformCategories] = useState<Category[]>([]);

  const getPlatformCategories = async () => {
    setIsLoading(true);
    const platformCategories = await hmiService.getPlatformCategories();

    setPlatformCategories(platformCategories);
    setIsLoading(false);
  };

  useEffect(() => {
    getPlatformCategories();
  }, []);

  return (
    <div className="d-flex justify-content-sm-start justify-content-lg-center category">
      {!isLoading &&
        platformCategories.map((category: any, index: number) => {
          return (
            <NavLink to={`/store-listing/${toLower(category.name)}`} key={index}>
              <div className={`text-center px-3 px-md-4 category-item`}>
                <img
                  src={`${category.icon ? `${config.imageServerUrl}/${category.icon}` : riceImg}`}
                  alt={category.name}
                  className={`productImg mb-4`}
                />
                <p className="font-bold">{category.name}</p>
              </div>
            </NavLink>
          );
        })}
    </div>
  );
}
