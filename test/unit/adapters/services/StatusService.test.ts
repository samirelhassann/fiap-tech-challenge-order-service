import { describe, it, expect, beforeEach, vi } from "vitest";

import { StatusService } from "@/adapters/services/statusService";
import api from "@/adapters/services/statusService/api";
import { UpdateOrderStatusRequest } from "@/adapters/services/statusService/model/UpdateOrderStatusRequest";
import { faker } from "@faker-js/faker";

vi.mock("@/adapters/services/statusService/api", () => ({
  default: {
    patch: vi.fn(),
  },
}));

let service: StatusService;

beforeEach(() => {
  service = new StatusService();
});

describe("StatusService", () => {
  describe("updateOrderStatus", () => {
    it("should update the order status", async () => {
      const updateOrderStatusRequest: UpdateOrderStatusRequest = {
        orderId: faker.string.uuid(),
        status: "delivered",
      };

      vi.mocked(api.patch).mockResolvedValueOnce({ data: undefined });

      await service.updateOrderStatus(updateOrderStatusRequest);

      expect(api.patch).toHaveBeenCalledWith(
        `/${updateOrderStatusRequest.orderId}`,
        {
          status: updateOrderStatusRequest.status,
        }
      );
    });

    it("should throw an error if updateOrderStatus fails", async () => {
      const updateOrderStatusRequest: UpdateOrderStatusRequest = {
        orderId: faker.string.uuid(),
        status: "delivered",
      };

      const errorMessage = "Update order status failed";

      vi.mocked(api.patch).mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      await expect(
        service.updateOrderStatus(updateOrderStatusRequest)
      ).rejects.toThrow(errorMessage);
    });
  });
});
