import { FastifyReply, FastifyRequest } from "fastify";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { GetOrderByIdPresenter } from "@/adapters/presenters/order/GetOrderByIdPresenter";
import { GetOrderByIdUseCaseResponseDTO } from "@/core/useCases/order/dto/GetOrderByIdUseCaseDTO";
import { faker } from "@faker-js/faker";

import { makeOrder } from "../../factories/MakeOrder";

let req: FastifyRequest;
let res: FastifyReply;
let presenter: GetOrderByIdPresenter;

describe("GetOrderByIdPresenter", () => {
  const paramsMock = { id: faker.string.uuid() };

  beforeEach(() => {
    req = {
      params: paramsMock,
    } as unknown as FastifyRequest;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    presenter = new GetOrderByIdPresenter();
  });

  describe("convertToUseCaseDTO", () => {
    it("should convert request params to use case DTO", () => {
      const result = presenter.convertToUseCaseDTO(req);

      expect(result).toEqual({
        id: paramsMock.id,
      });
    });

    it("should handle invalid params and throw error", () => {
      req.params = {};

      expect(() => presenter.convertToUseCaseDTO(req)).toThrow();
    });
  });

  describe("convertToViewModel", () => {
    it("should convert use case response to view model", () => {
      const useCaseResponse: GetOrderByIdUseCaseResponseDTO = {
        combos: [],
        order: makeOrder(),
        orderCombos: [],
        userDetails: {
          createdAt: faker.date.recent().toString(),
          email: faker.internet.email(),
          id: faker.string.uuid(),
          name: faker.person.firstName(),
          taxVat: faker.string.uuid(),
          updatedAt: faker.date.recent().toDateString(),
        },
      };

      const result = presenter.convertToViewModel(useCaseResponse);

      const expectedConvertedOrder = {
        combos: useCaseResponse.combos,
        createdAt: useCaseResponse.order.createdAt.toISOString(),
        id: useCaseResponse.order.id.toString(),
        visitorName: useCaseResponse.order.visitorName,
        number: useCaseResponse.order.number.toString(),
        updatedAt: useCaseResponse.order.updatedAt?.toISOString(),
        user: {
          id: useCaseResponse.userDetails?.id,
          name: useCaseResponse.userDetails?.name,
        },
        totalPrice: useCaseResponse.order.totalPrice,
      };

      expect(result).toEqual(expectedConvertedOrder);
    });
  });

  describe("sendResponse", () => {
    it("should send response with status 200", async () => {
      const useCaseResponse: GetOrderByIdUseCaseResponseDTO = {
        combos: [],
        order: makeOrder(),
        orderCombos: [],
        userDetails: {
          createdAt: faker.date.recent().toString(),
          email: faker.internet.email(),
          id: faker.string.uuid(),
          name: faker.person.firstName(),
          taxVat: faker.string.uuid(),
          updatedAt: faker.date.recent().toDateString(),
        },
      };

      await presenter.sendResponse(res, useCaseResponse);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        presenter.convertToViewModel(useCaseResponse)
      );
    });
  });
});
