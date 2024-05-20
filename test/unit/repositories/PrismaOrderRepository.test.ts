import { describe, it, expect, beforeEach, vi } from "vitest";

import { PrismaOrderToDomainConverter } from "@/adapters/repositories/converters/PrismaOrderToDomainConverter";
import { PrismaOrderRepository } from "@/adapters/repositories/PrismaOrderRepository";
import { DomainEvents } from "@/core/domain/base/events/DomainEvents";
import { PaginationParams } from "@/core/domain/base/PaginationParams";
import { PaginationResponse } from "@/core/domain/base/PaginationResponse";
import { IOrderComboItemRepository } from "@/core/interfaces/repositories/IOrderComboItemRepository";
import { prisma } from "@/drivers/db/prisma/config/prisma";
import { Order as RepositoryOrder } from "@prisma/client";

import { makeOrder } from "../adapters/factories/MakeOrder";
import { makeRepositoryOrder } from "../adapters/factories/repository/MakeRepositoryOrder";

vi.mock("@/drivers/db/prisma/config/prisma", () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/core/domain/base/events/DomainEvents", () => ({
  DomainEvents: {
    dispatchEventsForAggregate: vi.fn(),
  },
}));

let repository: PrismaOrderRepository;
let orderComboItemRepository: IOrderComboItemRepository;
let order: RepositoryOrder;

beforeEach(() => {
  orderComboItemRepository = {
    findManyByOrderId: vi.fn(),
    createMany: vi.fn(),
  } as unknown as IOrderComboItemRepository;

  repository = new PrismaOrderRepository(orderComboItemRepository);
  order = makeRepositoryOrder();
});

describe("PrismaOrderRepository", () => {
  describe("findMany", () => {
    it("should find many orders with pagination", async () => {
      const orders = [order];
      const totalItems = orders.length;
      const paginationParams = new PaginationParams(1, 10);

      vi.mocked(prisma.order.count).mockResolvedValueOnce(totalItems);
      vi.mocked(prisma.order.findMany).mockResolvedValueOnce(orders);

      const result = await repository.findMany(paginationParams);

      expect(prisma.order.count).toHaveBeenCalledWith({
        where: { user_id: undefined },
      });
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { user_id: undefined },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual(
        new PaginationResponse<RepositoryOrder>({
          data: orders.map((c) => PrismaOrderToDomainConverter.convert(c)),
          totalItems,
          currentPage: paginationParams.page,
          pageSize: paginationParams.size,
          totalPages: Math.ceil(totalItems / paginationParams.size),
        })
      );
    });
  });

  describe("findManyByUserId", () => {
    it("should find many orders by user id with pagination", async () => {
      const orders = [order];
      const totalItems = orders.length;
      const paginationParams = new PaginationParams(1, 10);
      const userId = order.user_id?.toString() || "";

      vi.mocked(prisma.order.count).mockResolvedValueOnce(totalItems);
      vi.mocked(prisma.order.findMany).mockResolvedValueOnce(orders);

      const result = await repository.findManyByUserId(
        paginationParams,
        userId
      );

      expect(prisma.order.count).toHaveBeenCalledWith({
        where: { user_id: userId },
      });
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { user_id: userId },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual(
        new PaginationResponse<RepositoryOrder>({
          data: orders.map((c) => PrismaOrderToDomainConverter.convert(c)),
          totalItems,
          currentPage: paginationParams.page,
          pageSize: paginationParams.size,
          totalPages: Math.ceil(totalItems / paginationParams.size),
        })
      );
    });
  });

  describe("findById", () => {
    it("should find order by id", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValueOnce(order);
      vi.mocked(
        orderComboItemRepository.findManyByOrderId
      ).mockResolvedValueOnce([]);

      const result = await repository.findById(order.id);

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: order.id },
      });
      expect(orderComboItemRepository.findManyByOrderId).toHaveBeenCalledWith(
        order.id
      );
      expect(result).toEqual(PrismaOrderToDomainConverter.convert(order, []));
    });

    it("should return null if order not found", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValueOnce(null);

      const result = await repository.findById(order.id);

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a new order", async () => {
      const orderToCreate = makeOrder();
      vi.mocked(prisma.order.create).mockResolvedValueOnce(order);

      const result = await repository.create(orderToCreate);

      expect(prisma.order.create).toHaveBeenCalledWith({
        data: {
          id: orderToCreate.id.toString(),
          user_id: orderToCreate.userId?.toString(),
          visitor_name: orderToCreate.visitorName,
          total_price: orderToCreate.totalPrice,
          created_at: orderToCreate.createdAt,
          updated_at: orderToCreate.updatedAt,
        },
      });
      expect(orderComboItemRepository.createMany).toHaveBeenCalledWith(
        orderToCreate.combos.getItems()
      );
      expect(result).toEqual(PrismaOrderToDomainConverter.convert(order));
      expect(DomainEvents.dispatchEventsForAggregate).toHaveBeenCalledWith(
        orderToCreate.id
      );
    });
  });
});
