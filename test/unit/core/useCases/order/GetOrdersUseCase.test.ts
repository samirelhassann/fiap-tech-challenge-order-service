import { describe, it, beforeEach, vi, expect } from "vitest";

import { PaginationParams } from "@/core/domain/base/PaginationParams";
import { PaginationResponse } from "@/core/domain/base/PaginationResponse";
import { Order } from "@/core/domain/entities/Order";
import { IOrderRepository } from "@/core/interfaces/repositories/IOrderRepository";
import { ICatalogService } from "@/core/interfaces/services/ICatalogService";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { IStatusService } from "@/core/interfaces/services/IStatusService";
import { IUserService } from "@/core/interfaces/services/IUserService";
import { GetOrdersUseCaseRequestDTO } from "@/core/useCases/order/dto/GetOrdersUseCaseDTO";
import { IOrderUseCase } from "@/core/useCases/order/IOrderUseCase";
import { OrderUseCase } from "@/core/useCases/order/OrderUseCase";
import { faker } from "@faker-js/faker";
import { makeOrder } from "@test/unit/adapters/factories/MakeOrder";

let orderRepository: IOrderRepository;
let userService: IUserService;
let catalogService: ICatalogService;
let statusService: IStatusService;
let paymentService: IPaymentService;
let sut: IOrderUseCase;

describe("GetOrdersUseCase", () => {
  beforeEach(() => {
    orderRepository = {
      findMany: vi.fn(),
    } as unknown as IOrderRepository;

    catalogService = {} as unknown as ICatalogService;

    statusService = {} as unknown as IStatusService;

    userService = {} as unknown as IUserService;

    paymentService = {} as unknown as IPaymentService;

    sut = new OrderUseCase(
      orderRepository,
      catalogService,
      userService,
      statusService,
      paymentService
    );
  });

  it("should return the orders correctly", async () => {
    const request: GetOrdersUseCaseRequestDTO = {
      params: new PaginationParams(1, 10),
      userId: faker.string.uuid(),
    };

    const orders = [makeOrder(), makeOrder()];

    const paginationResponse = new PaginationResponse<Order>({
      data: orders,
      currentPage: 1,
      totalPages: 1,
      totalItems: 2,
      pageSize: request.params.size,
    });

    vi.mocked(orderRepository.findMany).mockResolvedValueOnce(
      paginationResponse
    );

    const response = await sut.getOrders(request);

    expect(orderRepository.findMany).toHaveBeenCalledWith(
      request.params,
      request.userId
    );
    expect(response).toEqual({ paginationResponse });
  });

  it("should return the orders from the second pagination correctly", async () => {
    const request: GetOrdersUseCaseRequestDTO = {
      params: new PaginationParams(2, 10),
      userId: faker.string.uuid(),
    };

    const orders = [makeOrder(), makeOrder()];

    const paginationResponse = new PaginationResponse<Order>({
      data: orders,
      currentPage: 2,
      totalPages: 1,
      totalItems: 2,
      pageSize: request.params.size,
    });

    vi.mocked(orderRepository.findMany).mockResolvedValueOnce(
      paginationResponse
    );

    const response = await sut.getOrders(request);

    expect(orderRepository.findMany).toHaveBeenCalledWith(
      request.params,
      request.userId
    );
    expect(response).toEqual({ paginationResponse });
  });
});
