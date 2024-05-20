/* eslint-disable default-param-last */

import { faker } from "@faker-js/faker";
import { OrderComboItem } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export function makeRepositoryOrderComboItem(
  override: Partial<OrderComboItem> = {}
): OrderComboItem {
  const repositoryComboItem = {
    id: faker.string.uuid(),
    order_id: faker.string.uuid(),
    combo_id: faker.string.uuid(),
    annotation: faker.string.uuid(),
    quantity: faker.number.int(),
    total_price: new Decimal(faker.number.float()),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
    ...override,
  } as OrderComboItem;

  return repositoryComboItem;
}
