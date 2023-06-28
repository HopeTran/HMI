import moment from "moment";

import { DELIVERYTIMERANGES, DELIVERY_TYPES, SORTVALUES } from "constants/common";
import { toUpper } from "lodash";

export default class StoresFilter {
  deliveryAddress: string = '';
  deliveryEndTime: string = '23:59:59';
  deliveryStartTime: string = moment().format('HH:mm:ss');
  deliveryType: string = DELIVERY_TYPES[0].value;
  pickedDate: string = moment().format('MMM Do');
  weekDay: string = toUpper(moment().format('ddd'));
  sortValue: any = SORTVALUES[0];
  availableTime: any = DELIVERYTIMERANGES[0];
  priceFrom: number = 0;
  priceTo: number = 10000;
  ratingValue: number = 0;
  cuisines: string[] = [];
  latitude: number = 16.0738815; //default latitude: 22 Le Thanh Ton
  longitude: number = 108.2167108;
  currency: string ='';
}