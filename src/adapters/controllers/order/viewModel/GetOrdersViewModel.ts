export interface GetOrdersResponse {
  id: string;
  number: string;
  userId?: string;
  visitorName?: string;
  totalPrice: number;
  createdAt: string;
  updatedAt?: string;
}

export interface GetOrdersViewModel {
  data: GetOrdersResponse[];
  pagination: {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}
