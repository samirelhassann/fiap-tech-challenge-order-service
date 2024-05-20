/* eslint-disable default-param-last */

import { faker } from "@faker-js/faker";
import { Order } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export function makeRepositoryOrder(override: Partial<Order> = {}): Order {
  const order = {
    id: faker.string.uuid(),
    created_at: faker.date.past(),
    number: faker.number.int(),
    payment_id: faker.string.uuid(),
    total_price: new Decimal(faker.number.float()),
    updated_at: faker.date.recent(),
    user_id: faker.string.uuid(),
    visitor_name: faker.person.firstName(),
    ...override,
  } as Order;

  return order;
}
