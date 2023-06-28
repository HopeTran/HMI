import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useEffect, useState } from "react";
import { Grid, Row } from "react-flexbox-grid";
import { RouteComponentProps } from "react-router-dom";

import hmiService from 'services/HomeMadeInn';
import CuisinesModel from 'models/cuisines';
import ConfirmationDialog from "components/common/ConfirmationDialog";
import DataActions from "components/common/DataActions";
import AddOrEditCuisineDialog from "./AddOrEditCuisineDialog";
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';

export default function Cuisines(props: RouteComponentProps) {
  const [cuisines, setCuisines] = useState<any[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [isCuisineFormVisible, setIsCuisineFormVisible] = useState(false);
  const [isConfirmDeleteDialogVisible, setIsConfirmDeleteDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<any>({});
  const intl = useIntl();

  const getCuisines = async () => {
    setIsLoading(true);
    const data = await hmiService.getCuisines();
    setCuisines(data);
    setIsLoading(false);
  };

  const handleAddNewClick = () => {
    setIsCuisineFormVisible(true);
    setIsEdit(false);
    setSelectedCuisine(new CuisinesModel())
  }

  const actionBodyTemplate = (rowData: CuisinesModel) => {
    const handleEditCuisine = () => {
      setSelectedCuisine(rowData);
      setIsEdit(true);
      setIsCuisineFormVisible(true);
    };

    const handleDeleteCuisine = () => {
      setSelectedCuisine(rowData);
      setIsConfirmDeleteDialogVisible(true);
    };
    return <DataActions data={rowData} onEditClick={handleEditCuisine} onDeleteClick={handleDeleteCuisine} />;
  };

  const handleSavingSuccess = async () => {
    setIsCuisineFormVisible(false);
    setSelectedCuisine(null);
    await getCuisines();
  };

  const handleConfirmDialogAccept = async () => {
    setErrorMessage('');
    try {
      await hmiService.deleteCuisine(selectedCuisine.id);
      await getCuisines();

      setIsConfirmDeleteDialogVisible(false);
      setSelectedCuisine(null);
    } catch (err: any) {
      if (err.response) {
        setErrorMessage(err.response.data.message);
      }
    }
  };

  const handleConfirmDeleteDismiss = () => {
    setIsConfirmDeleteDialogVisible(false);
    setSelectedCuisine(null);
  }

  const handleCuisineFormHide = () => {
    setIsCuisineFormVisible(false);
  };

  useEffect(() => {
    getCuisines();
  }, [])

  return (
    <div className="wrapper container mt-24">
      <Grid className="cuisine-management-list ">
        <div className="d-flex justify-content-between align-items-center my-16">
          <h3><FormattedMessage id="t-cuisines" defaultMessage="Cuisines" /></h3>
          <div className="btn-col my-10">
            <Button label={intl.formatMessage({
        id: 'c-add-new',
        defaultMessage: 'Add New',
      })} onClick={handleAddNewClick} />
          </div>
        </div>
        <Row className="filter filter-container tw-mb-4 tw-mt-4">          
        </Row>
        <Row className="cuisine-list">
          <DataTable
            value={cuisines}
            loading={isLoading}
            sortMode="multiple"
          >
            <Column 
            header={intl.formatMessage({
              id: 't-name',
              defaultMessage: 'Name',
            })}  field="name" sortable={true} style={{ width: '200px' }} />
            <Column 
            header={intl.formatMessage({
              id: 't-action',
              defaultMessage: 'Action',
            })} body={actionBodyTemplate} className="action-col" style={{ width: '150px' }} />

          </DataTable>
          {isCuisineFormVisible && (
            <AddOrEditCuisineDialog
              cuisine={selectedCuisine}
              isEdit={isEdit}
              onHide={handleCuisineFormHide}
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
  )
}