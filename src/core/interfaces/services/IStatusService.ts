import { UpdateOrderStatusRequest } from "@/adapters/services/statusService/model/UpdateOrderStatusRequest";

export interface IStatusService {
  updateOrderStatus(props: UpdateOrderStatusRequest): Promise<void>;
}
