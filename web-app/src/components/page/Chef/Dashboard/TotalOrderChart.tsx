import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";

import ProfitChart from "components/common/ProfitChart";
import Store from "models/store";
import hmiService from 'services/HomeMadeInn';

export default function TotalOrderChart(props: RouteComponentProps) {
  const [totalOrder, setTotalOrder] = useState<any>();
  
  const getGrossSales = async() => {
    const stores: Store[] = await hmiService.getStores();
    const store: Store = stores[0];
    if (store) {
      const data = await hmiService.getProfitSummary({storeId: store?.id, typeProfit: 'total', timeProfit: '14'});
      setTotalOrder(data);
    } 
  };

  useEffect(() => {
    getGrossSales();
  }, []);

  return (
    <div>
      <ProfitChart data={totalOrder} type="total"/>
    </div>
  )
}