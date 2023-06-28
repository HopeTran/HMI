import { useRef } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';

import CreateOrEditDeliveryAddress from './CreateOrEditDeliveryAddress';

import { useFilterStore, useUser } from 'store/hooks';
import AddressAutoComplete from 'components/common/AddressAutoComplete';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

import locationIcon from 'statics/images/locationIcon.svg';

interface Props {
  onLocationSelected?: any;
  classNames?: string;
}

export default function DeliveryAddressSelector(props: Props) {
  const storesFilter = useFilterStore();
  const user = useUser();
  const op = useRef<any>();
  const dispatch = useDispatch();
  const intl = useIntl();

  const dispatchFilterStore = (filter: any) => {
    const filterValue = {
      ...storesFilter,
      ...filter,
    };

    dispatch({
      type: 'filter_store',
      filter: filterValue,
    });
  };

  const handleClickDeliveryAddressInput = (e: any) => {
    op.current.toggle(e);
  };

  const handleAddressSelected = (addressInfo: any) => {
    dispatchFilterStore({
      deliveryAddress: addressInfo.address,
      latitude: addressInfo.latitude,
      longitude: addressInfo.longitude,
      currency: addressInfo.currency,
    });
  };

  return (
    <>
      {user.status ? (
        <div className="d-flex gap-2 mb-3 mb-md-auto mb-lg-auto">
          <div className="d-flex w-100">
            <div className="locationIcon">
              <img src={locationIcon} alt="" />
            </div>
            <div
              className={`delivery-address-button ${props.classNames ? props.classNames : ''}`}
              onClick={(e: any) => handleClickDeliveryAddressInput(e)}
            >
              <div className="address">
                {
                  storesFilter.deliveryAddress ? storesFilter.deliveryAddress : 'Enter your delivery address'
                }
              </div>
              <i className="pi pi-angle-down pl-4" />
            </div>
          </div>
          <OverlayPanel ref={op}>
            <CreateOrEditDeliveryAddress
              visible={(e) => handleClickDeliveryAddressInput(e)}              
            />
          </OverlayPanel>
        </div>
      ) : (
        <AddressAutoComplete
          placeholder={intl.formatMessage({
            id: 't-enter-your-delivery-address',
            defaultMessage: 'Enter your delivery address',
          })}
          onChange={handleAddressSelected}
          defaultAddress={storesFilter.deliveryAddress}
        />
      )}
    </>
  );
}
