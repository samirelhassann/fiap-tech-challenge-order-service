import { IOrderRepository } from "@/core/interfaces/repositories/IOrderRepository";

import {
  GetOrdersUseCaseRequestDTO,
  GetOrdersUseCaseResponseDTO,
} from "../dto/GetOrdersUseCaseDTO";

export class GetOrdersUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute({
    params,
    userId,
  }: GetOrdersUseCaseRequestDTO): Promise<GetOrdersUseCaseResponseDTO> {
    const paginationResponse = await this.orderRepository.findMany(
      params,
      userId
    );

    return { paginationResponse };
  }
}
