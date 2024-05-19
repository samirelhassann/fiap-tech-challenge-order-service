import { FastifyInstance } from "fastify";

import identifyRequest from "@/adapters/middlewares/identifyRequest";

import { HealhCheckRoutes } from "../routes/HealhCheckRoutes";
import { OrderRoutes } from "../routes/OrderRoutes";

const SERVICE_PREFIX = "/order-service";

export function routes(app: FastifyInstance) {
  app.addHook("preHandler", identifyRequest);

  app.register(HealhCheckRoutes);

  app.register(OrderRoutes, { prefix: `${SERVICE_PREFIX}/orders` });
}
