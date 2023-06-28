import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Grid, Row } from 'react-flexbox-grid';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

import AddOrEditPlatformCategoryForm from './AddOrEditPlatformCategoryForm';
import ConfirmationDialog from 'components/common/ConfirmationDialog';
import DataActions from 'components/common/DataActions';
import hmiService from 'services/HomeMadeInn';
import PlatformCategory from 'models/platformCategory';
import { config } from 'config';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';

export default function PlatformCategories(props: RouteComponentProps) {
  
  const [platformCategories, setPlatformCategories] = useState<any[]>();
  const [selectedPlatformCategory, setSelectedPlatformCategory] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isPlatformCategoryFormVisible, setPlatformCategoryFormVisible] = useState(false);
  const [isConfirmDeleteDialogVisible, setConfirmDeleteDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const intl = useIntl();

  const actionBodyTemplate = (rowData: PlatformCategory) => {
    const handleEditPlatformCategory = () => {
      setSelectedPlatformCategory(rowData);
      setIsEdit(true);
      setPlatformCategoryFormVisible(true);
    };

    const handleDeletePlatformCategory = () => {
      setSelectedPlatformCategory(rowData);
      setConfirmDeleteDialogVisible(true);
    };

    return <DataActions data={rowData} onEditClick={handleEditPlatformCategory} onDeleteClick={handleDeletePlatformCategory} />;
  };

  const iconBodyTemplate = (rowData: PlatformCategory) => {

    return (
      <>
        {rowData?.icon && rowData?.icon !== '' && (
          <div>
            <img className="img-preview" width={100} src={`${config.imageServerUrl}/${rowData.icon}`} />
          </div>
        )}
      </>
    )
  };

  const handlePlatformCategoryFormHide = () => {
    setPlatformCategoryFormVisible(false);
  };

  const handleConfirmDeleteDismiss = () => {
    setSelectedPlatformCategory(null);
    setConfirmDeleteDialogVisible(false);
  };

  const handleConfirmDialogAccept = async () => {
    setErrorMessage('');
    try {
      await hmiService.deletePlatformCategory(selectedPlatformCategory.id);
      await getPlatformCategories();

      setConfirmDeleteDialogVisible(false);
      setSelectedPlatformCategory(null);
    } catch (err: any) {
      if (err.response) {
        setErrorMessage(err.response.data.message);
      }
    }
  };

  const handleAddNewClick = () => {
    setIsEdit(false);
    setSelectedPlatformCategory(new PlatformCategory());
    setPlatformCategoryFormVisible(true);
  };

  const handleSavingSuccess = async () => {
    setPlatformCategoryFormVisible(false);
    setSelectedPlatformCategory(null);
    await getPlatformCategories();
  };

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
    <div className="wrapper container mt-24">
      <Grid className="platform-category-management-list">
        <div className="d-flex justify-content-between align-items-center my-16">
          <h3><FormattedMessage id="t-platform-categories" defaultMessage="Platform Categories" /></h3>
          <div className="btn-col my-10">
            <Button 
            label={intl.formatMessage({
        id: 'c-add-new',
        defaultMessage: 'Add New',
      })} onClick={handleAddNewClick} />
          </div>
        </div>
        <Row className="platform-category-list">
          <DataTable
            value={platformCategories}
            loading={isLoading}
            sortMode="multiple"
          >
            <Column 
            header={intl.formatMessage({
              id: 't-icon',
              defaultMessage: 'Icon',
            })}  body={iconBodyTemplate} field="photo" sortable={false} style={{ width: '150px' }} />
            <Column 
            header={intl.formatMessage({
            id: 't-name',
            defaultMessage: 'Name',
          })} field="name" sortable={true} style={{ width: '200px' }} />
            <Column 
            header={intl.formatMessage({
            id: 't-description-',
            defaultMessage: 'Description',
          })} field="description" sortable={false} />
            <Column 
            header={intl.formatMessage({
            id: 't-action',
            defaultMessage: 'Action',
          })} body={actionBodyTemplate} className="action-col" style={{ width: '150px' }} />

          </DataTable>
          {isPlatformCategoryFormVisible && (
            <AddOrEditPlatformCategoryForm
              platformCategory={selectedPlatformCategory}
              isEdit={isEdit}
              onHide={handlePlatformCategoryFormHide}
              onSuccess={handleSavingSuccess}
            />
          )}
          <ConfirmationDialog
            header={intl.formatMessage({
              id: 't-confirm',
              defaultMessage: 'Confirm',
            })} 
            visible={isConfirmDeleteDialogVisible}
            acceptText="Yes"
            dismissText="No"
            onAccept={handleConfirmDialogAccept}
            onDismiss={handleConfirmDeleteDismiss}
            message={intl.formatMessage({
              id: 'm-are-you-sure-to-delete-selected-item?',
              defaultMessage: 'Are you sure to delete selected item?',
            })} 
          />
        </Row>
        <Row>
          <span className={'error-message'}>{errorMessage}</span>
        </Row>
      </Grid>
    </div>
  );
}
