/* eslint-disable no-param-reassign */
import axios from "axios";

import { env } from "@/config/env";

const api = axios.create({
  baseURL: env.PAYMENT_SERVICE_URL,
});

export default api;
