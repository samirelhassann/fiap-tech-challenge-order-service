/* eslint-disable default-param-last */

import { UniqueEntityId } from "@/core/domain/base/entities/UniqueEntityId";
import { Order, OrderProps } from "@/core/domain/entities/Order";
import { faker } from "@faker-js/faker";

export function makeOrder(
  override: Partial<OrderProps> = {},
  id?: UniqueEntityId
): Order {
  const newOrder = new Order(
    {
      userId: new UniqueEntityId(faker.string.uuid()),
      totalPrice: faker.number.float(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...override,
    },
    id
  );

  return newOrder;
}
