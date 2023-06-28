import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Col, Row } from 'react-flexbox-grid';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

import hmiService from 'services/HomeMadeInn';

interface StoreDialogProps {
  store: any;
  isEdit: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const loadingStyle = { fontSize: '2em' };
const DIALOG_STYLE = { width: '400px' };

export default function AddOrEditStoreDialog({ store, isEdit, onHide, onSuccess }: StoreDialogProps) {
  const [cuisineName, setCuisineName] = useState(isEdit ? store.name : '');
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSaveClick = async () => {
    if (!cuisineName.trim()) {
      setErrorMessage('Name is required');
      return;
    }
    setErrorMessage('');
    setLoading(true);
    try {
      const data = {
        ...store,
        name: cuisineName,
      };

      if (isEdit) {
        await hmiService.updateCuisines(data);
      } else {
        await hmiService.addCuisine(data);
      }

      onSuccess();
    } catch (err:any) {
      if (err.response) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage(err.message);
      }
    }
    setLoading(false);
  };

  return (
    <Dialog className="cuisine-form" header={'Cuisines'} visible={true} onHide={onHide} style={DIALOG_STYLE}>
      <Row className="cuisine-name-row mb-4">
        <Col>
          <label className="mb-2">Name</label>
          <InputText className="p-inputtext" value={cuisineName} onChange={(e: any) => setCuisineName(e.target.value)} />
        </Col>
      </Row>
      <Row className="save">
        <Col>
          {isLoading ? (
            <i className="pi pi-spin pi-spinner" style={loadingStyle} />
          ) : (
            <Button label="Save" type="submit" className="btn-positive mt-16 w-100" onClick={handleSaveClick} />
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
