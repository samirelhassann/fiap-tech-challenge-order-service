import { IStatusService } from "@/core/interfaces/services/IStatusService";

import api from "./api";
import { UpdateOrderStatusRequest } from "./model/UpdateOrderStatusRequest";

export class StatusService implements IStatusService {
  async updateOrderStatus({
    orderId,
    status,
  }: UpdateOrderStatusRequest): Promise<void> {
    const endpoint = `/${orderId}`;

    return api
      .patch<void>(endpoint, {
        status,
      })
      .then((res) => res.data)
      .catch((error) => {
        throw new Error(error.response.data.message);
      });
  }
}
