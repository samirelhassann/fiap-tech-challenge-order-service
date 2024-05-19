import { ICatalogService } from "@/core/interfaces/services/ICatalogService";

import api from "./api";
import { CreateComboRequest } from "./model/CreateComboRequest";
import { CreateComboResponse } from "./model/CreateComboResponse";
import { GetComboByIdResponse } from "./model/GetComboByIdResponse";

export class CatalogService implements ICatalogService {
  async createCombo(props: CreateComboRequest): Promise<CreateComboResponse> {
    const endpoint = "/combos";

    return api
      .post<CreateComboResponse>(endpoint, props)
      .then((res) => res.data)
      .catch((error) => {
        throw new Error(error.response.data.message);
      });
  }

  async getComboById(id: string): Promise<GetComboByIdResponse> {
    const endpoint = `/combos/${id}`;

    return api
      .get<GetComboByIdResponse>(endpoint)
      .then((res) => res.data)
      .catch((error) => {
        throw new Error(error.response.data.message);
      });
  }
}
