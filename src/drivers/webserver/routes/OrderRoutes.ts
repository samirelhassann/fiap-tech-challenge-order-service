import { FastifyInstance } from "fastify";

import { OrderController } from "@/adapters/controllers/order/OrderController";
import { createOrderDocSchema } from "@/adapters/controllers/order/schema/CreateOrderSchema";
import { getOrderByIdDocSchema } from "@/adapters/controllers/order/schema/GetOrderByIdSchema";
import { getOrdersDocSchema } from "@/adapters/controllers/order/schema/GetOrdersSchema";
import { RabbitMQService } from "@/adapters/messaging/rabbitmq/RabbitMQService";
import { CreateOrderPresenter } from "@/adapters/presenters/order/CreateOrderPresenter";
import { GetOrderByIdPresenter } from "@/adapters/presenters/order/GetOrderByIdPresenter";
import { GetOrdersPresenter } from "@/adapters/presenters/order/GetOrdersPresenter";
import { makeOrderRepository } from "@/adapters/repositories/PrismaRepositoryFactory";
import { CatalogService } from "@/adapters/services/catalogService";
import { PaymentService } from "@/adapters/services/paymentService";
import { StatusService } from "@/adapters/services/statusService";
import { UserService } from "@/adapters/services/userService";
import { OrderUseCase } from "@/core/useCases/order/OrderUseCase";

export async function OrderRoutes(app: FastifyInstance) {
  const orderController = new OrderController(
    new OrderUseCase(
      makeOrderRepository(),
      new CatalogService(),
      new UserService(),
      new StatusService(),
      new PaymentService(),

      RabbitMQService.getInstance()
    ),

    new GetOrdersPresenter(),
    new CreateOrderPresenter(),
    new GetOrderByIdPresenter()
  );

  app.get("", {
    schema: getOrdersDocSchema,
    handler: orderController.getOrders.bind(orderController),
  });

  app.get("/:id", {
    schema: getOrderByIdDocSchema,
    handler: orderController.getOrderById.bind(orderController),
  });

  app.post("", {
    schema: createOrderDocSchema,
    handler: orderController.createOrder.bind(orderController),
  });
}
