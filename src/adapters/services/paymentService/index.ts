import { IPaymentService } from "@/core/interfaces/services/IPaymentService";

import api from "./api";
import { CreatePaymentRequest } from "./model/CreatePaymentRequest";
import { CreatePaymentResponse } from "./model/CreatePaymentResponse";

export class PaymentService implements IPaymentService {
  async createPayment(
    props: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> {
    const endpoint = `/create`;

    return api
      .post<CreatePaymentResponse>(endpoint, {
        ...props,
      })
      .then((res) => res.data)
      .catch((error) => {
        throw new Error(error.response.data.message);
      });
  }
}
