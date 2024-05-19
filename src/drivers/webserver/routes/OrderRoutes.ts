import { FastifyInstance } from "fastify";

import { OrderController } from "@/adapters/controllers/order/OrderController";
import { createOrderDocSchema } from "@/adapters/controllers/order/schema/CreateOrderSchema";
import { getOrderByIdDocSchema } from "@/adapters/controllers/order/schema/GetOrderByIdSchema";
import { getOrdersDocSchema } from "@/adapters/controllers/order/schema/GetOrdersSchema";
import { CreateOrderPresenter } from "@/adapters/presenters/order/CreateOrderPresenter";
import { GetOrderByIdPresenter } from "@/adapters/presenters/order/GetOrderByIdPresenter";
import { GetOrdersPresenter } from "@/adapters/presenters/order/GetOrdersPresenter";
import { GetOrdersQueueFormatedPresenter } from "@/adapters/presenters/order/GetOrdersQueueFormatedPresenter";
import { OrderWebHookPresenter } from "@/adapters/presenters/order/OrderWebHookPresenter";
import { UpdateOrderStatusPresenter } from "@/adapters/presenters/order/UpdateOrderStatusPresenter";
import { makeOrderRepository } from "@/adapters/repositories/PrismaRepositoryFactory";
import { CatalogService } from "@/adapters/services/catalogService";
import { UserService } from "@/adapters/services/userService";
import { OrderUseCase } from "@/core/useCases/order/OrderUseCase";

export async function OrderRoutes(app: FastifyInstance) {
  const orderController = new OrderController(
    new OrderUseCase(
      makeOrderRepository(),
      new CatalogService(),
      new UserService()
    ),

    new GetOrdersPresenter(),
    new GetOrdersQueueFormatedPresenter(),
    new CreateOrderPresenter(),
    new GetOrderByIdPresenter(),
    new UpdateOrderStatusPresenter(),
    new OrderWebHookPresenter()
  );

  app.get("", {
    schema: getOrdersDocSchema,
    handler: orderController.getOrders.bind(orderController),
  });

  // app.get("/queue", {
  //   schema: getOrdersQueueFormatedDocSchema,
  //   handler: orderController.getOrdersQueueFormated.bind(orderController),
  // });

  app.get("/:id", {
    schema: getOrderByIdDocSchema,
    handler: orderController.getOrderById.bind(orderController),
  });

  app.post("", {
    schema: createOrderDocSchema,
    handler: orderController.createOrder.bind(orderController),
  });

  // app.patch("/:id", {
  //   schema: updateOrderStatusDocSchema,
  //   handler: orderController.updateOrderStatus.bind(orderController),
  //   onRequest: [verifyJwt(RoleEnum.ADMIN)],
  // });

  // app.post("/webhook", {
  //   schema: orderWebHookDocSchema,
  //   handler: orderController.webhook.bind(orderController),
  // });
}
