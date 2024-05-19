/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */

import { IOrderRepository } from "@/core/interfaces/repositories/IOrderRepository";
import { ICatalogService } from "@/core/interfaces/services/ICatalogService";
import { IUserService } from "@/core/interfaces/services/IUserService";

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
import { CreateOrderUseCase } from "./implementations/CreateOrderUseCase";
import { GetOrderByIdUseCase } from "./implementations/GetOrderByIdUseCase";
import { GetOrdersUseCase } from "./implementations/GetOrdersUseCase";
import { IOrderUseCase } from "./IOrderUseCase";

export class OrderUseCase implements IOrderUseCase {
  private createOrderUseCase: CreateOrderUseCase;

  private getOrdersUseCase: GetOrdersUseCase;

  private getOrderByIdUseCase: GetOrderByIdUseCase;

  constructor(
    private orderRepository: IOrderRepository,
    private catalogService: ICatalogService,
    private userService: IUserService
  ) {
    this.createOrderUseCase = new CreateOrderUseCase(
      orderRepository,
      catalogService
    );
    this.getOrdersUseCase = new GetOrdersUseCase(orderRepository);
    this.getOrderByIdUseCase = new GetOrderByIdUseCase(
      orderRepository,
      catalogService,
      userService
    );
  }

  async createOrder(
    props: CreateOrderUseCaseRequestDTO
  ): Promise<CreateOrderUseCaseResponseDTO> {
    return this.createOrderUseCase.execute(props);
  }

  async getOrders(
    props: GetOrdersUseCaseRequestDTO
  ): Promise<GetOrdersUseCaseResponseDTO> {
    return this.getOrdersUseCase.execute(props);
  }

  async getOrderById(
    props: GetOrderByIdUseCaseRequestDTO
  ): Promise<GetOrderByIdUseCaseResponseDTO> {
    return this.getOrderByIdUseCase.execute(props);
  }
}
