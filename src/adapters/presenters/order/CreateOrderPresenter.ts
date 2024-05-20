/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import { FastifyReply, FastifyRequest } from "fastify";

import { createOrderPayloadSchema } from "@/adapters/controllers/order/schema/CreateOrderSchema";
import { CreateOrderViewModel } from "@/adapters/controllers/order/viewModel/CreateOrderViewModel";
import { MinimumResourcesNotReached } from "@/core/domain/base/errors/useCases/MinimumResourcesNotReached";
import {
  CreateOrderUseCaseRequestDTO,
  CreateOrderUseCaseResponseDTO,
} from "@/core/useCases/order/dto/CreateOrderUseCaseDTO";

import { ErrorHandlingPresenter } from "../base/ErrorHandlingPresenter";
import { IControllerPresenter } from "../base/IControllerPresenter";

export class CreateOrderPresenter
  extends ErrorHandlingPresenter
  implements
    IControllerPresenter<
      CreateOrderUseCaseRequestDTO,
      CreateOrderUseCaseResponseDTO,
      CreateOrderViewModel
    >
{
  convertToUseCaseDTO(req: FastifyRequest): CreateOrderUseCaseRequestDTO {
    const parsedRequest = createOrderPayloadSchema.parse(req.body);

    const userId = req.isAnonymous ? undefined : req.userId;

    return {
      ...parsedRequest,
      userId,
    };
  }

  convertToViewModel(
    model: CreateOrderUseCaseResponseDTO
  ): CreateOrderViewModel {
    return {
      id: model.order.id.toString(),
      numberId: model.order.number.toString(),
      paymentDetails: model.paymentDetails,
    };
  }

  async sendResponse(
    res: FastifyReply,
    response: CreateOrderUseCaseResponseDTO
  ) {
    return res.status(201).send(this.convertToViewModel(response));
  }

  convertErrorResponse(error: Error, res: FastifyReply): FastifyReply {
    if (error instanceof MinimumResourcesNotReached) {
      return res.status(400).send({
        message: `For unauthorized requests, the visitorName field is required`,
      });
    }

    return super.convertErrorResponse(error, res);
  }
}
