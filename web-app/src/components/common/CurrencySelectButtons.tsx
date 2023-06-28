import CONSTANTS from "constants/common";
import { SUPPORTED_CURRENCY_EXPONENT } from "constants/constant";
import { toUpper } from "lodash";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import FormattedDecimalNumber from "./FormattedDecimalNumber";

export default function CurrencySelectButtons () {
  const [btcBgrColor, setBtcBgrColor] = useState(CONSTANTS.CURRENCY.BTC);
  const [cryptoPrice, setCryptoPrice] = useState<any>();
  const [btcPrice, setBTCPrice] = useState<any>();
  const [ethPrice, setETHPrice] = useState<any>();

  const dispatch = useDispatch();

  var ws = new WebSocket('wss://www.deribit.com/ws/api/v2');
  ws.onopen = function (event) { 
    ws.send(JSON.stringify({
      jsonrpc: 2.0,
      id: 3600,
      method: "public/subscribe",
      params: {
          channels: [
              "deribit_price_index.btc_usd",
              "deribit_price_index.eth_usd"
          ]
        }
    })); 
  }; 

  ws.onmessage = function(event){
    var server_message =  JSON.parse(event.data);
    var data = server_message?.params?.data
    setCryptoPrice(data);
  }

  useEffect(() => {
    const currStorage = localStorage.getItem("currency");
    if (currStorage) {
      dispatch({type: 'currency', currency: currStorage});
      setBtcBgrColor(currStorage)
    }
  }, []);
  
  useEffect(() => {
    if (cryptoPrice) {
      if (cryptoPrice.index_name === 'eth_usd') {
        setETHPrice(cryptoPrice.price)
      } else {
        setBTCPrice(cryptoPrice.price)
      }
    }
  }, [cryptoPrice])


  const onHandleClick = (currency: any) => {
    dispatch({type: 'currency', currency: currency});
    localStorage.setItem("currency", currency ? currency : CONSTANTS.CURRENCY.BTC);
    setBtcBgrColor(currency)
  }
  
  return (
    <div className='d-flex mx-4 mb-5'>
      <div className={`btn-secondary currency-btn me-4 ${btcBgrColor === CONSTANTS.CURRENCY.BTC ? 'btn-active' : ''}`} onClick={() => onHandleClick(CONSTANTS.CURRENCY.BTC)}>
        <p className="text-small">BTC</p>
        {btcPrice ? 
          <p className="text-xxxsmall">$ <FormattedDecimalNumber value={btcPrice} maximumFractionDigits={SUPPORTED_CURRENCY_EXPONENT[toUpper(CONSTANTS.CURRENCY.USD)]}/></p>
          : 
          <p className="text-xxxsmall">$ 0,00  <i className="pi pi-spin pi-spinner" style={{'fontSize': '0.5em'}}></i></p>
        }
        </div>
      <div className={`btn-secondary currency-btn me-4 ${btcBgrColor === CONSTANTS.CURRENCY.ETH ? 'btn-active' : ''}`} onClick={() => onHandleClick(CONSTANTS.CURRENCY.ETH)}>
        <p className="text-small">ETH</p>
        {ethPrice ? 
          <p className="text-xxxsmall">$ <FormattedDecimalNumber value={ethPrice} maximumFractionDigits={SUPPORTED_CURRENCY_EXPONENT[toUpper(CONSTANTS.CURRENCY.USD)]}/></p>
          : 
          <p className="text-xxxsmall">$ 0,00  <i className="pi pi-spin pi-spinner" style={{'fontSize': '0.5em'}}></i></p>
        }
        </div>
    </div>
  )
}