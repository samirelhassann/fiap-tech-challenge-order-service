import { describe, it, expect, beforeEach, vi } from "vitest";

import { GetUserByIdResponse } from "@/adapters/services/catalogService/model/GetUserByIdResponse";
import { UserService } from "@/adapters/services/userService";
import api from "@/adapters/services/userService/api";
import { faker } from "@faker-js/faker";

vi.mock("@/adapters/services/userService/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

let service: UserService;

beforeEach(() => {
  service = new UserService();
});

describe("UserService", () => {
  describe("getUserById", () => {
    it("should get a user by id", async () => {
      const userId = faker.string.uuid();
      const getUserByIdResponse: GetUserByIdResponse = {
        id: faker.string.uuid(),
        name: faker.person.firstName(),
        email: faker.internet.email(),
        taxVat: faker.string.uuid(),
        createdAt: faker.date.recent().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
      };

      vi.mocked(api.get).mockResolvedValueOnce({ data: getUserByIdResponse });

      const result = await service.getUserById(userId);

      expect(api.get).toHaveBeenCalledWith(`/users/${userId}`);
      expect(result).toEqual(getUserByIdResponse);
    });

    it("should throw an error if getUserById fails", async () => {
      const userId = faker.string.uuid();
      const errorMessage = "Get user failed";

      vi.mocked(api.get).mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      await expect(service.getUserById(userId)).rejects.toThrow(errorMessage);
    });
  });
});
