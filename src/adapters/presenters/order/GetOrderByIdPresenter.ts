import { FastifyReply, FastifyRequest } from "fastify";

import { getOrderByIdPathParamsSchema } from "@/adapters/controllers/order/schema/GetOrderByIdSchema";
import { GetOrderByIdViewModel } from "@/adapters/controllers/order/viewModel/GetOrderByIdViewModel";
import {
  GetOrderByIdUseCaseRequestDTO,
  GetOrderByIdUseCaseResponseDTO,
} from "@/core/useCases/order/dto/GetOrderByIdUseCaseDTO";

import { ErrorHandlingPresenter } from "../base/ErrorHandlingPresenter";
import { IControllerPresenter } from "../base/IControllerPresenter";

export class GetOrderByIdPresenter
  extends ErrorHandlingPresenter
  implements
    IControllerPresenter<
      GetOrderByIdUseCaseRequestDTO,
      GetOrderByIdUseCaseResponseDTO,
      GetOrderByIdViewModel
    >
{
  convertToUseCaseDTO(req: FastifyRequest): GetOrderByIdUseCaseRequestDTO {
    const { id } = getOrderByIdPathParamsSchema.parse(req.params);

    return {
      id,
    };
  }

  convertToViewModel(
    model: GetOrderByIdUseCaseResponseDTO
  ): GetOrderByIdViewModel {
    const { userDetails } = model;

    let user;

    if (userDetails) {
      user = {
        id: userDetails.id.toString(),
        name: userDetails.name,
      };
    }

    return {
      id: model.order.id.toString(),
      number: model.order.number.toString(),
      user,
      visitorName: model.order.visitorName,
      totalPrice: model.order.totalPrice,
      createdAt: model.order.createdAt.toISOString(),
      updatedAt: model.order.updatedAt?.toISOString(),
      combos: model.combos.map((combo) => ({
        id: combo.id.toString(),
        name: combo.name,
        description: combo.description,
        price: combo.price,
        quantity: model.orderCombos.find(
          (oc) => combo.id.toString() === oc.comboId.toString()
        )!.quantity,
        annotation: model.orderCombos.find(
          (oc) => combo.id.toString() === oc.comboId.toString()
        )!.annotation,
        products:
          combo.products.map((p) => ({
            id: p.id.toString(),
            name: p.name,
            description: p.description,
            price: p.price,
          })) ?? [],
      })),
    };
  }

  async sendResponse(
    res: FastifyReply,
    response: GetOrderByIdUseCaseResponseDTO
  ) {
    return res.status(200).send(this.convertToViewModel(response));
  }
}
