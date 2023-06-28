import { categories, cuisines, operationTimes } from 'components/common/templates/Templates';
import { STORE_INFORMAITON_FIELDS, STORE_MANAGEMENT_TYPE } from 'constants/admin';
import { isArray } from 'lodash';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';

interface StoreProps {
  storeType: string;
  stores: any;
  errorMessage: string;
  visible: boolean;
  onHide:() => void;
  onAccept: (e: any) => void;
  onDelete:() => void;
}
const loadingStyle = { fontSize: '2em' };
const DIALOG_STYLE = { width: '600px' };

export default function ActiveStoreDialog({ storeType, stores, errorMessage, visible, onHide, onAccept, onDelete }: StoreProps) {
  const [isLoading, setLoading] = useState(false);

  const handleSaveClick = (e: any) => {
    onAccept(e);
    setLoading(false)
  };

  const handleDismissDialog = () => {
    onHide();
  };

  const handleDeleteClick = () => {
    onDelete();
  };

  const generateList = (item: any, typeArray: string, index: number) => {    
   if (typeArray === 'operationTimes') {
      return operationTimes(item, index)
    } else if (typeArray === 'cuisines') {
      return cuisines(item, index)
    } else if (typeArray === 'categories') {
      return categories(item, index)
    }
  };

  return (
    <Dialog
      className="store-dialog"
      header={'Store Information'}
      visible={visible}
      onHide={onHide}
      style={DIALOG_STYLE}
    >
      {stores && stores.map((store:any) => {
        return (
          <div className="mt-4">
          {STORE_INFORMAITON_FIELDS.map((field: any, index: number) => {
            return (
              store[field.value]?.length > 0 && (
                <Row className="mb-4" key={index}>
                  <Col xs={4}>{field.name}:</Col>
                  <Col xs={8}>
                    {field.value === 'photo' ? (
                      <img src={store[field.value]} width="100" alt="Store background" />
                    ) : (
                      isArray(store[field.value]) ? 
                      store[field.value].map((item:any, index:number) => {
                        return generateList(item, field.value, index)
                      }): store[field.value]
                    )}
                  </Col>
                </Row>
              )
            );
          })}
        </div>
        )
      })
         
      }
      <Row className="save mb-4">
        <Col>
          {isLoading ? (
            <i className="pi pi-spin pi-spinner" style={loadingStyle} />
          ) : (
            <>
              {storeType !== STORE_MANAGEMENT_TYPE.ACTIVE ? 
                <div className="d-flex justify-content-between gap-4 tw-mt-12">
                  <Button label="Yes" type="submit" className="btn-positive mt-16 w-100" onClick={() => handleSaveClick(true)} />
                  <Button label="No" type="submit" className="btn-positive mt-16 w-100" onClick={handleDismissDialog} />
                </div>
                : 
                <div className="d-md-flex justify-content-between gap-4 tw-mt-12">
                  <Button label="In-active Store" type="submit" className="btn-positive mt-16 w-100" onClick={() => handleSaveClick(false)} />
                  <Button label="Delete Store" type="submit" className="btn-positive mt-md-16 mt-2 w-100" onClick={handleDeleteClick} />
                  <Button label="Close" type="submit" className="btn-positive mt-md-16 mt-2 w-100" onClick={handleDismissDialog} />
                </div>
              }
            </>
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          <span className={'error-message clr-red my-8'}>{errorMessage}</span>
        </Col>
      </Row>
    </Dialog>
  );
}


