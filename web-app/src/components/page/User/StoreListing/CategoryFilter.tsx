import { useEffect, useState } from 'react';
import { RadioButton } from 'primereact/radiobutton';
import { Slider } from 'primereact/slider';
import { InputText } from 'primereact/inputtext';
import { Rating } from 'primereact/rating';
import { Dropdown } from 'primereact/dropdown';
import { SelectButton } from 'primereact/selectbutton';
import _, { findIndex } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { Button } from 'primereact/button';

import { DELIVERYTIMERANGES, SORTVALUES, STORE_CURRENCY } from 'constants/common';
import { useFilterStore } from 'store/hooks';
import hmiService from 'services/HomeMadeInn';
import StoresFilter from 'models/storesFilter';

const filterDefaultValue: StoresFilter = new StoresFilter();

interface Props {
  onChange?: any;
  onFilter?: any;
}

export default function CategoryFilter({ onChange, onFilter }: Props) {
  const storesFilter = useFilterStore();
  const [sortValue, setSortValue] = useState(storesFilter.sortValue || filterDefaultValue.sortValue);
  const [availableTime, setAvailableTime] = useState(storesFilter.availableTime || filterDefaultValue.availableTime);
  const [priceRange, setPriceRange] = useState<any>(
    [storesFilter.priceFrom, storesFilter.priceTo] || [filterDefaultValue.priceFrom, filterDefaultValue.priceTo],
  );
  const [ratingValue, setRatingValue] = useState<any>(storesFilter.ratingValue || filterDefaultValue.ratingValue);
  const [cuisineCountry, setCuisineCountry] = useState(storesFilter.cuisines || filterDefaultValue.cuisines);
  const [cuisines, setCuisines] = useState<any[]>([]);
  const [clearAll, setClearAll] = useState(false);
  const [currency, selectedCurrency] = useState();

  const onClearAllFilterToDefault = () => {
    setSortValue(filterDefaultValue.sortValue);
    setAvailableTime(filterDefaultValue.availableTime);
    setPriceRange([filterDefaultValue.priceFrom, filterDefaultValue.priceTo]);
    setRatingValue(filterDefaultValue.ratingValue);
    setCuisineCountry(filterDefaultValue.cuisines);
    setClearAll(true);
  };

  const onSortHandleChange = (e: any) => {
    if (onChange) onChange({ sortValue: e.value });
    setSortValue(e.value);
  };

  const onAvailableTimeHandleChange = (e: any) => {
    const pickedTime = e.value.value.split(/[.,/ -]/);
    if (onChange)
      onChange({
        deliveryEndTime: pickedTime[1],
        deliveryStartTime: pickedTime[0],
      });
    setAvailableTime(e.value);
  };

  const onPriceRangeHandleChange = (e: any) => {
    setPriceRange(e.value);
  };

  const handleKeyUp = (e: any) => {
    if (e.keyCode === 13) {
      if (onChange)
        onChange({
          priceFrom: priceRange[0],
          priceTo: priceRange[1],
        });
    }
  };

  const onPriceRangeHandleEnd = (e: any) => {
    if (onChange)
      onChange({
        priceFrom: priceRange[0],
        priceTo: priceRange[1],
      });
  };

  const onRatingHandleChange = (e: any) => {
    if (onChange) onChange({ rating: e.value });
    setRatingValue(e.value);
  };

  const onCuisineSelectedHandleChange = (e: any) => {
    if (onChange) onChange({ cuisines: e.value });
    setCuisineCountry(e.value);
  };

  const onSelectedCurrency = (e: any) => {
    if (onChange) onChange({ currency: e.value });
    selectedCurrency(e.value);
  };

  const handleFilterButton = () => {
    const pickedTime = availableTime.value.split(/[.,/ -]/);
    onFilter({
      sortValue: sortValue,
      deliveryEndTime: pickedTime[1],
      deliveryStartTime: pickedTime[0],
      priceFrom: priceRange[0],
      priceTo: priceRange[1],
      rating: ratingValue,
      cuisines: cuisineCountry,
      currency: currency,
    });
  };

  // const onNotContainIngredientHandleChange = (e: any) => {
  //   dispatchValue({ notIngredient: e.value });
  //   setNotContainIngredient(e.value);
  // };

  // useEffect(() => {
  //   if (getfilterStoreLocal && getfilterStoreLocal.length > 0) {
  //     dispatchValue(JSON.parse(getfilterStoreLocal));
  //   }
  // }, []);

  useEffect(() => {
    if (clearAll) {
      onChange(new StoresFilter());
      setClearAll(false);
    }
  }, [clearAll]);

  useEffect(() => {
    if (storesFilter && !_.isEmpty(storesFilter)) {
      const deliveryTime = `${storesFilter.deliveryStartTime}-${storesFilter.deliveryEndTime}`;
      const findAvailableTimeIndex = findIndex(DELIVERYTIMERANGES, { value: deliveryTime });
      if (findAvailableTimeIndex > -1) {
        setAvailableTime(DELIVERYTIMERANGES[findAvailableTimeIndex]);
      }
    }
    selectedCurrency(storesFilter.currency);
  }, [storesFilter]);

  useEffect(() => {
    const fetchCuisines = async () => {
      const data = await hmiService.getCuisines();
      setCuisines(
        data.map((item: any) => {
          return { label: item.name, value: item.id };
        }),
      );
    };
    fetchCuisines();
  }, []);

  return (
    <div className="category-filter">
      <p className="font-bold d-lg-inline-block d-md-none mb-4 mt-4">
        <FormattedMessage id="t-store-filter" defaultMessage="Store Filter" />
      </p>
      <p className="font-bold clr-green mb-4 cursor-pointer" onClick={onClearAllFilterToDefault}>
        <FormattedMessage id="t-reset-all" defaultMessage="Reset All" />
      </p>
      <div>
        <div className="mb-4">
          <div className="mb-4">
            <p className="clr-dell font-bold">
              <FormattedMessage id="t-sort" defaultMessage="Sort" />
            </p>
            {SORTVALUES.map((item: any) => {
              return (
                <div key={item.value} className="field-radiobutton">
                  <RadioButton
                    inputId={item.value}
                    value={item}
                    name="sort"
                    onChange={onSortHandleChange}
                    checked={sortValue.value === item.value}
                  />
                  <label htmlFor={item.value}>{item.label}</label>
                </div>
              );
            })}
          </div>
          <p className="clr-dell font-bold">
            <FormattedMessage id="t-available-between" defaultMessage="Available between" />
          </p>
          {DELIVERYTIMERANGES.map((item: any) => {
            return (
              <div key={item.value} className="field-radiobutton">
                <RadioButton
                  inputId={item.value}
                  value={item}
                  name="availableTime"
                  onChange={onAvailableTimeHandleChange}
                  checked={availableTime.value === item.value}
                />
                <label htmlFor={item.value}>{item.label}</label>
              </div>
            );
          })}
        </div>
        <div className="mb-4">
          <p className="clr-dell font-bold">
            <FormattedMessage id="t-price-range" defaultMessage="Price range" />
          </p>
          <div className="d-flex justify-content-between gap-2 mb-4">
            <Dropdown
              value={currency}
              options={STORE_CURRENCY}
              onChange={onSelectedCurrency}
              optionLabel="label"
              placeholder="Currency"
            />
            <InputText
              value={priceRange[0]}
              onChange={(e: any) => setPriceRange([e.target.value, priceRange[1]])}
              onBlur={onPriceRangeHandleEnd}
              onKeyUp={handleKeyUp}
            />
            <InputText
              value={priceRange[1]}
              onChange={(e: any) => setPriceRange([priceRange[0], e.target.value])}
              onBlur={onPriceRangeHandleEnd}
              onKeyUp={handleKeyUp}
            />
          </div>
          <Slider
            value={priceRange}
            min={0}
            max={filterDefaultValue.priceTo}
            range
            onChange={onPriceRangeHandleChange}
            onSlideEnd={onPriceRangeHandleEnd}
          />
        </div>
        <div className="my-4">
          <p className="clr-dell font-bold">
            <FormattedMessage id="t-rating" defaultMessage="Rating" />
          </p>
          <Rating value={ratingValue} onChange={onRatingHandleChange} cancel={true} />
        </div>
        <div className="mb-4">
          <p className="clr-dell font-bold">
            <FormattedMessage id="t-cuisine" defaultMessage="Cuisine" />
          </p>
          <SelectButton value={cuisineCountry} options={cuisines} onChange={onCuisineSelectedHandleChange} multiple />
        </div>
        {/* <div className="mb-4">
          <p className="clr-dell font-bold">Does not contain</p>
          <SelectButton
            value={notContainIngredient}
            options={INGREDIENTS}
            onChange={onNotContainIngredientHandleChange}
            multiple
          />
        </div> */}
      </div>
      <div className="d-lg-none">
        <Button style={{ borderRadius: '45px' }} className="p-default" onClick={handleFilterButton} label="Filter" />
      </div>
    </div>
  );
}
