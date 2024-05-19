export interface GetOrdersQueueFormatedResponse {
  number: string;
  status: string;
  userName: string;
}

export interface GetOrdersQueueFormatedViewModel {
  data: GetOrdersQueueFormatedResponse[];
  pagination: {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}
