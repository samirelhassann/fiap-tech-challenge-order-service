import { describe, it, beforeEach, vi, expect } from "vitest";

import { GetUserByIdResponse } from "@/adapters/services/userService/model/GetUserByIdResponse";
import { UniqueEntityId } from "@/core/domain/base/entities/UniqueEntityId";
import { ResourceNotFoundError } from "@/core/domain/base/errors/useCases/ResourceNotFoundError";
import { Order } from "@/core/domain/entities/Order";
import { OrderComboItem } from "@/core/domain/entities/OrderComboItem";
import { OrderComboItemList } from "@/core/domain/entities/OrderComboItemList";
import { IOrderRepository } from "@/core/interfaces/repositories/IOrderRepository";
import { ICatalogService } from "@/core/interfaces/services/ICatalogService";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { IStatusService } from "@/core/interfaces/services/IStatusService";
import { IUserService } from "@/core/interfaces/services/IUserService";
import { GetOrderByIdUseCaseRequestDTO } from "@/core/useCases/order/dto/GetOrderByIdUseCaseDTO";
import { IOrderUseCase } from "@/core/useCases/order/IOrderUseCase";
import { OrderUseCase } from "@/core/useCases/order/OrderUseCase";
import { faker } from "@faker-js/faker";

let orderRepository: IOrderRepository;
let catalogService: ICatalogService;
let userService: IUserService;
let statusService: IStatusService;
let paymentService: IPaymentService;
let sut: IOrderUseCase;

describe("GetOrderByIdUseCase", () => {
  beforeEach(() => {
    orderRepository = {
      findById: vi.fn(),
    } as unknown as IOrderRepository;

    catalogService = {
      getComboById: vi.fn(),
    } as unknown as ICatalogService;

    statusService = {
      updateOrderStatus: vi.fn(),
    } as unknown as IStatusService;

    userService = {
      getUserById: vi.fn(),
    } as unknown as IUserService;

    paymentService = {} as unknown as IPaymentService;

    sut = new OrderUseCase(
      orderRepository,
      catalogService,
      userService,
      statusService,
      paymentService
    );
  });

  it("should return order details by id", async () => {
    const orderId = faker.string.uuid();
    const userId = faker.string.uuid();

    const order = new Order({
      userId: new UniqueEntityId(userId),
      visitorName: faker.person.fullName(),
      totalPrice: faker.number.float(),
    });

    const comboId = faker.string.uuid();

    order.combos = new OrderComboItemList([
      new OrderComboItem({
        comboId: new UniqueEntityId(comboId),
        annotation: faker.lorem.sentence(),
        orderId: order.id,
        quantity: 1,
        totalPrice: faker.number.float(),
      }),
    ]);

    const comboDetails = {
      id: comboId,
      name: faker.lorem.word(),
      description: faker.lorem.sentence(),
      price: faker.number.float(),
      createdAt: faker.date.recent().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      products: [],
    };

    const userDetails: GetUserByIdResponse = {
      id: userId,
      name: faker.person.fullName(),
      taxVat: faker.string.uuid(),
      email: faker.internet.email(),
      createdAt: faker.date.recent().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    };

    vi.mocked(orderRepository.findById).mockResolvedValueOnce(order);
    vi.mocked(catalogService.getComboById).mockResolvedValueOnce(comboDetails);
    vi.mocked(userService.getUserById).mockResolvedValueOnce(userDetails);

    const request: GetOrderByIdUseCaseRequestDTO = { id: orderId };

    const response = await sut.getOrderById(request);

    expect(orderRepository.findById).toHaveBeenCalledWith(orderId);
    expect(catalogService.getComboById).toHaveBeenCalledWith(comboId);
    expect(userService.getUserById).toHaveBeenCalledWith(userId);
    expect(response).toEqual({
      order,
      orderCombos: order.combos.getItems(),
      combos: [comboDetails],
      userDetails,
    });
  });

  it("should throw an error if order not found", async () => {
    const orderId = faker.string.uuid();

    vi.mocked(orderRepository.findById).mockResolvedValueOnce(null);

    const request: GetOrderByIdUseCaseRequestDTO = { id: orderId };

    await expect(sut.getOrderById(request)).rejects.toThrow(
      ResourceNotFoundError
    );
    expect(orderRepository.findById).toHaveBeenCalledWith(orderId);
  });
});
