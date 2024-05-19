import { GetComboByIdResponse } from "@/adapters/services/catalogService/model/GetComboByIdResponse";
import { GetUserByIdResponse } from "@/adapters/services/catalogService/model/GetUserByIdResponse";
import { Order } from "@/core/domain/entities/Order";
import { OrderComboItem } from "@/core/domain/entities/OrderComboItem";

export interface GetOrderByIdUseCaseRequestDTO {
  id: string;
}

export interface GetOrderByIdUseCaseResponseDTO {
  order: Order;
  orderCombos: OrderComboItem[];
  combos: GetComboByIdResponse[];
  userDetails?: GetUserByIdResponse;
}
