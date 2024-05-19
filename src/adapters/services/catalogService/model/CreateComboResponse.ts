export interface CreateComboResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}
