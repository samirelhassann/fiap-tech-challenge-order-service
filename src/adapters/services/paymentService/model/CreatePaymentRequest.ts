export interface CreatePaymentRequest {
  orderId: string;
  combos: {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
  }[];
}
