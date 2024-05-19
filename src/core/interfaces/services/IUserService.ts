import { GetUserByIdResponse } from "@/adapters/services/catalogService/model/GetUserByIdResponse";

export interface IUserService {
  getUserById(userId: string): Promise<GetUserByIdResponse>;
}
