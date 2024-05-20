import { describe, it, expect, beforeEach, vi } from "vitest";

import { CatalogService } from "@/adapters/services/catalogService";
import api from "@/adapters/services/catalogService/api";
import { CreateComboRequest } from "@/adapters/services/catalogService/model/CreateComboRequest";
import { CreateComboResponse } from "@/adapters/services/catalogService/model/CreateComboResponse";
import { GetComboByIdResponse } from "@/adapters/services/catalogService/model/GetComboByIdResponse";
import { faker } from "@faker-js/faker";

vi.mock("@/adapters/services/catalogService/api", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

let service: CatalogService;

beforeEach(() => {
  service = new CatalogService();
});

describe("CatalogService", () => {
  describe("createCombo", () => {
    it("should create a combo", async () => {
      const createComboRequest: CreateComboRequest = {
        sandwichId: faker.string.uuid(),
        drinkId: faker.string.uuid(),
        sideId: faker.string.uuid(),
        dessertId: faker.string.uuid(),
      };

      const createComboResponse: CreateComboResponse = {
        id: faker.string.uuid(),
        name: faker.lorem.sentence(),
        description: faker.lorem.sentence(),
        price: faker.number.float(),
        createdAt: faker.date.recent().toISOString(),
        products: [],
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: createComboResponse });

      const result = await service.createCombo(createComboRequest);

      expect(api.post).toHaveBeenCalledWith("/combos", createComboRequest);
      expect(result).toEqual(createComboResponse);
    });

    it("should throw an error if createCombo fails", async () => {
      const createComboRequest: CreateComboRequest = {
        sandwichId: faker.string.uuid(),
        drinkId: faker.string.uuid(),
        sideId: faker.string.uuid(),
        dessertId: faker.string.uuid(),
      };

      const errorMessage = "Create combo failed";

      vi.mocked(api.post).mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      await expect(service.createCombo(createComboRequest)).rejects.toThrow(
        errorMessage
      );
    });
  });

  describe("getComboById", () => {
    it("should get a combo by id", async () => {
      const comboId = "1";
      const getComboByIdResponse: GetComboByIdResponse = {
        id: comboId,
        name: faker.lorem.sentence(),
        description: faker.lorem.sentence(),
        price: faker.number.float(),
        createdAt: faker.date.recent().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
        products: [],
      };

      vi.mocked(api.get).mockResolvedValueOnce({ data: getComboByIdResponse });

      const result = await service.getComboById(comboId);

      expect(api.get).toHaveBeenCalledWith(`/combos/${comboId}`);
      expect(result).toEqual(getComboByIdResponse);
    });

    it("should throw an error if getComboById fails", async () => {
      const comboId = "1";
      const errorMessage = "Get combo failed";

      vi.mocked(api.get).mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      await expect(service.getComboById(comboId)).rejects.toThrow(errorMessage);
    });
  });
});
