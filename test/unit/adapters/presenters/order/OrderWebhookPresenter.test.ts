import { FastifyReply, FastifyRequest } from "fastify";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { OrderWebHookPresenter } from "@/adapters/presenters/order/OrderWebHookPresenter";
import { faker } from "@faker-js/faker";

let req: FastifyRequest;
let res: FastifyReply;
let presenter: OrderWebHookPresenter;

describe("OrderWebHookPresenter", () => {
  const bodyMock = {
    resource: `https://example.com/resource/${faker.datatype.number()}`,
    topic: "merchant_order",
  };

  beforeEach(() => {
    req = {
      body: bodyMock,
    } as unknown as FastifyRequest;

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    presenter = new OrderWebHookPresenter();
  });

  describe("convertToUseCaseDTO", () => {
    it("should convert request body to use case DTO", () => {
      const result = presenter.convertToUseCaseDTO(req);

      expect(result).toEqual({
        platformOrderId: bodyMock.resource.match(/\d+$/)![0],
      });
    });

    it("should handle invalid body and throw error", () => {
      req.body = { resource: "invalid-url", topic: "merchant_order" };

      expect(() => presenter.convertToUseCaseDTO(req)).toThrow(
        "Resource URL must end with a number."
      );
    });

    it("should handle missing required properties and throw error", () => {
      req.body = { topic: "merchant_order" };

      expect(() => presenter.convertToUseCaseDTO(req)).toThrow();
    });
  });

  describe("sendResponse", () => {
    it("should send response with status 200", async () => {
      await presenter.sendResponse(res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith();
    });
  });
});
