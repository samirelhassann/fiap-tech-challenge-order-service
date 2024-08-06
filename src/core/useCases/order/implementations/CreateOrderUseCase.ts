import { UniqueEntityId } from "@/core/domain/base/entities/UniqueEntityId";
import { UnsupportedArgumentValueError } from "@/core/domain/base/errors/entities/UnsupportedArgumentValueError";
import { InternalServerError } from "@/core/domain/base/errors/useCases/InternalServerError";
import { MinimumResourcesNotReached } from "@/core/domain/base/errors/useCases/MinimumResourcesNotReached";
import { Order } from "@/core/domain/entities/Order";
import { OrderComboItem } from "@/core/domain/entities/OrderComboItem";
import { OrderComboItemList } from "@/core/domain/entities/OrderComboItemList";
import { PaymentMethodEnum } from "@/core/domain/enums/PaymentMethodEnum";
import { IMessageQueueService } from "@/core/interfaces/messaging/IMessageQueueService";
import { IOrderRepository } from "@/core/interfaces/repositories/IOrderRepository";
import { ICatalogService } from "@/core/interfaces/services/ICatalogService";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { IStatusService } from "@/core/interfaces/services/IStatusService";
import { prisma } from "@/drivers/db/prisma/config/prisma";
import { PrismaClient } from "@prisma/client";

import {
  CreateOrderUseCaseRequestDTO,
  CreateOrderUseCaseResponseDTO,
} from "../dto/CreateOrderUseCaseDTO";

export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private catalogService: ICatalogService,
    private statusService: IStatusService,
    private paymentService: IPaymentService,
    private messageService: IMessageQueueService
  ) {}

  async execute({
    userId,
    visitorName,
    combos,
    paymentMethod,
  }: CreateOrderUseCaseRequestDTO): Promise<CreateOrderUseCaseResponseDTO> {
    this.validatePaymentMethod(paymentMethod);
    this.validateIfUserOrVisitorNameIsInformed(userId, visitorName);

    if (combos.length === 0) {
      throw new MinimumResourcesNotReached("Combos");
    }

    return prisma.$transaction(async (tx) => {
      const createdCombosPromises = combos.map(async (comboToCreate) => {
        const { sandwichId, dessertId, sideId, drinkId } = comboToCreate;

        const createdCombo = await this.catalogService
          .createCombo({
            sandwichId,
            dessertId,
            sideId,
            drinkId,
          })
          .catch((e: Error) => {
            throw new InternalServerError(
              "Order was not created, an error ocurred while trying to create the combo.",
              [e.message]
            );
          });

        return {
          createdCombo,
          calculatedPrice: createdCombo.price * comboToCreate.quantity,
          annotation: comboToCreate.annotation,
          quantity: comboToCreate.quantity,
        };
      });

      const createdCombos = await Promise.all(createdCombosPromises);

      const totalPrice = createdCombos.reduce(
        (acc, combo) => acc + combo.calculatedPrice,
        0
      );

      const order = new Order({
        userId: userId ? new UniqueEntityId(userId) : undefined,
        visitorName,
        totalPrice,
      });

      const orderCombosToCreate = createdCombos.map(
        (combo) =>
          new OrderComboItem({
            comboId: new UniqueEntityId(combo.createdCombo.id),
            annotation: combo.annotation,
            orderId: order.id,
            quantity: combo.quantity,
            totalPrice: combo.calculatedPrice,
          })
      );

      order.combos = new OrderComboItemList(orderCombosToCreate);

      const createdOrder = await this.orderRepository
        .create(order, tx as PrismaClient)
        .catch((e: Error) => {
          throw new InternalServerError(
            "Order was not created, an error ocurred while trying to create the order.",
            [e.message]
          );
        });

      const newOrderMessage = {
        orderId: createdOrder.id.toString(),
        totalAmount: totalPrice,
      };

      await this.messageService
        .publishNewOrderMessage(newOrderMessage)
        .catch((e: Error) => {
          throw new InternalServerError(
            "Order was not created, an error ocurred while trying to publish the new order message.",
            [e.message]
          );
        });

      return { order: createdOrder };
    });
  }

  private validateIfUserOrVisitorNameIsInformed(
    userId: string | undefined,
    visitorName: string | undefined
  ) {
    if (!userId && !visitorName) {
      throw new MinimumResourcesNotReached("User", ["userId", "visitorName"]);
    }
  }

  private validatePaymentMethod(paymentMethod: string) {
    if (
      paymentMethod &&
      !Object.keys(PaymentMethodEnum)
        .map((e) => e.toLowerCase())
        .includes(paymentMethod.toLowerCase())
    ) {
      throw new UnsupportedArgumentValueError("Payment Method");
    }
  }
}
