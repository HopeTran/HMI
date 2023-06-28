import GooglePlacesAutocomplete, { geocodeByLatLng, geocodeByPlaceId } from 'react-google-places-autocomplete';

import { config } from 'config';
import currencies from '../../statics/currencies.json';
import { useState } from 'react';

import locationIcon from 'statics/images/locationIcon.svg';
interface IAddressAutoCompleteProps {
  className?: string;
  defaultAddress?: string;
  placeholder?: string;
  onChange?: (addressInfo: any) => void;
}

export default function AddressAutoComplete(props: IAddressAutoCompleteProps) {
  const [status, setStatus] = useState('');

  const handleAddressChanged = ({ countryShortName, addressText, latitude, longitude }: any) => {
    if (props.onChange) {
      const country = currencies.find((c: any) => {
        return c.isoAlpha2 === countryShortName;
      });

      props.onChange({
        address: addressText,
        latitude,
        longitude,
        country: country?.name,
        currency: country?.currency?.code.toLowerCase(),
      });
    }
  };

  const handleAddressSelected = (place: any) => {
    geocodeByPlaceId(place?.value?.place_id).then((geocode: any[]) => {
      if (geocode.length > 0) {
        const countryIndex = geocode[0].address_components.findIndex((addressField: any) => {
          return addressField.types.includes('country');
        });
        handleAddressChanged({
          countryShortName: geocode[0].address_components[countryIndex].short_name,
          addressText: place?.label,
          latitude: geocode[0].geometry.location.lat(),
          longitude: geocode[0].geometry.location.lng(),
        });
      }
    });
  };

  const handlePositionButtonClicked = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by your browser');
    } else {
      setStatus('Locating...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (position.coords.latitude && position.coords.longitude) {
            setStatus('');
            geocodeByLatLng({ lat: position.coords.latitude, lng: position.coords.longitude })
              .then((geocode: any[]) => {
                if (geocode.length > 0) {
                  handleAddressChanged({
                    addressText: geocode[0].formatted_address,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  });
                }
              })
              .catch((error) => console.log(error));
          }
        },
        () => {
          setStatus('Unable to retrieve your location');
        },
      );
    }
  };

  return (
    <>
      <div className="d-flex w-100" style={{height : '50px'}}>
        <div className="locationIcon">
          <img src={locationIcon} alt="" onClick={handlePositionButtonClicked} />
        </div>
        <div style={{ float: 'left', width: '100%', minWidth: '260px', height: 'inherit' }}>
          <GooglePlacesAutocomplete
            apiKey={config.googleMapApiKey}
            selectProps={{
              placeholder: props.placeholder || 'Enter address...',
              value:
                props.defaultAddress && props.defaultAddress.length > 0
                  ? { label: props.defaultAddress, value: props.defaultAddress }
                  : undefined,
              onChange: handleAddressSelected,
              styles: {
                control: (provided: any) => ({
                  ...provided,
                  width: props.className ? props.className : '100%',
                  height: '50px',
                  borderRadius: '0 45px 45px 0'
                })
              },
            }}
          />
        </div>
        <div>{status}</div>
      </div>
    </>
  );
}
