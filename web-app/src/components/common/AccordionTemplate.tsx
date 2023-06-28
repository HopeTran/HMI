import React, { useRef, useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Field } from 'formik';
import TextInput from 'components/common/TextInput';
import { FormattedMessage } from 'react-intl';
import { STORE_CURRENCY } from 'constants/common';
import { findIndex } from 'lodash';
import { config } from 'config';

interface Props {
  values: any;
  store?: any;
  product?: any;
  attribute?: any;
}

export default function AccordionTemplate(props: Props) {
  const [selectedPhoto, setSelectedPhoto] = useState<any>();
  const fileUploadRef = useRef<HTMLInputElement>(null);
  console.log('ATTR: ', props.attribute);

  const handleFileUploadChange = (event: any) => {
    if (event.target.files[0]) {
      setSelectedPhoto(event.target.files[0]);
    }
  };

  const searchCurrency = (currency: any) => {
    const findIndexCurrency = findIndex(STORE_CURRENCY, (item: any) => {
      return item.value === currency;
    });
    return STORE_CURRENCY[findIndexCurrency];
  };

  return (
    <div className="">
      <Accordion>
        {props.values &&
          props.values.map((attributeValues: any, index: any) => {
            console.log(attributeValues);
            var title: string = '';
            attributeValues.forEach(function (attributeValue: any) {
              title += attributeValue.attribute.name + ':' + attributeValue.values.name + '. ';
            });

            return (
              <AccordionTab header={title}>
                <div className="mb-4">
                  <Field
                    type="number"
                    name={`productAttributes.${index}.price`}
                    className="p-inputtext"
                    component={TextInput}
                    label={`Price in ${props.store.currency ? searchCurrency(props.store.currency).symbol : '$'}`}
                  />
                </div>

                <div className="mb-4">
                  <Field
                    type="text"
                    name={`productAttributes.${index}.inventory`}
                    className="p-inputtext"
                    component={TextInput}
                    label="Inventory"
                  />
                </div>

                <div className="mb-4">
                  <Field
                    type="textarea"
                    name={`productAttributes.${index}.description`}
                    className="p-inputtext"
                    component={TextInput}
                    label="Description"
                  />
                </div>

                <div className="d-inline-block w-100 relative mb-2">
                  <p className="input-label me-2">
                    <FormattedMessage id="t-photo" defaultMessage="Photo" />
                  </p>
                  {!selectedPhoto && props.product?.photo && props.product?.photo !== '' && (
                    <div>
                      <img
                        className="img-preview mb-2"
                        width={300}
                        src={`${config.imageServerUrl}/${props.product?.photo}`}
                      />
                    </div>
                  )}
                  {selectedPhoto && (
                    <div>
                      <img className="img-preview mb-2" width={300} src={URL.createObjectURL(selectedPhoto)} />
                    </div>
                  )}
                  <input
                    name={`productAttributes.${index}.photo`}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUploadChange}
                    ref={fileUploadRef}
                  />
                </div>
              </AccordionTab>
            );
          })}
      </Accordion>
    </div>
  );
}
