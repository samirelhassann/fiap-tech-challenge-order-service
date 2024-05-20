import { FastifyReply, FastifyRequest } from "fastify";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { z } from "zod";

import { createOrderPayloadSchema } from "@/adapters/controllers/order/schema/CreateOrderSchema";
import { CreateOrderPresenter } from "@/adapters/presenters/order/CreateOrderPresenter";
import { MinimumResourcesNotReached } from "@/core/domain/base/errors/useCases/MinimumResourcesNotReached";
import { PaymentMethodEnum } from "@/core/domain/enums/PaymentMethodEnum";
import { CreateOrderUseCaseResponseDTO } from "@/core/useCases/order/dto/CreateOrderUseCaseDTO";
import { faker } from "@faker-js/faker";
import { makeOrder } from "@test/unit/adapters/factories/MakeOrder";

let req: FastifyRequest;
let res: FastifyReply;
let presenter: CreateOrderPresenter;

type CreateOrderPayload = z.infer<typeof createOrderPayloadSchema>;

describe("CreateOrderPresenter", () => {
  const payloadMock: CreateOrderPayload = {
    combos: [],
    paymentMethod: PaymentMethodEnum.QR_CODE,
    paymentDetails: faker.lorem.sentence(),
    visitorName: faker.person.firstName(),
  };

  beforeEach(() => {
    req = {
      body: payloadMock,
      isAnonymous: false,
      userId: faker.string.uuid(),
    } as FastifyRequest;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    presenter = new CreateOrderPresenter();
  });

  describe("convertToUseCaseDTO", () => {
    it("should convert request body to use case DTO", () => {
      const result = presenter.convertToUseCaseDTO(req);

      expect(result).toEqual({
        ...payloadMock,
        userId: req.userId,
      });
    });

    it("should handle anonymous request and exclude userId", () => {
      req.isAnonymous = true;
      req.userId = undefined;

      const result = presenter.convertToUseCaseDTO(req);

      expect(result).toEqual({
        ...payloadMock,
        userId: undefined,
      });
    });

    it("should handle invalid body and throw error", () => {
      req.body = {};

      expect(() => presenter.convertToUseCaseDTO(req)).toThrow();
    });
  });

  describe("convertToViewModel", () => {
    it("should convert use case response to view model", () => {
      const useCaseResponse: CreateOrderUseCaseResponseDTO = {
        order: makeOrder(),
        paymentDetails: faker.lorem.sentence(),
      };

      const result = presenter.convertToViewModel(useCaseResponse);

      expect(result).toEqual({
        id: useCaseResponse.order.id.toString(),
        numberId: useCaseResponse.order.number.toString(),
        paymentDetails: useCaseResponse.paymentDetails,
      });
    });
  });

  describe("sendResponse", () => {
    it("should send response with status 201", async () => {
      const useCaseResponse: CreateOrderUseCaseResponseDTO = {
        order: makeOrder(),
        paymentDetails: faker.lorem.sentence(),
      };

      await presenter.sendResponse(res, useCaseResponse);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        id: useCaseResponse.order.id.toString(),
        numberId: useCaseResponse.order.number.toString(),
        paymentDetails: useCaseResponse.paymentDetails,
      });
    });
  });

  describe("convertErrorResponse", () => {
    it("should send error response for MinimumResourcesNotReached", () => {
      const error = new MinimumResourcesNotReached("visitorName");

      presenter.convertErrorResponse(error, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: `For unauthorized requests, the visitorName field is required`,
      });
    });
  });
});
