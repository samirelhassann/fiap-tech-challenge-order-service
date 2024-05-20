import { describe, it, beforeEach, vi, expect } from "vitest";

import { CreatePaymentRequest } from "@/adapters/services/paymentService/model/CreatePaymentRequest";
import { CreatePaymentResponse } from "@/adapters/services/paymentService/model/CreatePaymentResponse";
import { UniqueEntityId } from "@/core/domain/base/entities/UniqueEntityId";
import { UnsupportedArgumentValueError } from "@/core/domain/base/errors/entities/UnsupportedArgumentValueError";
import { MinimumResourcesNotReached } from "@/core/domain/base/errors/useCases/MinimumResourcesNotReached";
import { Order } from "@/core/domain/entities/Order";
import { OrderComboItem } from "@/core/domain/entities/OrderComboItem";
import { OrderComboItemList } from "@/core/domain/entities/OrderComboItemList";
import { OrderStatusEnum } from "@/core/domain/enums/OrderStatusEnum";
import { IOrderRepository } from "@/core/interfaces/repositories/IOrderRepository";
import { ICatalogService } from "@/core/interfaces/services/ICatalogService";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { IStatusService } from "@/core/interfaces/services/IStatusService";
import { IUserService } from "@/core/interfaces/services/IUserService";
import { CreateOrderUseCaseRequestDTO } from "@/core/useCases/order/dto/CreateOrderUseCaseDTO";
import { IOrderUseCase } from "@/core/useCases/order/IOrderUseCase";
import { OrderUseCase } from "@/core/useCases/order/OrderUseCase";
import { faker } from "@faker-js/faker";

let orderRepository: IOrderRepository;
let userService: IUserService;
let catalogService: ICatalogService;
let statusService: IStatusService;
let paymentService: IPaymentService;
let sut: IOrderUseCase;

describe("CreateOrderUseCase", () => {
  beforeEach(() => {
    orderRepository = {
      create: vi.fn(),
    } as unknown as IOrderRepository;

    catalogService = {
      createCombo: vi.fn(),
    } as unknown as ICatalogService;

    statusService = {
      updateOrderStatus: vi.fn(),
    } as unknown as IStatusService;

    userService = {} as unknown as IUserService;

    paymentService = {
      createPayment: vi.fn(),
    } as unknown as IPaymentService;

    sut = new OrderUseCase(
      orderRepository,
      catalogService,
      userService,
      statusService,
      paymentService
    );
  });

  it("should create an order correctly", async () => {
    const userId = faker.string.uuid();
    const visitorName = faker.person.fullName();
    const combos = [
      {
        sandwichId: faker.string.uuid(),
        dessertId: faker.string.uuid(),
        sideId: faker.string.uuid(),
        drinkId: faker.string.uuid(),
        quantity: 1,
        annotation: faker.lorem.sentence(),
      },
    ];
    const paymentMethod = "QR_CODE";

    const request: CreateOrderUseCaseRequestDTO = {
      userId,
      visitorName,
      combos,
      paymentMethod,
    };

    const createdCombo = {
      id: faker.string.uuid(),
      name: faker.lorem.word(),
      description: faker.lorem.sentence(),
      price: faker.number.float(),
      createdAt: faker.date.recent().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      products: [],
    };

    vi.mocked(catalogService.createCombo).mockResolvedValueOnce(createdCombo);

    const createdOrder = new Order({
      userId: new UniqueEntityId(userId),
      visitorName,
      totalPrice: createdCombo.price,
    });

    createdOrder.combos = new OrderComboItemList([
      new OrderComboItem({
        comboId: new UniqueEntityId(createdCombo.id),
        annotation: combos[0].annotation,
        orderId: createdOrder.id,
        quantity: combos[0].quantity,
        totalPrice: createdCombo.price,
      }),
    ]);

    vi.mocked(orderRepository.create).mockResolvedValueOnce(createdOrder);

    const createPaymentRequest: CreatePaymentRequest = {
      orderId: createdOrder.id.toString(),
      combos: [
        {
          id: createdCombo.id,
          name: createdCombo.name,
          description: createdCombo.description,
          price: createdCombo.price,
          quantity: combos[0].quantity,
        },
      ],
    };

    const createPaymentResponse: CreatePaymentResponse = {
      paymentDetails: faker.lorem.sentence(),
    };

    vi.mocked(paymentService.createPayment).mockResolvedValueOnce(
      createPaymentResponse
    );

    await sut.createOrder(request);

    expect(catalogService.createCombo).toHaveBeenCalledWith({
      sandwichId: combos[0].sandwichId,
      dessertId: combos[0].dessertId,
      sideId: combos[0].sideId,
      drinkId: combos[0].drinkId,
    });
    // expect(orderRepository.create).toHaveBeenCalledWith(createdOrder);
    expect(paymentService.createPayment).toHaveBeenCalledWith({
      ...createPaymentRequest,
      combos: createPaymentRequest.combos.map((combo) => ({
        ...combo,
        price: Math.round(combo.price * 100) / 100,
      })),
    });
    expect(statusService.updateOrderStatus).toHaveBeenCalledWith({
      orderId: createdOrder.id.toString(),
      status: OrderStatusEnum.PENDING_PAYMENT,
    });
  });

  it("should throw an error if no combos are provided", async () => {
    const request: CreateOrderUseCaseRequestDTO = {
      userId: faker.string.uuid(),
      visitorName: faker.person.fullName(),
      combos: [],
      paymentMethod: "QR_CODE",
    };

    await expect(sut.createOrder(request)).rejects.toThrow(
      MinimumResourcesNotReached
    );
  });

  it("should throw an error if payment method is unsupported", async () => {
    const request: CreateOrderUseCaseRequestDTO = {
      userId: faker.string.uuid(),
      visitorName: faker.person.fullName(),
      combos: [
        {
          sandwichId: faker.string.uuid(),
          dessertId: faker.string.uuid(),
          sideId: faker.string.uuid(),
          drinkId: faker.string.uuid(),
          quantity: 1,
          annotation: faker.lorem.sentence(),
        },
      ],
      paymentMethod: "unsupported_method",
    };

    await expect(sut.createOrder(request)).rejects.toThrow(
      UnsupportedArgumentValueError
    );
  });

  it("should throw an error if neither userId nor visitorName are provided", async () => {
    const request: CreateOrderUseCaseRequestDTO = {
      userId: undefined,
      visitorName: undefined,
      combos: [
        {
          sandwichId: faker.string.uuid(),
          dessertId: faker.string.uuid(),
          sideId: faker.string.uuid(),
          drinkId: faker.string.uuid(),
          quantity: 1,
          annotation: faker.lorem.sentence(),
        },
      ],
      paymentMethod: "QR_CODE",
    };

    await expect(sut.createOrder(request)).rejects.toThrow(
      MinimumResourcesNotReached
    );
  });
});
