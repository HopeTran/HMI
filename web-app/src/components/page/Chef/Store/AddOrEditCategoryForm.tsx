import partition from 'lodash/partition';
import sortBy from 'lodash/sortBy';
import { Button } from 'primereact/button';
import { PickList } from 'primereact/picklist';
import React, { useEffect, useState } from 'react';
import { Row } from 'react-flexbox-grid';
import { Dialog } from 'primereact/dialog';

import Product from 'models/product';
import hmiService from 'services/HomeMadeInn';
import { isDesktop } from 'utilities/common';
import ErrorMessage from '../../../common/ErrorMessage';
import { FormattedMessage } from 'react-intl';

const loadingStyle = { fontSize: '2em' };
const PICK_LIST_STYLE = { height: isDesktop() ? '400px' : '200px' };
const DIALOG_STYLE = { width: '700px' };

const sortProducts = (products: Product[]) => {
  return sortBy(products, product => product.name);
};

interface CategoryFormProps {
  store: any
  category: any;
  isEdit: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

export default function AddOrEditCategoryForm({ store, category, isEdit, onHide, onSuccess }: CategoryFormProps) {
  const categoryProducts: Product[] = isEdit ? category.products : [];
  const [categoryName, setCategoryName] = useState(isEdit ? category.name : '');
  const [source, setSource] = useState<Product[]>([]);
  const [target, setTarget] = useState<Product[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<any>({});
 

  const itemTemplate = (data: any) => {
    return <span>{data.name}</span>;
  };

  const handleChange = (event: any) => {
    setSource(sortProducts(event.source));
    setTarget(sortProducts(event.target));
  };

  const getAllProducts = async () => {
    const allProducts = await hmiService.getProducts({storeId: store.id});
    const twoGroups = partition(allProducts, product => categoryProducts.findIndex(catProduct => catProduct.id == product.id) === -1);

    setSource(sortProducts(twoGroups[0]));
    setTarget(sortProducts(twoGroups[1]));
  };

  const handleNameChange = (e: any) => {
    setErrorMessage({});
    setCategoryName(e.target.value);
  }

  const handleSaveClick = async () => {
    setErrorMessage({});
    if (!categoryName.trim()) {
      setErrorMessage({validate: 'Name is required'});
      return;
    }
    setLoading(true);
    const products = target.map(product => { return {id: product.id} });

    try {
      const storeCategory = {
        ...category,
        name: categoryName,
        products,
        storeId: store.id,
      };

      if (isEdit) {
        await hmiService.updateCategory(storeCategory);
      } else {
        await hmiService.addCategory(storeCategory);
      }
      onSuccess();
    } catch (err: any) {
      if (err.response) {
        setErrorMessage({error: err.response.data.message});
      } else {
        setErrorMessage({error: err.message});
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  return (
    <Dialog className="category-form" header={`${isEdit ? "Edit" : "New"} Category`} visible={true} onHide={onHide} style={DIALOG_STYLE} >
      <div className="category-name-row my-2">
        <label className="tw-mr-4"><FormattedMessage id="t-category-name" defaultMessage="Category Name" /><span className="clr-red">*</span></label>
        <input className="p-inputtext" type="text" value={categoryName} onChange={handleNameChange} />
        <div className="item-right">
          {errorMessage?.validate && <ErrorMessage message={errorMessage.validate } displayBlock={true} />}
        </div>
      </div>

      <div className="category-name-row my-4">
        <label className="tw-mr-4"><FormattedMessage id="t-products" defaultMessage="Products" /></label>
        <PickList
            source={source}
            target={target}
            itemTemplate={itemTemplate}
            sourceHeader="All Products"
            targetHeader="Category Products"
            showSourceControls={false}
            showTargetControls={false}
            sourceStyle={PICK_LIST_STYLE}
            targetStyle={PICK_LIST_STYLE}
            onChange={handleChange}
        />
      </div>

      <div className="category-name-row tw-mb-4">
        <Row>
          <div className="mb-4 clr-red mt-2 text-right">
            {errorMessage?.error && <ErrorMessage message={errorMessage?.error} displayBlock={true} />}
          </div>
        </Row>
        <Row end="xs" className="save">
          {isLoading ? (
              <i className="pi pi-spin pi-spinner" style={loadingStyle} />
          ) : (
              <Button label="Save" type="submit" className="btn-positive" onClick={handleSaveClick} />
          )}
        </Row>
      </div>
    </Dialog>
  );
}
