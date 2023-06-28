import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Row } from 'react-flexbox-grid';
import { Dialog } from 'primereact/dialog';

import hmiService from 'services/HomeMadeInn';
import { config } from 'config';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';
interface PlatformCategoryFormProps {
  platformCategory: any;
  isEdit: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const loadingStyle = { fontSize: '2em' };


export default function AddOrEditPlatformCategoryForm({ platformCategory, isEdit, onHide, onSuccess }: PlatformCategoryFormProps) {
  const [platformCategoryName, setPlatformCategoryName] = useState(isEdit ? platformCategory.name : '');
  const [platformCategoryDescription, setPlatformCategoryDescription] = useState(isEdit ? platformCategory.description : '');
  const [selectedIcon, setSelectedIcon] = useState<any>();
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fileUploadRef = useRef<HTMLInputElement>(null);
  const intl = useIntl();
  const handleFileUploadChange = (event: any) => {
    if (event.target.files[0]) {
      setSelectedIcon(event.target.files[0]);
    }
  };

  const handleSaveClick = async () => {
    if (!platformCategoryName.trim()) {
      setErrorMessage('Name is required');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    try {
      const storePlatformCategory = {
        ...platformCategory,
        name: platformCategoryName,
        iconFileData: selectedIcon,
        description: platformCategoryDescription,
      };

      if (isEdit) {
        await hmiService.updatePlatformCategory(storePlatformCategory);
      } else {
        await hmiService.addPlatformCategory(storePlatformCategory);
      }

      onSuccess();
    } catch (err: any) {
      if (err.response) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage(err.message);
      }
    }
    setLoading(false);
  };

  return (
    <Dialog className="platform-category-form" header={intl.formatMessage({
      id: 't-platform-categories',
      defaultMessage: 'Platform Categories',
    })} 
    visible={true} onHide={onHide}>
      <div className="platform-category-name-row mb-4">
        <label className="mb-2"><FormattedMessage id="t-name" defaultMessage="Name" /></label>
        <input className="p-inputtext" type="text" value={platformCategoryName} onChange={e => setPlatformCategoryName(e.target.value)} />
      </div>

      <div className="platform-category-photo-row mb-4">
        <label className="mb-2"><FormattedMessage id="t-icon-photo" defaultMessage="Icon Photo" /></label>
          {platformCategory?.photo && platformCategory?.photo !== '' && (
            <div>
              <img className="img-preview" width={100} src={`${config.imageServerUrl}/${platformCategory.photo}`} />
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleFileUploadChange} ref={fileUploadRef} />
      </div>

      <div className="platform-category-description-row mb-4">
        <label className="mb-2"><FormattedMessage id="t-description-" defaultMessage="Description" /></label>
        <textarea className="p-inputtext" value={platformCategoryDescription} onChange={e => setPlatformCategoryDescription(e.target.value)} />
      </div>

      <Row end="xs" className="save mx-2">
          {isLoading ? (
            <i className="pi pi-spin pi-spinner" style={loadingStyle} />
          ) : (
            <Button label={intl.formatMessage({
              id: 'c-save',
              defaultMessage: 'Save',
            })}  type="submit" className="btn-positive mt-16 " onClick={handleSaveClick} />
          )}
        </Row>
        <Row>
          <span className={'error-message'}>{errorMessage}</span>
        </Row>
    </Dialog>
  );
}