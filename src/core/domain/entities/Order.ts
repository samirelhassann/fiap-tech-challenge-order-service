/* eslint-disable import/no-cycle */

import { AggregateRoot } from "../base/entities/AggregateRoot";
import { UniqueEntityId } from "../base/entities/UniqueEntityId";
import { Optional } from "../base/types/Optional";
import { OrderComboItemList } from "./OrderComboItemList";

export interface OrderProps {
  number: bigint;
  totalPrice: number;
  createdAt: Date;
  userId?: UniqueEntityId;
  visitorName?: string;
  updatedAt?: Date;
  paymentId?: string;
  combos: OrderComboItemList;
}

export class Order extends AggregateRoot<OrderProps> {
  constructor(
    props: Optional<OrderProps, "createdAt" | "combos" | "number">,
    id?: UniqueEntityId
  ) {
    super(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        combos: props.combos ?? new OrderComboItemList(),
        number: props.number ?? BigInt(0),
      },
      id
    );
  }

  get number() {
    return this.props.number;
  }

  get totalPrice() {
    return this.props.totalPrice;
  }

  get userId() {
    return this.props.userId;
  }

  get visitorName() {
    return this.props.visitorName;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get combos() {
    return this.props.combos;
  }

  set combos(value: OrderComboItemList) {
    this.props.combos = value;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
