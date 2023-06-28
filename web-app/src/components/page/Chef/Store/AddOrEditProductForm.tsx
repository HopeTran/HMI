import { Button } from 'primereact/button';
import React, { useEffect, useState } from 'react';
// import { Dialog } from 'primereact/dialog';
import { Field, FieldArray, Form, Formik } from 'formik';
import * as Yup from 'yup';

import Category from 'models/category';
// import { config } from 'config';
import Product from 'models/product';
import hmiService from 'services/HomeMadeInn';
import TextInput from '../../../common/TextInput';
import ErrorMessage from '../../../common/ErrorMessage';
import MultiSelectField from '../../../common/MutiSelectField';
import AddOrEditCategoryForm from './AddOrEditCategoryForm';
import { FormattedMessage } from 'react-intl';
import MultiSelectWithSearchField from '../../../common/MultiSelectWithSearchField';
import DropdownField from 'components/common/DropdownField';
import AccordionTemplate from '../../../common/AccordionTemplate';

interface ProductFormProps {
  store: any;
  selectedProduct: Product;
  onHide: () => void;
  onSuccess: () => void;
}

const attributeMockDatas = [
  {
    id: 1,
    name: 'Size',
    attributeValue: [
      { id: 1, name: 'S' },
      { id: 2, name: 'M' },
      { id: 3, name: 'L' },
      { id: 4, name: 'XL' },
    ],
  },
  {
    id: 2,
    name: 'Color',
    attributeValue: [
      { id: 1, name: 'Blue' },
      { id: 2, name: 'Pink' },
      { id: 3, name: 'Black' },
      { id: 4, name: 'Red' },
    ],
  },
  {
    id: 3,
    name: 'Screensize',
    attributeValue: [
      { id: 1, name: '13 inch' },
      { id: 2, name: '14 inch' },
      { id: 3, name: '15 inch' },
      { id: 4, name: '16 inch' },
    ],
  },
  {
    id: 4,
    name: 'Memory',
    attributeValue: [
      { id: 1, name: '4 GB' },
      { id: 2, name: '8 GB' },
      { id: 3, name: '16 GB' },
      { id: 4, name: '32 GB' },
    ],
  },
  {
    id: 5,
    name: 'CPU',
    attributeValue: [
      { id: 1, name: 'i3' },
      { id: 2, name: 'i5' },
      { id: 3, name: 'i7' },
      { id: 4, name: 'M1' },
    ],
  },
  {
    id: 6,
    name: 'GPU',
    attributeValue: [
      { id: 1, name: 'Intel' },
      { id: 2, name: 'NVIDIA' },
      { id: 3, name: 'AMD' },
    ],
  },
  {
    id: 7,
    name: 'Disk',
    attributeValue: [
      { id: 1, name: 'SSD 128GB' },
      { id: 2, name: 'SSD 256GB' },
      { id: 3, name: 'SSD 512GB' },
      { id: 4, name: 'HDD 512GB' },
      { id: 5, name: 'HDD 1TB' },
    ],
  },
];

const ProductSchema = Yup.object().shape({
  name: Yup.string().required('Product name is required'),
  categories: Yup.array().min(1, 'Categories is required'),
  attributes: Yup.array().min(1, 'Attributes is required').required('Attributes is required'),
  productAttributes: Yup.array()
    .min(1, 'Product Attributes is required')
    .of(
      Yup.object().shape({
        price: Yup.number().min(1, 'Price must be greater than zero').required('Price is required'),
        inventory: Yup.number().min(1, 'Inventory must be greater than zero').required('Inventory is required'),
      }),
    ),
});

export default function AddOrEditProductForm({ store, selectedProduct, onHide, onSuccess }: ProductFormProps) {
  const [product, setProduct] = useState<Product>(selectedProduct || new Product());
  // const [selectedPhoto, setSelectedPhoto] = useState<any>();
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [isCategoryFormVisible, setIsCategoryFormVisible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [attributeOptions, setAttributeOptions] = useState<any[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<any[]>([]);
  const [attributeValues, setAttributeValues] = useState<any>([]);
  const [combineAttributes, setCombineAttributes] = useState<any>([]);

  const getCategories = async () => {
    const categories = await hmiService.getCategories({ storeId: store.id });
    setCategoryOptions(categories);
  };

  const getAttributes = async () => {
    // const attributes = await hmiService.getCategories({ storeId: store.id });
    const attributes = attributeMockDatas;
    setAttributeOptions(attributes);
  };

  const handleAttributeChange = (attributes: any) => {
    const selectedAttribute: any[] = [];
    attributes?.forEach((attribute: any) => {
      selectedAttribute.push(attribute);
    });
    setSelectedAttributes(selectedAttribute);
  };

  const handleAttributeValuesChange = (attribute: any, values: any) => {
    if (values !== undefined && values !== '') {
      const attr = attributeValues.filter((attributes: any) => attributes.attribute !== attribute);
      attr.push({ attribute, values });
      setAttributeValues(attr);
    }
  };

  const handleAddAttributeValue = () => {
    if (attributeValues.length > 0) {
      const _combineAttributes = combineAttributes;
      _combineAttributes.push(attributeValues);
      setCombineAttributes(_combineAttributes);
      setAttributeValues([]);
    }
    
  };
  

  const submitHandler = async (values: any, { setSubmitting, resetForm }: any) => {
    setErrorMessage('');
    console.log(values?.productAttributes);
    try {
      const categoryIds = values?.categories?.map((item: any) => {
        return { id: item.id };
      });

      const storeProduct: any = {
        ...values,
        storeId: store?.id,
        categories: categoryIds,
        // photoUploadData: selectedPhoto,
      };
      console.log(storeProduct);

      // await hmiService.saveProduct(storeProduct);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(error.message);
      }
    }
    setSubmitting(false);
  };

  const handleAddCategoryClick = () => {
    setIsCategoryFormVisible(true);
    return false;
  };

  const handleCategoryFormHide = () => {
    setIsCategoryFormVisible(false);
  };

  const handleSavingSuccess = async () => {
    await getCategories();
    setIsCategoryFormVisible(false);
  };

  useEffect(() => {
    getCategories();
    getAttributes();
  }, []);

  useEffect(() => {
    setProduct(selectedProduct);
  }, [selectedProduct]);

  return (
    <div className="product-form">
      <Formik initialValues={product} onSubmit={submitHandler} validationSchema={ProductSchema}>
        {({ isSubmitting, setFieldValue, values }: any) => (
          <Form>
            <div className="mb-4">
              <Field
                type="text"
                name="name"
                className="p-inputtext"
                isRequired={true}
                component={TextInput}
                label="Product name"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2">
                <FormattedMessage id="t-categories" defaultMessage="Categories" /> <span className="clr-red">*</span>
              </label>
              <div className="d-flex justify-content-between">
                <div className="d-inline-block d-flex flex-grow-1">
                  {categoryOptions && categoryOptions.length > 0 && (
                    <Field
                      name="categories"
                      isRequired={true}
                      component={MultiSelectField}
                      options={categoryOptions}
                      optionLabel="name"
                      className="input-default col-12"
                    />
                  )}
                </div>
                <Button type="button" label="+" className="btn-small" onClick={handleAddCategoryClick} />
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2">
                <FormattedMessage id="t-attributes" defaultMessage="Attributes" /> <span className="clr-red">*</span>
              </label>
              <div className="d-flex justify-content-between">
                <div className="d-inline-block d-flex flex-grow-1">
                  {attributeOptions && attributeOptions.length > 0 && (
                    <Field
                      name="attributes"
                      isRequired={true}
                      component={MultiSelectWithSearchField}
                      options={attributeOptions}
                      optionLabel="name"
                      placeholder="Select Attribute"
                      className="multiselect-custom col-12"
                      onChangeValue={handleAttributeChange}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              {selectedAttributes &&
                selectedAttributes.map((selectedAttribute, index) => {
                  return (
                    <div key={index} className="mb-4">
                      <label className="mb-2">
                        {selectedAttribute.name}
                        <span className="clr-red"> *</span>
                      </label>
                      <div className="d-flex justify-content-between">
                        <div className="d-inline-block d-flex flex-grow-1">
                          <Field
                            name={selectedAttribute.name}
                            isRequired={true}
                            component={DropdownField}
                            options={selectedAttribute.attributeValue}
                            optionLabel="name"
                            className="input-default col-12"
                            onValueChange={(e: any) => handleAttributeValuesChange(selectedAttribute, e)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mb-4">
              <Button
                type="button"
                label="Add Attribute Value"
                onClick={() => {
                  selectedAttributes.map((selectedAttribute) => setFieldValue(selectedAttribute.name, ''));
                  handleAddAttributeValue();
                }}
              />
            </div>

            <FieldArray
              name="productAttributes"
              render={(arrayHelpers) => (
                <div>
                  {combineAttributes && (
                    <div className="mb-4">
                      <AccordionTemplate
                        values={combineAttributes}
                        attribute={attributeValues}
                        store={store}
                        product={product}
                      />
                    </div>
                  )}
                </div>
              )}
            />

            <div className="mb-4 clr-red mt-2">
              {errorMessage && <ErrorMessage message={errorMessage} displayBlock={true} />}
            </div>

            <div className="my-4">
              {isSubmitting ? (
                <i className="pi pi-spin pi-spinner" />
              ) : (
                <Button label="Save" type="submit" disabled={isSubmitting} className="btn-positive" />
              )}
            </div>
          </Form>
        )}
      </Formik>
      {isCategoryFormVisible && (
        <AddOrEditCategoryForm
          store={store}
          category={{}}
          isEdit={false}
          onHide={handleCategoryFormHide}
          onSuccess={handleSavingSuccess}
        />
      )}
    </div>
  );
}
