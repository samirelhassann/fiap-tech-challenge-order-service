import { CreateComboRequest } from "@/adapters/services/catalogService/model/CreateComboRequest";
import { CreateComboResponse } from "@/adapters/services/catalogService/model/CreateComboResponse";
import { GetComboByIdResponse } from "@/adapters/services/catalogService/model/GetComboByIdResponse";

export interface ICatalogService {
  createCombo(props: CreateComboRequest): Promise<CreateComboResponse>;

  getComboById(id: string): Promise<GetComboByIdResponse>;
}
