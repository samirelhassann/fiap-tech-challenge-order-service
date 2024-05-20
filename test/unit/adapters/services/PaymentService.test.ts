import { describe, it, expect, beforeEach, vi } from "vitest";

import { PaymentService } from "@/adapters/services/paymentService";
import api from "@/adapters/services/paymentService/api";
import { CreatePaymentRequest } from "@/adapters/services/paymentService/model/CreatePaymentRequest";
import { CreatePaymentResponse } from "@/adapters/services/paymentService/model/CreatePaymentResponse";
import { faker } from "@faker-js/faker";

vi.mock("@/adapters/services/paymentService/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

let service: PaymentService;

beforeEach(() => {
  service = new PaymentService();
});

describe("PaymentService", () => {
  describe("createPayment", () => {
    it("should create a payment", async () => {
      const createPaymentRequest: CreatePaymentRequest = {
        orderId: faker.string.uuid(),
        combos: [
          {
            id: faker.string.uuid(),
            name: faker.string.uuid(),
            description: faker.string.uuid(),
            price: faker.number.float(),
            quantity: faker.number.int(),
          },
        ],
      };

      const createPaymentResponse: CreatePaymentResponse = {
        paymentDetails: faker.lorem.sentence(),
      };

      vi.mocked(api.post).mockResolvedValueOnce({
        data: createPaymentResponse,
      });

      const result = await service.createPayment(createPaymentRequest);

      expect(api.post).toHaveBeenCalledWith("/create", createPaymentRequest);
      expect(result).toEqual(createPaymentResponse);
    });

    it("should throw an error if createPayment fails", async () => {
      const createPaymentRequest: CreatePaymentRequest = {
        orderId: faker.string.uuid(),
        combos: [
          {
            id: faker.string.uuid(),
            name: faker.string.uuid(),
            description: faker.string.uuid(),
            price: faker.number.float(),
            quantity: faker.number.int(),
          },
        ],
      };

      const errorMessage = "Create payment failed";

      vi.mocked(api.post).mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      await expect(service.createPayment(createPaymentRequest)).rejects.toThrow(
        errorMessage
      );
    });
  });
});
