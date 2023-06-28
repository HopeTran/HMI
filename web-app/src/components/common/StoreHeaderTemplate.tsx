import { useEffect, useState } from "react";

import CONSTANTS from "constants/common";
import { config } from "config";

import storeBackgroundDefault from "../../statics/images/store-bg-default.png";
import storeLogoDefault from "../../statics/images/store-logo-default.jpg";

export default function StoreHeaderTemplate() {
  const [storeInfo, setStoreInfo] = useState<any>()

  const storeLocalStorage:any = localStorage.getItem(CONSTANTS.STORAGE_KEY.STORE_INFO);

  useEffect(() => {
    setStoreInfo(JSON.parse(storeLocalStorage))
  }, [storeLocalStorage])
  return (
    <>
    {storeInfo && 
      <div className="storeInformationDetail d-flex"  style={{backgroundImage: `url(${storeInfo.photo ? `${config.imageServerUrl}/${storeInfo.photo}` : storeBackgroundDefault})` }}>
      <div  className="store-information-wrapper section d-flex justify-content-between align-items-end w-100">
        <div className="clr-white">
          <div className="d-flex mb-3">
            <img className="me-3" src={storeInfo.logo ? `${config.imageServerUrl}/${storeInfo.logo}`  : storeLogoDefault} width={50} height={50} alt="Store logo" />
            <div>
              <h3>{storeInfo && storeInfo.name}</h3>
              <p>{storeInfo && storeInfo.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    }
    </>
    
  )
}