import OrderDetail from "./orderDetail";
import Store from "./store";

export default class Order {
  id: string = '';
  userId: string = '';
  storeId: number = 0;
  subtotal:number = 0;
  status: string = '';;
  note: string = '';
  rating:number = 0;
  createAt: Date = new Date();
  updateAt: Date = new Date();
  deleteAt: Date = new Date();
  customerAddress: string = '';
  customerPhone: string = '';
  customerName: string = '';
  total: number = 0;
  deliveryFee: number = 0;
  discount: number = 0;
  discountCode: string = '';
  cancelReason: string = '';
  orderDetails: Array<OrderDetail> = [];
  store: Array<Store> = [];

}