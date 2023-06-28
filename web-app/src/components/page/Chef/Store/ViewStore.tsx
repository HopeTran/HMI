import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import hmiService from 'services/HomeMadeInn';
import Store from 'models/store';
import { WEEKDAYS } from 'constants/common';
import { config } from 'config';
import AddOrEditStoreDialog from './AddOrEditStoreDialog';
import { useUser } from 'store/hooks';
import { FormattedMessage } from 'react-intl';

export default function ViewStore(props: RouteComponentProps) {
  const [store, setStore] = useState<Store>();
  const [photoURL, setPhotoURL] = useState('');
  const [visibleEdit, setVisibleEdit] = useState(false);
  const toast = useRef<Toast>(null);

  const user = useUser();

  const handleStoreInfoSaved = async () => {
    setVisibleEdit(false);
    await getStore();
    if (toast.current) {
      toast.current.show({ severity: 'success', summary: 'Store Info Saved', life: 3000 });
    }
  };

  const getStore = async () => {
    try {
      const store = await hmiService.getStoreById(user.storeId);
      setStore(store);
      setPhotoURL(store.photo);
    } catch (error) {
      console.debug(error);
    }
  };

  const onHandleDismissStore = () => {
    setVisibleEdit(false)
  };

  useEffect(() => {
    getStore();
  }, []);

  return (
    <>
      <Toast ref={toast} />
      {store && (
        <div className="w-100">
            <>
              <div className="d-md-flex gap-4 justify-content-between">
                <div className="section-wrapper h-auto w-100 mb-4">
                  <div className="d-flex justify-content-between">
                    <p className="block-title"><FormattedMessage id="t-store-information" defaultMessage="Store information" /></p>
                    <span className="pi pi-pencil cursor-pointer" onClick={() => setVisibleEdit(true)} />
                  </div>
                  <div className="block-wrapper mb-4">
                    <div>
                      <h5>{store?.name}</h5>
                    </div>
                    <div>
                      <p>{store?.description}</p>
                    </div>
                  </div>
                </div>

                <div className="section-wrapper h-auto w-100 mb-4">
                  <p className="block-title"><FormattedMessage id="t-store-background" defaultMessage="Store background" /></p>
                  <div className="block-wrapper mb-4">
                    {photoURL && photoURL != '' && (
                      <img className="img-preview" width={300} src={`${config.imageServerUrl}/${photoURL}`} />
                    )}
                  </div>
                </div>
              </div>

              <div className="d-md-flex gap-4 w-100">
                <div className="section-wrapper h-auto w-100 mb-4">
                  <p className="block-title"><FormattedMessage id="t-store-operating-times" defaultMessage="Store operating times" /></p>
                  <div className="block-wrapper mb-4">
                    {store.operationTimes &&
                      store.operationTimes.length > 0 &&
                      store.operationTimes.map((operationTime: any, index: any) => {
                        return (
                          <p key={index}>
                            {WEEKDAYS.find((item) => item.value === operationTime.weekDay)?.label}:{' '}
                            {operationTime?.availableFrom} - {operationTime?.availableTo}{' '}
                          </p>
                        );
                      })}
                  </div>
                </div>

                <div className="section-wrapper h-auto w-100 mb-4">
                  <p className="block-title"><FormattedMessage id="t-store-address" defaultMessage="Store Address" /></p>
                  <div className="block-wrapper mb-4">
                    <p>{store?.address}</p>
                  </div>
                  <p className="block-title"><FormattedMessage id="t-location:-(latitude,-longitude)" defaultMessage="Location: (latitude, longitude)" /></p>
                  <div className="block-wrapper mb-4">
                    <p>{`${store?.latitude} , ${store?.longitude}`} </p>
                  </div>
                  <p className="block-title"><FormattedMessage id="t-store-cuisines" defaultMessage="Store Cuisines" /></p>
                  <div className="block-wrapper mb-4">
                    <p>
                      {store?.cuisines?.map((item: any, index: number) => (
                        <span className="mr-4">
                          {item?.name}
                          {store?.cuisines?.length === index + 1 ? '' : ','}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
            </>
            <AddOrEditStoreDialog
              onSaved={handleStoreInfoSaved}
              header="Edit Store"
              visible={visibleEdit}
              onDismiss={onHandleDismissStore}
              storeInfo={store}
            />
        </div>
      )}
    </>
  );
}
