import { capitalize, findIndex, toUpper } from 'lodash';
import moment from 'moment';
import { Dialog } from 'primereact/dialog';
import { useEffect, useState } from 'react';

import { config } from 'config';
import StoreMap from './StoreMap';

import ratingIcon from "../../statics/images/ratingIcon.svg";
import storeLogoDefault from "../../statics/images/store-logo-default.jpg";
import locationIcon from "../../statics/images/icons/locationIcon.png";
import timeIcon from "../../statics/images/icons/timeIcon.png";

interface Props {
  appendTo?: HTMLElement;
  header?: string;
  acceptText?: string;
  dismissText?: string;
  visible: boolean;
  message?: string;
  messageAlignment?: string;
  onAccept?: any;
  onDismiss?: any;
  onHide?: any;
  width?: string;
  errorMsg?: string;
  disabled?: boolean;
  loading?: boolean;
  storeInfo: any;
}

const DIALOG_STYLE = { width: '550px' };

function ViewMoreStoreInformationDialog(props: Props) {
  
  const [storeInfo, setStoreInfo] = useState<any>();
  const [openingTimesVisible, setOpeningTimesVisible] = useState(false);

  const handleDialogHide = () => {
    if (props.onDismiss) {
      props.onDismiss();
    }
    if (props.onHide) {
      props.onHide();
    }
  };

  const onHandleToggleOpeningTimes = () => {
    setOpeningTimesVisible(!openingTimesVisible)
  }

  const onHandleOperationTimes = (operationTimes:any) => {
    const currentWeekDay = moment().format('ddd');
    const findWeekDayIndex = findIndex(operationTimes, {'weekDay': toUpper(currentWeekDay)})
    if (findWeekDayIndex > 0) {
      return (
        <span className="font-bold">
          Open Until {moment(operationTimes[findWeekDayIndex].availableTo, "hh").format('LT')} 
        </span>
      )
    } else {
      return(
        <span className="font-bold">
          Do not open today
        </span>
      ) 
    }
    
  }

  useEffect(() => {
    setStoreInfo(props.storeInfo);
  }, [props.storeInfo])

  return (
    <Dialog
      appendTo={document.body}
      visible={props.visible}
      style={props.width ? { width: props.width } : DIALOG_STYLE}
      onHide={handleDialogHide}
      maximizable={false}
      className="confirm-dialog"
      closeOnEscape={true}
      closable={true}
    >
      {storeInfo && 
        <div className="store-information-popup p-2">
         <div className="d-flex justify-content-between align-items-start mb-4">
            <div className="d-flex">
              <img className="me-3" src={storeInfo.logo ? `${config.imageServerUrl}/${storeInfo.logo}`  : storeLogoDefault} width={50} height={50} alt="Store logo" />
              <div>
                <h3>{storeInfo.name}</h3>
                <p>{storeInfo.name}</p>
              </div>
            </div>
            {storeInfo.ratingScore &&
              <div className="rating d-flex align-items-center mb-4">
                <img src={ratingIcon} alt="ratingIcon" className="me-2"/> 
                <span className="font-bold">{storeInfo.ratingScore}</span>
              </div>
            }
          </div>
          <div className="platform-category-list mb-4 pb-2">
            {storeInfo.platformCategories.length > 0 && 
              storeInfo.platformCategories.map((item:any, index: number) => {
                return (
                  <span className="me-3" key={index}>{item.name}</span>
                )
              })
            }
          </div>
          <hr />
          <div className="d-flex my-4 gap-3 pt-2">
            <img src={locationIcon} alt="ratingIcon"/> 
            <span className="font-bold">{storeInfo.address}, {storeInfo.countryCode}</span>
          </div>
          <div className="d-flex mb-4 gap-3 cursor-pointer align-items-center" onClick={onHandleToggleOpeningTimes}>            
            <img src={timeIcon} alt="tiemIcon" className="me-1"/>
            <div>
              {onHandleOperationTimes(storeInfo.operationTimes)}
            </div>
            <i className={`pi ${openingTimesVisible ? `pi-angle-up` : `pi-angle-down`}`} />
          </div>
          <div className={`w-50 openingTimes mb-4 ${openingTimesVisible ? 'show': 'hide'}`}>
            {storeInfo.operationTimes?.map((item: any, index: number) => {
              return (
                <div key={index}>
                  <div className="d-flex align-items-start" >
                    <p className="font-bold col-md-3">{capitalize(item.weekDay)}</p>
                    <p className="col-md-9">{moment(item.availableFrom, 'hh').format('LT')} - {moment(item.availableTo, 'hh').format('LT')} </p>                    
                  </div>
                </div>
              )
            })}
          </div>
          
          <StoreMap />
        
        </div>
      }
    </Dialog>
  );
}

export default ViewMoreStoreInformationDialog;
