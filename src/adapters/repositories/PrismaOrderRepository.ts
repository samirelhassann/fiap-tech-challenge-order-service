import { DomainEvents } from "@/core/domain/base/events/DomainEvents";
import { PaginationParams } from "@/core/domain/base/PaginationParams";
import { PaginationResponse } from "@/core/domain/base/PaginationResponse";
import { Order } from "@/core/domain/entities/Order";
import { IOrderComboItemRepository } from "@/core/interfaces/repositories/IOrderComboItemRepository";
import { IOrderRepository } from "@/core/interfaces/repositories/IOrderRepository";
import { prisma } from "@/drivers/db/prisma/config/prisma";
import { PrismaClient } from "@prisma/client";

import { PrismaOrderToDomainConverter } from "./converters/PrismaOrderToDomainConverter";

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private orderComboItemRepository: IOrderComboItemRepository) {}

  async findMany(
    { page, size }: PaginationParams,
    userId?: string
  ): Promise<PaginationResponse<Order>> {
    const where = {
      user_id: userId,
    };

    const totalItems = await prisma.order.count({
      where,
    });
    const totalPages = Math.ceil(totalItems / size);

    const data = await prisma.order.findMany({
      where,
      skip: (page - 1) * size,
      take: size,
    });

    return new PaginationResponse<Order>({
      data: data.map((c) => PrismaOrderToDomainConverter.convert(c)),
      totalItems,
      currentPage: page,
      pageSize: size,
      totalPages,
    });
  }

  async findManyByUserId(
    { page, size }: PaginationParams,
    userId: string
  ): Promise<PaginationResponse<Order>> {
    const totalItems = await prisma.order.count({
      where: {
        user_id: userId,
      },
    });
    const totalPages = Math.ceil(totalItems / size);

    const data = await prisma.order.findMany({
      where: {
        user_id: userId,
      },
      skip: (page - 1) * size,
      take: size,
    });

    return new PaginationResponse<Order>({
      data: data.map((c) => PrismaOrderToDomainConverter.convert(c)),
      totalItems,
      currentPage: page,
      pageSize: size,
      totalPages,
    });
  }

  async findById(id: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      return null;
    }

    const combos = await this.orderComboItemRepository.findManyByOrderId(id);

    return PrismaOrderToDomainConverter.convert(order, combos);
  }

  async create(order: Order, tx?: PrismaClient): Promise<Order> {
    const client = tx || prisma;
    const createdOrder = await client.order
      .create({
        data: {
          id: order.id.toString(),
          user_id: order.userId?.toString(),
          visitor_name: order.visitorName,
          total_price: order.totalPrice,
          created_at: order.createdAt,
          updated_at: order.updatedAt,
        },
      })
      .then((c) => PrismaOrderToDomainConverter.convert(c));

    await this.orderComboItemRepository.createMany(
      order.combos.getItems(),
      client
    );

    DomainEvents.dispatchEventsForAggregate(order.id);

    return createdOrder;
  }
}
