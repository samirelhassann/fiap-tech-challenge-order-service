import {
  CreateOrderUseCaseRequestDTO,
  CreateOrderUseCaseResponseDTO,
} from "./dto/CreateOrderUseCaseDTO";
import {
  GetOrderByIdUseCaseRequestDTO,
  GetOrderByIdUseCaseResponseDTO,
} from "./dto/GetOrderByIdUseCaseDTO";
import {
  GetOrdersUseCaseRequestDTO,
  GetOrdersUseCaseResponseDTO,
} from "./dto/GetOrdersUseCaseDTO";

export interface IOrderUseCase {
  getOrders(
    props: GetOrdersUseCaseRequestDTO
  ): Promise<GetOrdersUseCaseResponseDTO>;

  getOrderById(
    props: GetOrderByIdUseCaseRequestDTO
  ): Promise<GetOrderByIdUseCaseResponseDTO>;

  createOrder(
    props: CreateOrderUseCaseRequestDTO
  ): Promise<CreateOrderUseCaseResponseDTO>;
}
