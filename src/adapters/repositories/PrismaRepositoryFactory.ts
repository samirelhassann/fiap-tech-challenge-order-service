import { PrismaOrderComboItemRepository } from "./PrismaOrderComboItemRepository";
import { PrismaOrderRepository } from "./PrismaOrderRepository";

let orderRepository: PrismaOrderRepository;
let orderComboItemRepository: PrismaOrderComboItemRepository;

export function makeOrderComboItemRepository() {
  if (!orderComboItemRepository) {
    orderComboItemRepository = new PrismaOrderComboItemRepository();
  }
  return orderComboItemRepository;
}

export function makeOrderRepository() {
  if (!orderRepository) {
    orderRepository = new PrismaOrderRepository(makeOrderComboItemRepository());
  }
  return orderRepository;
}
