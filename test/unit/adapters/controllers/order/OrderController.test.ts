import { FastifyReply, FastifyRequest } from "fastify";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { OrderController } from "@/adapters/controllers/order/OrderController";
import { CreateOrderPresenter } from "@/adapters/presenters/order/CreateOrderPresenter";
import { GetOrderByIdPresenter } from "@/adapters/presenters/order/GetOrderByIdPresenter";
import { GetOrdersPresenter } from "@/adapters/presenters/order/GetOrdersPresenter";
import { PaginationParams } from "@/core/domain/base/PaginationParams";
import { PaginationResponse } from "@/core/domain/base/PaginationResponse";
import {
  CreateOrderUseCaseRequestDTO,
  CreateOrderUseCaseResponseDTO,
} from "@/core/useCases/order/dto/CreateOrderUseCaseDTO";
import {
  GetOrderByIdUseCaseRequestDTO,
  GetOrderByIdUseCaseResponseDTO,
} from "@/core/useCases/order/dto/GetOrderByIdUseCaseDTO";
import {
  GetOrdersUseCaseRequestDTO,
  GetOrdersUseCaseResponseDTO,
} from "@/core/useCases/order/dto/GetOrdersUseCaseDTO";
import { IOrderUseCase } from "@/core/useCases/order/IOrderUseCase";
import { faker } from "@faker-js/faker";

import { makeOrder } from "../../factories/MakeOrder";

let req: FastifyRequest;
let res: FastifyReply;
let orderController: OrderController;
let orderUseCase: IOrderUseCase;
let createOrderPresenter: CreateOrderPresenter;
let getOrderByIdPresenter: GetOrderByIdPresenter;
let getOrdersPresenter: GetOrdersPresenter;

beforeEach(() => {
  orderUseCase = {
    createOrder: vi.fn(),
    getOrderById: vi.fn(),
    getOrders: vi.fn(),
  };

  createOrderPresenter = {
    convertToViewModel: vi.fn(),
    convertToUseCaseDTO: vi.fn(),
    sendResponse: vi.fn(),
    convertErrorResponse: vi.fn(),
  };

  getOrderByIdPresenter = {
    convertToViewModel: vi.fn(),
    convertToUseCaseDTO: vi.fn(),
    sendResponse: vi.fn(),
    convertErrorResponse: vi.fn(),
  };

  getOrdersPresenter = {
    convertToViewModel: vi.fn(),
    convertToUseCaseDTO: vi.fn(),
    sendResponse: vi.fn(),
    convertErrorResponse: vi.fn(),
  };

  orderController = new OrderController(
    orderUseCase,
    getOrdersPresenter,
    createOrderPresenter,
    getOrderByIdPresenter
  );

  req = {} as FastifyRequest;
  res = {
    code: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;
});

describe("OrderController", () => {
  describe("getOrders", () => {
    it("should call getOrders use case and send response", async () => {
      const useCaseRequest: GetOrdersUseCaseRequestDTO = {
        params: new PaginationParams(1, 10),
        status: faker.lorem.word(),
        userId: faker.string.uuid(),
      };

      const mockedUser = makeOrder();
      const useCaseResponse: GetOrdersUseCaseResponseDTO = {
        paginationResponse: new PaginationResponse({
          currentPage: faker.number.int(),
          data: [mockedUser],
          pageSize: faker.number.int(),
          totalItems: faker.number.int(),
          totalPages: faker.number.int(),
        }),
      };

      vi.spyOn(getOrdersPresenter, "convertToUseCaseDTO").mockReturnValueOnce(
        useCaseRequest
      );
      vi.spyOn(orderUseCase, "getOrders").mockResolvedValueOnce(
        useCaseResponse
      );

      await orderController.getOrders(req, res);

      expect(orderUseCase.getOrders).toHaveBeenCalledWith(useCaseRequest);
      expect(getOrdersPresenter.sendResponse).toHaveBeenCalledWith(
        res,
        useCaseResponse
      );
    });

    it("should handle errors and send error response", async () => {
      const error = new Error("GetOrders error");
      vi.spyOn(orderUseCase, "getOrders").mockRejectedValueOnce(error);

      await orderController.getOrders(req, res);

      expect(getOrdersPresenter.convertErrorResponse).toHaveBeenCalledWith(
        error,
        res
      );
    });
  });

  describe("getOrderById", () => {
    it("should call getOrderById use case and send response", async () => {
      const useCaseRequest: GetOrderByIdUseCaseRequestDTO = {
        id: faker.string.uuid(),
      };

      const orderMock = makeOrder();
      const useCaseResponse: GetOrderByIdUseCaseResponseDTO = {
        order: orderMock,
        orderCombos: [],
        combos: [
          {
            createdAt: faker.date.recent().toDateString(),
            description: faker.lorem.sentence(),
            id: faker.string.uuid(),
            name: faker.lorem.word(),
            price: faker.number.float(),
            updatedAt: faker.date.recent().toDateString(),
            products: [
              {
                id: faker.string.uuid(),
                name: faker.lorem.word(),
                description: faker.lorem.sentence(),
                price: faker.number.float(),
                category: faker.lorem.word(),
                createdAt: faker.date.recent().toDateString(),
                updatedAt: faker.date.recent().toDateString(),
              },
            ],
          },
        ],
      };

      vi.spyOn(
        getOrderByIdPresenter,
        "convertToUseCaseDTO"
      ).mockReturnValueOnce(useCaseRequest);
      vi.spyOn(orderUseCase, "getOrderById").mockResolvedValueOnce(
        useCaseResponse
      );

      await orderController.getOrderById(req, res);

      expect(orderUseCase.getOrderById).toHaveBeenCalledWith(useCaseRequest);
      expect(getOrderByIdPresenter.sendResponse).toHaveBeenCalledWith(
        res,
        useCaseResponse
      );
    });

    it("should handle errors and send error response", async () => {
      const error = new Error("GetOrderById error");
      vi.spyOn(orderUseCase, "getOrderById").mockRejectedValueOnce(error);

      await orderController.getOrderById(req, res);

      expect(getOrderByIdPresenter.convertErrorResponse).toHaveBeenCalledWith(
        error,
        res
      );
    });
  });

  describe("createOrder", () => {
    it("should call createOrder use case and send response", async () => {
      const useCaseRequest: CreateOrderUseCaseRequestDTO = {
        userId: faker.string.uuid(),
        visitorName: faker.person.firstName(),
        paymentMethod: faker.lorem.word(),
        paymentDetails: faker.lorem.sentence(),
        combos: [],
      };
      const useCaseResponse: CreateOrderUseCaseResponseDTO = {
        order: makeOrder(),
        paymentDetails: faker.lorem.sentence(),
      };

      vi.spyOn(createOrderPresenter, "convertToUseCaseDTO").mockReturnValueOnce(
        useCaseRequest
      );
      vi.spyOn(orderUseCase, "createOrder").mockResolvedValueOnce(
        useCaseResponse
      );

      await orderController.createOrder(req, res);

      expect(orderUseCase.createOrder).toHaveBeenCalledWith(useCaseRequest);
      expect(createOrderPresenter.sendResponse).toHaveBeenCalledWith(
        res,
        useCaseResponse
      );
    });

    it("should handle errors and send error response", async () => {
      const error = new Error("CreateOrder error");
      vi.spyOn(orderUseCase, "createOrder").mockRejectedValueOnce(error);

      await orderController.createOrder(req, res);

      expect(createOrderPresenter.convertErrorResponse).toHaveBeenCalledWith(
        error,
        res
      );
    });
  });
});
