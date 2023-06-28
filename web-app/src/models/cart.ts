import Product from "./product";

export default class Cart {
  userId: string = '';
  productId: number = 0;
  quantity:number = 0;
  product: Array<Product> = [];
}