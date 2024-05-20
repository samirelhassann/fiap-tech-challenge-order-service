import { FastifyReply, FastifyRequest } from "fastify";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { GetOrdersPresenter } from "@/adapters/presenters/order/GetOrdersPresenter";
import { PaginationParams } from "@/core/domain/base/PaginationParams";
import { PaginationResponse } from "@/core/domain/base/PaginationResponse";
import { Order } from "@/core/domain/entities/Order";
import { GetOrdersUseCaseResponseDTO } from "@/core/useCases/order/dto/GetOrdersUseCaseDTO";
import { faker } from "@faker-js/faker";

import { makeOrder } from "../../factories/MakeOrder";

let req: FastifyRequest;
let res: FastifyReply;
let presenter: GetOrdersPresenter;

describe("GetOrdersPresenter", () => {
  const queryMock = {
    page: faker.number.int(),
    pageSize: faker.number.int(),
    userId: faker.string.uuid(),
  };

  beforeEach(() => {
    req = {
      query: queryMock,
    } as unknown as FastifyRequest;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    presenter = new GetOrdersPresenter();
  });

  describe("convertToUseCaseDTO", () => {
    it("should convert request query params to use case DTO", () => {
      const result = presenter.convertToUseCaseDTO(req);

      expect(result).toEqual({
        params: new PaginationParams(queryMock.page, queryMock.pageSize),
        userId: queryMock.userId,
      });
    });

    it("should handle default values if query params are not provided", () => {
      req.query = {};

      const result = presenter.convertToUseCaseDTO(req);

      expect(result).toEqual({
        params: new PaginationParams(1, 20),
      });
    });
  });

  describe("convertToViewModel", () => {
    it("should convert use case response to view model", () => {
      const orders = [makeOrder(), makeOrder()];

      const mockPaginationResponse = new PaginationResponse<Order>({
        currentPage: faker.number.int(),
        data: orders,
        pageSize: faker.number.int(),
        totalItems: faker.number.int(),
        totalPages: faker.number.int(),
      });

      const useCaseResponse: GetOrdersUseCaseResponseDTO = {
        paginationResponse: mockPaginationResponse,
      };

      const result = presenter.convertToViewModel(useCaseResponse);

      expect(result).toEqual(
        mockPaginationResponse.toResponse((order) => ({
          id: order.id.toString(),
          number: order.number.toString(),
          clientId: order.userId?.toString(),
          visitorName: order.visitorName,
          totalPrice: order.totalPrice,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt?.toISOString(),
        }))
      );
    });
  });

  describe("sendResponse", () => {
    it("should send response with status 200", async () => {
      const orders = [makeOrder(), makeOrder()];
      const mockPaginationResponse = new PaginationResponse<Order>({
        currentPage: faker.number.int(),
        data: orders,
        pageSize: faker.number.int(),
        totalItems: faker.number.int(),
        totalPages: faker.number.int(),
      });

      const useCaseResponse: GetOrdersUseCaseResponseDTO = {
        paginationResponse: mockPaginationResponse,
      };

      await presenter.sendResponse(res, useCaseResponse);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        presenter.convertToViewModel(useCaseResponse)
      );
    });
  });
});
