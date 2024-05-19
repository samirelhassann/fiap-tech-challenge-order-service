export interface GetOrderByIdViewModel {
  id: string;
  number: string;
  user?: {
    id: string;
    name: string;
  };
  visitorName?: string;
  totalPrice: number;
  createdAt: string;
  updatedAt?: string;
  combos: {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    annotation?: string;
    products: {
      id: string;
      name: string;
      description: string;
      price: number;
    }[];
  }[];
}
