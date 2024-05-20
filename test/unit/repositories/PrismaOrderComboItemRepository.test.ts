import { describe, it, expect, beforeEach, vi } from "vitest";

import { PrismaOrderComboItemToDomainConverter } from "@/adapters/repositories/converters/PrismaOrderComboItemToDomainConverter";
import { PrismaOrderComboItemRepository } from "@/adapters/repositories/PrismaOrderComboItemRepository";
import { prisma } from "@/drivers/db/prisma/config/prisma";
import { OrderComboItem as RepositoryComboItem } from "@prisma/client";

import { makeOrderComboItem } from "../adapters/factories/MakeOrderComboItem";
import { makeRepositoryOrderComboItem } from "../adapters/factories/repository/MakeRepositoryOrderComboItem";

vi.mock("@/drivers/db/prisma/config/prisma", () => ({
  prisma: {
    orderComboItem: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

let repository: PrismaOrderComboItemRepository;
let repositoryComboItem: RepositoryComboItem;

beforeEach(() => {
  repository = new PrismaOrderComboItemRepository();
  repositoryComboItem = makeRepositoryOrderComboItem();
});

describe("PrismaOrderComboItemRepository", () => {
  describe("findById", () => {
    it("should find order combo item by id", async () => {
      vi.mocked(prisma.orderComboItem.findUnique).mockResolvedValueOnce(
        repositoryComboItem
      );

      const result = await repository.findById(repositoryComboItem.id);

      expect(prisma.orderComboItem.findUnique).toHaveBeenCalledWith({
        where: { id: repositoryComboItem.id },
      });
      expect(result).toEqual(
        PrismaOrderComboItemToDomainConverter.convert(repositoryComboItem)
      );
    });

    it("should return null if order combo item not found", async () => {
      vi.mocked(prisma.orderComboItem.findUnique).mockResolvedValueOnce(null);

      const result = await repository.findById(repositoryComboItem.id);

      expect(result).toBeNull();
    });
  });

  describe("findManyByOrderId", () => {
    it("should find many order combo items by order id", async () => {
      const orderComboItems = [repositoryComboItem];
      vi.mocked(prisma.orderComboItem.findMany).mockResolvedValueOnce(
        orderComboItems
      );

      const result = await repository.findManyByOrderId(
        repositoryComboItem.order_id
      );

      expect(prisma.orderComboItem.findMany).toHaveBeenCalledWith({
        where: { order_id: repositoryComboItem.order_id },
      });
      expect(result).toEqual(
        orderComboItems.map((c) =>
          PrismaOrderComboItemToDomainConverter.convert(c)
        )
      );
    });
  });

  describe("findManyByComboId", () => {
    it("should find many order combo items by combo id", async () => {
      const orderComboItems = [repositoryComboItem];
      vi.mocked(prisma.orderComboItem.findMany).mockResolvedValueOnce(
        orderComboItems
      );

      const result = await repository.findManyByComboId(
        repositoryComboItem.combo_id
      );

      expect(prisma.orderComboItem.findMany).toHaveBeenCalledWith({
        where: { combo_id: repositoryComboItem.combo_id },
      });
      expect(result).toEqual(
        orderComboItems.map((c) =>
          PrismaOrderComboItemToDomainConverter.convert(c)
        )
      );
    });
  });

  describe("create", () => {
    it("should create a new order combo item", async () => {
      const orderComboItemToCreate = makeOrderComboItem();
      vi.mocked(prisma.orderComboItem.create).mockResolvedValueOnce(
        repositoryComboItem
      );

      const result = await repository.create(orderComboItemToCreate);

      expect(prisma.orderComboItem.create).toHaveBeenCalledWith({
        data: {
          order_id: orderComboItemToCreate.orderId.toString(),
          combo_id: orderComboItemToCreate.comboId.toString(),
          annotation: orderComboItemToCreate.annotation,
          quantity: orderComboItemToCreate.quantity,
          total_price: orderComboItemToCreate.totalPrice,
        },
      });
      expect(result).toEqual(
        PrismaOrderComboItemToDomainConverter.convert(repositoryComboItem)
      );
    });
  });

  describe("createMany", () => {
    it("should create many order combo items", async () => {
      const orderComboItemsToCreate = [makeOrderComboItem()];
      const createdCount = orderComboItemsToCreate.length;
      vi.mocked(prisma.orderComboItem.createMany).mockResolvedValueOnce({
        count: createdCount,
      });

      const result = await repository.createMany(orderComboItemsToCreate);

      expect(prisma.orderComboItem.createMany).toHaveBeenCalledWith({
        data: orderComboItemsToCreate.map((c) => ({
          order_id: c.orderId.toString(),
          combo_id: c.comboId.toString(),
          annotation: c.annotation,
          quantity: c.quantity,
          total_price: c.totalPrice,
        })),
      });
      expect(result).toEqual(createdCount);
    });
  });

  describe("deleteByComboId", () => {
    it("should delete order combo items by combo id", async () => {
      const comboIdToDelete = repositoryComboItem.combo_id;
      vi.mocked(prisma.orderComboItem.deleteMany).mockResolvedValueOnce({
        count: 1,
      });

      await repository.deleteByComboId(comboIdToDelete);

      expect(prisma.orderComboItem.deleteMany).toHaveBeenCalledWith({
        where: { combo_id: comboIdToDelete },
      });
    });
  });
});
