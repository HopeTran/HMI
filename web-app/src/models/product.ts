import Category from "./category";
import ProductAttribute from "./productAttribute";
export default class Product {
  id: number = 0;
  storeId: number = 0;
  name: string = '';
  description: string = '';
  photo: string = '';
  price: number = 0;
  inventory: number = 0;
  isGeneralMeal: boolean = false;
  ratingScore: number = 0;
  categories: Array<Category> = [];
  photoUploadData?: any;
  productAttributes: Array<ProductAttribute> = [];
}
