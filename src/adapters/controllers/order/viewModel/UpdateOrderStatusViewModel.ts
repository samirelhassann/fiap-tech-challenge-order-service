export interface UpdateOrderStatusViewModel {
  id: string;
  status: string;
  userId?: string;
  visitorName?: string;
  paymentMethod: string;
  totalPrice: number;
  createdAt: string;
  updatedAt?: string;
}
