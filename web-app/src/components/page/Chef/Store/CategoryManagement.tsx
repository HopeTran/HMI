import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { RouteComponentProps } from 'react-router-dom';
import { isEmpty } from 'lodash';

import ConfirmationDialog from 'components/common/ConfirmationDialog';
import DataActions from 'components/common/DataActions';
import Store from 'models/store';
import Category from 'models/category';
import hmiService from 'services/HomeMadeInn';
import { useUser } from 'store/hooks';
import AddOrEditCategoryForm from './AddOrEditCategoryForm';

export default function CategoryManagement(props: RouteComponentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [store, setStore] = useState<Store>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsMap, setProductsMap] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>({});
  const [isCategoryFormVisible, setCategoryFormVisible] = useState(false);
  const [isConfirmDeleteDialogVisible, setConfirmDeleteDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const user = useUser()

  const actionBodyTemplate = (rowData: Category) => {
    const handleEditCategory = () => {
      setSelectedCategory(rowData);
      setIsEdit(true);
      setCategoryFormVisible(true);
    };

    const handleDeleteCategory = () => {
      setSelectedCategory(rowData);
      setConfirmDeleteDialogVisible(true);
    };

    return <DataActions data={rowData} onEditClick={handleEditCategory} onDeleteClick={handleDeleteCategory} />;
  };

  const handleCategoryFormHide = () => {
    setCategoryFormVisible(false);
  };

  const handleConfirmDeleteDismiss = () => {
    setSelectedCategory(null);
    setConfirmDeleteDialogVisible(false);
  };

  const handleConfirmDialogAccept = async () => {
    setErrorMessage('');
    try {
      await hmiService.deleteCategory(selectedCategory.id);
      await getCategories();

      setConfirmDeleteDialogVisible(false);
      setSelectedCategory(null);
    } catch (err: any) {
      if (err.response) {
        setErrorMessage(err.response.data.message);
      }
    }
  };

  const handleAddNewClick = () => {
    setIsEdit(false);
    setSelectedCategory(new Category());
    setCategoryFormVisible(true);
  };

  const getProducts = async () => {
    const data = await hmiService.getProducts({store: user?.storeId});
    setProductsMap(data);
  };

  const getCategories = async () => {
    setIsLoading(true);
    const categories = await hmiService.getCategories({storeId: user?.storeId});

    setCategories(categories);
    setIsLoading(false);
  };

  const getStoreById = async () => {
    const data = await hmiService.getStoreById( user?.storeId);
    setStore(data);
  };

  const handleSavingSuccess = async () => {
    setCategoryFormVisible(false);
    setSelectedCategory(null);
    await getCategories();
  };

  useEffect(() => {
    if (!isEmpty(productsMap)) {
      getCategories();
    }
  }, [productsMap]);


  useEffect(() => {
    if (user?.storeId)
      getProducts();
      getStoreById();
  }, [user?.storeId]);

  return (
    <div className="category-management-list">
      <Row className="filter filter-container tw-mb-4 tw-mt-4">
        <Col className="btn-col mb-10">
          <Button label="Add New" onClick={handleAddNewClick} />
        </Col>
      </Row>
      <Row className="category-list">
        <DataTable
          value={categories}
          loading={isLoading}
          sortMode="multiple"
        >
          <Column header="Name" field="name" sortable={true} />
          <Column header="Action" body={actionBodyTemplate} className="action-col" style={{ width: '150px' }} />
        </DataTable>
        {isCategoryFormVisible && (
          <AddOrEditCategoryForm
            store={store}
            category={selectedCategory}
            isEdit={isEdit}
            onHide={handleCategoryFormHide}
            onSuccess={handleSavingSuccess}
          />
        )}
        <ConfirmationDialog
          header="Confirm"
          visible={isConfirmDeleteDialogVisible}
          acceptText="Yes"
          dismissText="No"
          onAccept={handleConfirmDialogAccept}
          onDismiss={handleConfirmDeleteDismiss}
          message="Are you sure to delete selected item?"
        />
      </Row>
      <Row>
        <span className={'error-message'}>{errorMessage}</span>
      </Row>
    </div>
  );
}
