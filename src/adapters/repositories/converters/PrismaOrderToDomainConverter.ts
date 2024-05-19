import { UniqueEntityId } from "@/core/domain/base/entities/UniqueEntityId";
import { Order } from "@/core/domain/entities/Order";
import { OrderComboItem } from "@/core/domain/entities/OrderComboItem";
import { OrderComboItemList } from "@/core/domain/entities/OrderComboItemList";
import { User as PrismaUser, Order as PrismaOrder } from "@prisma/client";

export class PrismaOrderToDomainConverter {
  static convert(
    prismaOrder: PrismaOrder & { user?: PrismaUser | null },
    combos?: OrderComboItem[]
  ): Order {
    return new Order(
      {
        number: prismaOrder.number ? BigInt(prismaOrder.number) : undefined,

        userId: prismaOrder.user_id
          ? new UniqueEntityId(prismaOrder.user_id)
          : undefined,
        visitorName: prismaOrder.visitor_name ?? undefined,
        paymentId: prismaOrder.payment_id ?? undefined,
        paymentDetails: prismaOrder.payment_details ?? undefined,
        totalPrice: prismaOrder.total_price.toNumber(),
        createdAt: prismaOrder.created_at,
        updatedAt: prismaOrder.updated_at ?? undefined,
        combos: new OrderComboItemList(combos),
      },
      new UniqueEntityId(prismaOrder.id)
    );
  }
}
