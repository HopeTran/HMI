import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Grid, Row } from 'react-flexbox-grid';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';

import AddOrEditAttributesForm from './AddOrEditAttributesForm';
import ConfirmationDialog from 'components/common/ConfirmationDialog';
import DataActions from 'components/common/DataActions';
import hmiService from 'services/HomeMadeInn';
import AttrModel from 'models/attributes';

export default function Attributes(props: RouteComponentProps) {
  const [attributes, setAttributes] = useState<any[]>();
  const [selectedAttributes, setSelectedAttributes] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isAttributesFormVisible, setAttributesFormVisible] = useState(false);
  const [isConfirmDeleteDialogVisible, setConfirmDeleteDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const intl = useIntl();

  const actionBodyTemplate = (rowData: AttrModel) => {
    const handleEditAttributes = () => {
      setSelectedAttributes(rowData);
      setIsEdit(true);
      setAttributesFormVisible(true);
    };

    const handleDeleteAttributes = () => {
      setSelectedAttributes(rowData);
      setConfirmDeleteDialogVisible(true);
    };

    return <DataActions data={rowData} onEditClick={handleEditAttributes} onDeleteClick={handleDeleteAttributes} />;
  };

  const attrValuesTemplate = (rowData: any, column: any) => {
    const values = rowData[column.field]
      ? rowData[column.field].map((e: any, index: number) => {
          return (
            <span className="mr-2">
              {e.name}
              {index === (rowData[column.field].length - 1) ? '' : ','}
            </span>
          );
        })
      : '';
    return values;
  };

  const handleAttributesFormHide = () => {
    setAttributesFormVisible(false);
  };

  const handleConfirmDeleteDismiss = () => {
    setSelectedAttributes(null);
    setConfirmDeleteDialogVisible(false);
  };

  const handleConfirmDialogAccept = async () => {
    setErrorMessage('');
    try {
      await hmiService.deleteAttribute(selectedAttributes.id);
      await getAttributes();

      setConfirmDeleteDialogVisible(false);
      setSelectedAttributes(null);
    } catch (err:any) {
      if (err.response) {
        setErrorMessage(err.response.data.message);
      }
    }
  };

  const handleAddNewClick = () => {
    setIsEdit(false);
    setSelectedAttributes(new AttrModel());
    setAttributesFormVisible(true);
  };

  const handleSavingSuccess = async () => {
    setAttributesFormVisible(false);
    setSelectedAttributes(null);
    await getAttributes();
  };

  const getAttributes = async () => {
    setIsLoading(true);
    const attributes = await hmiService.getAttributes();
    setAttributes(attributes);
    setIsLoading(false);
  };

  useEffect(() => {
    getAttributes();
  }, []);

  return (
    <div className="wrapper container mt-24">
      <Grid className="attributes-management-list">
        <div className="d-flex justify-content-between align-items-center my-16">
          <h3>
            <FormattedMessage id="t-attributes" defaultMessage="Attributes" />
          </h3>
          <div className="btn-col my-10">
            <Button
              label={intl.formatMessage({
                id: 'c-add-new',
                defaultMessage: 'Add New',
              })}
              onClick={handleAddNewClick}
            />
          </div>
        </div>
        <Row className="attributes-list">
          <DataTable value={attributes} loading={isLoading} sortMode="multiple">
            <Column
              header={intl.formatMessage({
                id: 't-name',
                defaultMessage: 'Name',
              })}
              field="name"
              sortable={true}
              style={{ width: '200px' }}
            />
            <Column
              header={intl.formatMessage({
                id: 't-attr-value-',
                defaultMessage: 'Attribute Value',
              })}
              field="attributeValues"
              sortable={false}
              body={attrValuesTemplate}
            />
            <Column
              header={intl.formatMessage({
                id: 't-action',
                defaultMessage: 'Action',
              })}
              body={actionBodyTemplate}
              className="action-col"
              style={{ width: '150px' }}
            />
          </DataTable>
          {isAttributesFormVisible && (
            <AddOrEditAttributesForm
              attributes={selectedAttributes}
              isEdit={isEdit}
              onHide={handleAttributesFormHide}
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
