import { FastifyReply, FastifyRequest } from "fastify";

import { CreateOrderPresenter } from "@/adapters/presenters/order/CreateOrderPresenter";
import { GetOrderByIdPresenter } from "@/adapters/presenters/order/GetOrderByIdPresenter";
import { GetOrdersPresenter } from "@/adapters/presenters/order/GetOrdersPresenter";
import { IOrderUseCase } from "@/core/useCases/order/IOrderUseCase";

import { GetOrdersViewModel } from "./viewModel/GetOrdersViewModel";

export class OrderController {
  constructor(
    private orderUseCase: IOrderUseCase,
    private getOrdersPresenter: GetOrdersPresenter,
    private createOrderPresenter: CreateOrderPresenter,
    private getOrderByIdPresenter: GetOrderByIdPresenter
  ) {}

  async getOrders(
    req: FastifyRequest,
    res: FastifyReply
  ): Promise<GetOrdersViewModel> {
    return this.orderUseCase
      .getOrders(this.getOrdersPresenter.convertToUseCaseDTO(req))
      .then((response) => this.getOrdersPresenter.sendResponse(res, response))
      .catch((error) =>
        this.getOrdersPresenter.convertErrorResponse(error, res)
      );
  }

  async getOrderById(
    req: FastifyRequest,
    res: FastifyReply
  ): Promise<GetOrdersViewModel> {
    return this.orderUseCase
      .getOrderById(this.getOrderByIdPresenter.convertToUseCaseDTO(req))
      .then((response) =>
        this.getOrderByIdPresenter.sendResponse(res, response)
      )
      .catch((error) =>
        this.getOrderByIdPresenter.convertErrorResponse(error, res)
      );
  }

  async createOrder(req: FastifyRequest, res: FastifyReply): Promise<void> {
    return this.orderUseCase
      .createOrder(this.createOrderPresenter.convertToUseCaseDTO(req))
      .then((response) => this.createOrderPresenter.sendResponse(res, response))
      .catch((error) =>
        this.createOrderPresenter.convertErrorResponse(error, res)
      );
  }
}
