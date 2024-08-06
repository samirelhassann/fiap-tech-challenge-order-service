import { NewOrderMessage } from "@/core/domain/messaging/NewOrderToMessage";

export interface IMessageQueueService {
  connect(): Promise<void>;
  close(): Promise<void>;

  publishNewOrderMessage(message: NewOrderMessage): Promise<void>;
}
