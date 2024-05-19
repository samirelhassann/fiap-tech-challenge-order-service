import { ResourceNotFoundError } from "@/core/domain/base/errors/useCases/ResourceNotFoundError";
import { Order } from "@/core/domain/entities/Order";
import { IOrderRepository } from "@/core/interfaces/repositories/IOrderRepository";
import { ICatalogService } from "@/core/interfaces/services/ICatalogService";
import { IUserService } from "@/core/interfaces/services/IUserService";

import {
  GetOrderByIdUseCaseRequestDTO,
  GetOrderByIdUseCaseResponseDTO,
} from "../dto/GetOrderByIdUseCaseDTO";

export class GetOrderByIdUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private catalogService: ICatalogService,
    private userService: IUserService
  ) {}

  async execute({
    id,
  }: GetOrderByIdUseCaseRequestDTO): Promise<GetOrderByIdUseCaseResponseDTO> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new ResourceNotFoundError(Order.name);
    }

    const orderCombos = order.combos.getItems();

    const combosDetailsPromise = orderCombos.map(async (c) =>
      this.catalogService.getComboById(c.comboId.toString())
    );

    const combosDetails = await Promise.all(combosDetailsPromise);

    let userDetails;

    if (order.userId) {
      userDetails = await this.userService.getUserById(
        order.userId?.toString()
      );
    }

    return {
      order,
      orderCombos,
      combos: combosDetails,
      userDetails,
    };
  }
}
