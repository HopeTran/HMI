import category from "./category";
import OperationTime from "./operationTime";

export default class Store {
    id: number = 0;
    userId: string = '';
    name: string = '';
    logo: string = '';
    description: string = '';
    photo: string = '';
    address: string = '';
    countryCode: string = '';
    generalAvailableFrom: string = '';
    generalAvailableTo: string = '';
    operationTimes: Array<OperationTime> = [];
    platformCategories: Array<any> = [];
    cuisines: Array<any> = [];
    ratingScore: any;
    categories: Array<category> = [];
    longitude: number = 0;
    latitude: number = 0;
    currency: string = '';
}
