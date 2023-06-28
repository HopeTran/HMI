import React, { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Row } from 'react-flexbox-grid';
import { Dialog } from 'primereact/dialog';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';

import hmiService from 'services/HomeMadeInn';
import { Field, FieldArray, Form, Formik } from 'formik';
import TextInput from 'components/common/TextInput';
import AttributeValues from 'models/attributeValues';

interface AttributesFormProps {
  attributes: any;
  isEdit: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const loadingStyle = { fontSize: '2em' };
const DIALOG_STYLE = { width: '450px' };

export default function AddOrEditAttributesForm({ attributes, isEdit, onHide, onSuccess }: AttributesFormProps) {
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [removeAttrValue, setRemoveAttrValue] = useState<AttributeValues[]>([])
  const intl = useIntl();

  const formRef = useRef<any>();

  const handleSaveClick = async (value: any, { resetForm }: any) => {
    if (!value.name.trim()) {
      setErrorMessage('Name is required');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    try {
      const attr = {
        id: value.id,
        label: value.label,
        name: value.name,
      };

      const attrValues = value.attributeValues.map((attrValue: any) => {
        return { id: attrValue.id, attributeId: value.id, name: attrValue.name };
      });

      if (isEdit) {
        await hmiService.updateAttribute(attr);
        await hmiService.updateAttributeValues(attrValues, value.id);       
      } else {
        await hmiService.addAttribute({...attr, attributeValues: attrValues});
      }
       if (removeAttrValue && removeAttrValue.length > 0 ) {
        removeAttrValue.map(async (item:any, index: number) => {
          await hmiService.deleteAttributeValues(item.attributeId, item.id);
        })
          
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

  const onRemoveAttrValue = (attrValue: AttributeValues) => {
    let data = [...removeAttrValue]
    data.push(attrValue)
    setRemoveAttrValue(data)
  }

  return (
    <Dialog
      className="platform-category-form"
      header={intl.formatMessage({
        id: 't-attributes',
        defaultMessage: 'Attributes',
      })}
      visible={true}
      onHide={onHide}
      style={DIALOG_STYLE}
    >
      <Formik initialValues={attributes} enableReinitialize={true} onSubmit={handleSaveClick} innerRef={formRef}>
        {(formikProps: any) => {
          return (
            <Form className="form-content-dialog form-group none-border-fields">
              <div className="attr-name-row mb-4">
                <label className="mb-2">
                  <FormattedMessage id="t-name" defaultMessage="Name" />
                </label>
                <Field
                  type="text"
                  component={TextInput}
                  name="name"
                  placeholder={intl.formatMessage({
                    id: 't-name',
                    defaultMessage: 'Attribute name',
                  })}
                />
              </div>
              <div className="attr-name-row mb-4">
                <label className="mb-2">
                  <FormattedMessage id="t-label" defaultMessage="Label" />
                </label>
                <Field
                  type="text"
                  component={TextInput}
                  name="label"
                  placeholder={intl.formatMessage({
                    id: 't-name',
                    defaultMessage: 'Attribute label',
                  })}
                />
              </div>
              <div>
                <p>
                  <FormattedMessage id="t-attr-values-" defaultMessage="Attribute Values" />
                </p>
                <FieldArray
                  name="attributeValues"
                  render={({ insert, remove, push }) => (
                    <div>
                      {formikProps.values.attributeValues?.length > 0 &&
                        formikProps.values?.attributeValues?.map((item: any, index: any) => (
                          <div className="d-md-flex justify-content-between gap-4 mb-2 align-items-center" key={index}>
                            <div className="col-md-1 d-flex d-md-inline-flex justify-content-between mb-3">
                              <label htmlFor={`attributeValues.${index}`}>#{index + 1}</label>
                              <a className="grid-img-action-btn cursor-pointer d-inline-block d-md-none"  onClick={() => onRemoveAttrValue(item)}>
                                <span className="pi pi-trash" onClick={() => remove(index)} />
                              </a>
                            </div>
                            <div className="col-md-9 d-flex gap-2 align-items-center">
                              <Field
                                name={`attributeValues.${index}.name`}
                                placeholder={intl.formatMessage({
                                  id: 't-attribute-values',
                                  defaultMessage: 'Attribute values',
                                })}
                                type="text"
                                component={TextInput}
                              />
                            </div>
                            <a className="grid-img-action-btn cursor-pointer d-none d-md-inline-block" onClick={() => onRemoveAttrValue(item)}>
                              <span className="pi pi-trash" onClick={() => remove(index)} />
                            </a>
                          </div>
                        ))}
                      <button type="button" className="btn-secondary p-2" onClick={() => push('')}>
                        <FormattedMessage id="t-add-more" defaultMessage="Add more" />
                      </button>
                    </div>
                  )}
                />
              </div>

              <Row end="xs" className="save mx-2 mt-4">
                {isLoading ? (
                  <div className="d-flex justify-content-center"><i className="pi pi-spin pi-spinner" style={loadingStyle} /></div>
                ) : (
                  <Button
                    label={intl.formatMessage({
                      id: 'c-save',
                      defaultMessage: 'Save',
                    })}
                    type="submit"
                    className="btn-positive mt-16 "
                  />
                )}
              </Row>
              <Row>
                <span className={'error-message'}>{errorMessage}</span>
              </Row>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
}
