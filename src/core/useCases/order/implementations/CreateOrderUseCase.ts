import { CreatePaymentRequest } from "@/adapters/services/paymentService/model/CreatePaymentRequest";
import { UniqueEntityId } from "@/core/domain/base/entities/UniqueEntityId";
import { UnsupportedArgumentValueError } from "@/core/domain/base/errors/entities/UnsupportedArgumentValueError";
import { MinimumResourcesNotReached } from "@/core/domain/base/errors/useCases/MinimumResourcesNotReached";
import { Order } from "@/core/domain/entities/Order";
import { OrderComboItem } from "@/core/domain/entities/OrderComboItem";
import { OrderComboItemList } from "@/core/domain/entities/OrderComboItemList";
import { OrderStatusEnum } from "@/core/domain/enums/OrderStatusEnum";
import { PaymentMethodEnum } from "@/core/domain/enums/PaymentMethodEnum";
import { IOrderRepository } from "@/core/interfaces/repositories/IOrderRepository";
import { ICatalogService } from "@/core/interfaces/services/ICatalogService";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { IStatusService } from "@/core/interfaces/services/IStatusService";

import {
  CreateOrderUseCaseRequestDTO,
  CreateOrderUseCaseResponseDTO,
} from "../dto/CreateOrderUseCaseDTO";

export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private catalogService: ICatalogService,
    private statusService: IStatusService,
    private paymentService: IPaymentService
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

    const createdCombosPromises = combos.map(async (comboToCreate) => {
      const { sandwichId, dessertId, sideId, drinkId } = comboToCreate;

      const createdCombo = await this.catalogService.createCombo({
        sandwichId,
        dessertId,
        sideId,
        drinkId,
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

    const createdOrder = await this.orderRepository.create(order);

    const createPaymentRequest: CreatePaymentRequest = {
      orderId: createdOrder.id.toString(),
      combos: createdCombos.map(({ createdCombo }) => ({
        id: createdCombo.id,
        name: createdCombo.name,
        description: createdCombo.description,
        price: Math.round(createdCombo.price * 100) / 100,
        quantity: createdCombos.find(
          (combo) => combo.createdCombo.id === createdCombo.id
        )!.quantity,
      })),
    };

    const { paymentDetails } =
      await this.paymentService.createPayment(createPaymentRequest);

    await this.statusService.updateOrderStatus({
      orderId: createdOrder.id.toString(),
      status: OrderStatusEnum.PENDING_PAYMENT,
    });

    return { order: createdOrder, paymentDetails };
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
