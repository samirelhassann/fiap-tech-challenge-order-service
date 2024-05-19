import { FastifyReply, FastifyRequest } from "fastify";

import { getOrdersQueryParamsSchema } from "@/adapters/controllers/order/schema/GetOrdersSchema";
import { GetOrdersViewModel } from "@/adapters/controllers/order/viewModel/GetOrdersViewModel";
import { PaginationParams } from "@/core/domain/base/PaginationParams";
import {
  GetOrdersUseCaseRequestDTO,
  GetOrdersUseCaseResponseDTO,
} from "@/core/useCases/order/dto/GetOrdersUseCaseDTO";

import { ErrorHandlingPresenter } from "../base/ErrorHandlingPresenter";
import { IControllerPresenter } from "../base/IControllerPresenter";

export class GetOrdersPresenter
  extends ErrorHandlingPresenter
  implements
    IControllerPresenter<
      GetOrdersUseCaseRequestDTO,
      GetOrdersUseCaseResponseDTO,
      GetOrdersViewModel
    >
{
  convertToUseCaseDTO(req: FastifyRequest): GetOrdersUseCaseRequestDTO {
    const { page, pageSize, userId } = getOrdersQueryParamsSchema.parse(
      req.query
    );

    const params = new PaginationParams(page, pageSize);

    return {
      params,
      userId,
    };
  }

  convertToViewModel(model: GetOrdersUseCaseResponseDTO): GetOrdersViewModel {
    return model.paginationResponse.toResponse((order) => ({
      id: order.id.toString(),
      number: order.number.toString(),
      clientId: order.userId?.toString(),
      visitorName: order.visitorName,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt?.toISOString(),
    }));
  }

  async sendResponse(res: FastifyReply, response: GetOrdersUseCaseResponseDTO) {
    return res.status(200).send(this.convertToViewModel(response));
  }
}
