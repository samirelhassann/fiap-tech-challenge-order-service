import { PaginationParams } from "@/core/domain/base/PaginationParams";
import { PaginationResponse } from "@/core/domain/base/PaginationResponse";
import { Order } from "@/core/domain/entities/Order";
import { PrismaClient } from "@prisma/client";

export interface IOrderRepository {
  findMany(
    params: PaginationParams,
    userId?: string
  ): Promise<PaginationResponse<Order>>;

  findManyByUserId(
    params: PaginationParams,
    userId: string
  ): Promise<PaginationResponse<Order>>;

  findById(id: string): Promise<Order | null>;

  create(order: Order, tx?: PrismaClient): Promise<Order>;
}
