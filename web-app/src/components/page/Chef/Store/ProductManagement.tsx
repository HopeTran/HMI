import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Col, Row } from 'react-flexbox-grid';
import { RouteComponentProps } from 'react-router-dom';

import ConfirmationDialog from 'components/common/ConfirmationDialog';
import DataActions from 'components/common/DataActions';
import { config } from 'config';
import Product from 'models/product';
import Store from 'models/store';
import hmiService from 'services/HomeMadeInn';
import { useUser } from 'store/hooks';
import AddOrEditProductForm from './AddOrEditProductForm';

export default function ProductManagement(props: RouteComponentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [store, setStore] = useState<Store>();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>({});
  const [isProductFormVisible, setProductFormVisible] = useState(false);
  const [isConfirmDeleteDialogVisible, setConfirmDeleteDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const intl = useIntl();
  const user = useUser();

  const photoBodyTemplate = (rowData: Product) => {
    return (
      <>
        {rowData?.photo && rowData?.photo !== '' && (
          <div>
            <img className="img-preview" width={150} src={`${config.imageServerUrl}/${rowData?.photo}`} />
          </div>
        )}
      </>
    );
  };

  const categoriesBodyTemplate = (rowData: Product) => {
    const categoryNames = rowData?.categories?.map((item) => item.name);
    return (
      <>
        {categoryNames && categoryNames?.length > 0 && (
          <>
            <div>{categoryNames.join(', ')}</div>
          </>
        )}
      </>
    );
  };

  const actionBodyTemplate = (rowData: Product) => {
    const handleEditProduct = () => {
      setSelectedProduct(rowData);
      setProductFormVisible(true);
    };

    const handleDeleteProduct = () => {
      setSelectedProduct(rowData);
      setConfirmDeleteDialogVisible(true);
    };

    return <DataActions data={rowData} onEditClick={handleEditProduct} onDeleteClick={handleDeleteProduct} />;
  };

  const handleProductFormHide = () => {
    setProductFormVisible(false);
  };

  const handleConfirmDeleteDismiss = () => {
    setSelectedProduct(null);
    setConfirmDeleteDialogVisible(false);
  };

  const handleConfirmDialogAccept = async () => {
    setErrorMessage('');
    try {
      await hmiService.deleteProduct(selectedProduct.id);
      await getProducts();

      setConfirmDeleteDialogVisible(false);
      setSelectedProduct(null);
    } catch (err: any) {
      if (err.response) {
        setErrorMessage(err.response.data.message);
      }
    }
  };

  const handleAddNewClick = () => {
    setSelectedProduct(new Product());
    setProductFormVisible(true);
  };

  const getProducts = async () => {
    setIsLoading(true);
    const products = await hmiService.getProducts({ storeId: user?.storeId });

    setProducts(products);
    setIsLoading(false);
  };

  const getStoreById = async () => {
    setIsLoading(true);
    const store = await hmiService.getStoreById(user?.storeId);

    setStore(store);
    setIsLoading(false);
  };

  const handleSavingSuccess = async () => {
    setProductFormVisible(false);
    setSelectedProduct(null);
    await getProducts();
  };

  useEffect(() => {
    if (user.storeId) getProducts();
    getStoreById();
  }, [user.storeId]);

  return (
    <div className="product-management-list">
      <Row className="filter filter-container tw-mb-4 tw-mt-4">
        <Col className="btn-col mb-10">
          <Button
            label={intl.formatMessage({
              id: 'c-add-new',
              defaultMessage: 'Add New',
            })}
            onClick={handleAddNewClick}
          />
        </Col>
      </Row>
      <Row className="product-list">
        {!isProductFormVisible && <DataTable value={products} loading={isLoading} sortMode="multiple">
          <Column
            header={intl.formatMessage({
              id: 't-photo',
              defaultMessage: 'Photo',
            })}
            body={photoBodyTemplate}
            sortable={false}
            style={{ width: '200px' }}
          />
          <Column
            header={intl.formatMessage({
              id: 't-name',
              defaultMessage: 'Name',
            })}
            field="name"
            sortable={true}
            filter
            filterPlaceholder={intl.formatMessage({
              id: 't-search-by-name',
              defaultMessage: 'Search By Name',
            })}
          />
          <Column
            header={intl.formatMessage({
              id: 't-categories',
              defaultMessage: 'Categories',
            })}
            body={categoriesBodyTemplate}
            sortable={false}
          />
          <Column
            header={intl.formatMessage({
              id: 't-price',
              defaultMessage: 'Price',
            })}
            field="price"
            sortable={true}
            style={{ width: '150px' }}
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
        </DataTable>}
        {isProductFormVisible && (
          <AddOrEditProductForm
            store={store}
            selectedProduct={selectedProduct}
            onHide={handleProductFormHide}
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
    </div>
  );
}
