import Product from "./product";

export default class Category {
  id: number = 0;
  name: string = '';
  products: Array<Product> = [];
}