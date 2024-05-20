import { CreatePaymentRequest } from "@/adapters/services/paymentService/model/CreatePaymentRequest";
import { CreatePaymentResponse } from "@/adapters/services/paymentService/model/CreatePaymentResponse";

export interface IPaymentService {
  createPayment(props: CreatePaymentRequest): Promise<CreatePaymentResponse>;
}
