import { IUserService } from "@/core/interfaces/services/IUserService";

import api from "./api";
import { GetUserByIdResponse } from "./model/GetUserByIdResponse";

export class UserService implements IUserService {
  async getUserById(id: string): Promise<GetUserByIdResponse> {
    const endpoint = `/users/${id}`;

    return api
      .get<GetUserByIdResponse>(endpoint)
      .then((res) => res.data)
      .catch((error) => {
        throw new Error(error.response.data.message);
      });
  }
}
