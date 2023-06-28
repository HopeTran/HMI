import Product from "./product";

export default class OrderDetail {
  orderId: string = '';
  productId: number = 0;
  quantity:number = 0;
  price: number = 0;
  product: Array<Product> = [];
}