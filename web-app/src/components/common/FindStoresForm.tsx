import { findIndex } from 'lodash';
import { useHistory } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useState } from 'react';

import DeliveryTimeDropdown from './DeliveryTimeDropdown';
import hmiService from 'services/HomeMadeInn';
import { useFilterStore } from 'store/hooks';
import DeliveryAddressSelector from './DeliveryAddressSelector';

export default function FindStoresForm() {
  const [locationSelected, setLocationSelected] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const storesFilter = useFilterStore();
  const history = useHistory();

  const onHandleClickFindMeal = async () => {
    setErrMessage('');
    if (locationSelected || storesFilter.deliveryAddress.length > 0) {
      const platformCategories = await hmiService.getPlatformCategories(storesFilter);
      const findStoreIndex = findIndex(platformCategories, (cat: any) => {
        return cat.stores && cat.stores.length > 0;
      });
      if (findStoreIndex > -1) {
        history.push('/store-listing');
      } else {
        setErrMessage(
          `Sorry, we’re not available here or this time. Please choose another delivery address or pick another time.`,
        );
      }
    } else {
      setErrMessage('Please choose a delivery address.');
    }
  };

  const onLocationSelected = (selected: boolean) => {
    setLocationSelected(selected);
  };

  return (
    <>
      <div className="d-inline-block d-lg-flex gap-2 col-12">
        <DeliveryAddressSelector onLocationSelected={onLocationSelected} />
        <div className="d-flex gap-2 w-100 mt-3 mt-lg-0">
          <DeliveryTimeDropdown />
          <Button className="findMeal" label="Find Meal" onClick={onHandleClickFindMeal} />
        </div>
      </div>
      {errMessage && <div className="pt-2"><span className="p-invalid clr-red">{errMessage}</span></div>}
    </>
  );
}
