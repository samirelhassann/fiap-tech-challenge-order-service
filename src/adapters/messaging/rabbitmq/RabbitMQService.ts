import amqp, { Channel, Connection, Message } from "amqplib";

import { env } from "@/config/env";
import { NewOrderMessage } from "@/core/domain/messaging/NewOrderToMessage";
import { IMessageQueueService } from "@/core/interfaces/messaging/IMessageQueueService";

export class RabbitMQService implements IMessageQueueService {
  private static instance: RabbitMQService;

  private connection: Connection | null = null;

  private channel: Channel | null = null;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): RabbitMQService {
    if (!RabbitMQService.instance) {
      RabbitMQService.instance = new RabbitMQService();
    }
    return RabbitMQService.instance;
  }

  public async connect(): Promise<void> {
    if (this.connection && this.channel) {
      return;
    }

    const uri = `amqp://${env.RABBITMQ_USER}:${env.RABBITMQ_PASSWORD}@${env.RABBITMQ_URL}:${env.RABBITMQ_PORT}`;

    this.connection = await amqp.connect(uri);
    this.channel = await this.connection.createChannel();
  }

  public async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  public async consume(
    queueName: string,
    onMessage: (message: Message) => void
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel is not available");
    }

    await this.channel.assertQueue(queueName, { durable: true });
    this.channel.consume(queueName, (message) => {
      if (message) {
        onMessage(message);
        this.channel?.ack(message);
      }
    });
  }

  public async publishNewOrderMessage(message: NewOrderMessage): Promise<void> {
    await this.connect();

    if (!this.channel) {
      throw new Error("RabbitMQ channel is not available");
    }

    const queueName = env.RABBITMQ_NEW_ORDER_QUEUE;

    await this.channel.assertQueue(queueName, { durable: true });
    this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
  }
}
