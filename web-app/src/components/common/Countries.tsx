import { find } from 'lodash';
import { City }  from 'country-state-city';

import countriesList from '../../statics/countries.json';

function phoneCodeList() {
  const countryPhoneCode = countriesList?.map((item: any) => {
    const country = item.dial_code +' '+ item.name;
    return {label: country, value: item.dial_code}
  })
  return countryPhoneCode;
}

function getCountryOptions() {
  const countries = countriesList.map((item: any) => {
    const country = item.name;
    return {label: country, value: country}
  })
  return countries;
}

function getPhoneCodeByCountryName(countryName: any) {
  if (countryName) {
    const getPhoneCode = find(countriesList, {'name': countryName});
    return getPhoneCode;
  }
}

function getCitiesByCountryName(countryName: any) {
  if (countryName) {
    const getCountryCode = find(countriesList, {'name': countryName});
    if (getCountryCode) {
      const cities = City.getCitiesOfCountry(getCountryCode?.code);
      const cityList = cities?.map((item: any) => {
        const city = item.name ;
        return {label: city, value: city}
      })
      return cityList
    }
  }
}

function getCitiesByCountryCode(selectedCountryCode: any) {
  if (selectedCountryCode) {
    const getCountryCode = find(countriesList, {'dial_code': selectedCountryCode});
    if (getCountryCode) {
      const cities = City.getCitiesOfCountry(getCountryCode?.code);
      const cityList = cities?.map((item: any) => {
        const city = item.name ;
        return {label: city, value: city}
      })
      return cityList
    }
  }
}

function getDialCodeByCountryName(selectedCountryName: any) {
  if (selectedCountryName) {
    const getPhoneCode = find(countriesList, {'name': selectedCountryName});
    if (getPhoneCode) {
      return getPhoneCode.dial_code;
    }
  }
}

function getCountryByDialCode(selectedCountryCode: any) {
  if (selectedCountryCode) {
    const getCountry = find(countriesList, {'dial_code': selectedCountryCode});
    if (getCountry) {
      return getCountry.name;
    }
  }
}


export {
  phoneCodeList,
  getCountryOptions,
  getPhoneCodeByCountryName,
  getCitiesByCountryName,
  getCitiesByCountryCode,
  getDialCodeByCountryName,
  getCountryByDialCode
}