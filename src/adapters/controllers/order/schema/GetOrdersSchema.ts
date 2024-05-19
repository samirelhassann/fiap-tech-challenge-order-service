import { z } from "zod";

import { generateSchemaFromSampleObject } from "@/drivers/webserver/utils/generateSchemaFromSampleObject";

import { GetOrdersViewModel } from "../viewModel/GetOrdersViewModel";
import { tag } from "./constants";

export const getOrdersQueryParamsSchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(20),
  userId: z.string().optional(),
});

const responseExample: GetOrdersViewModel = {
  data: [
    {
      id: "123",
      number: "1",
      userId: "123",
      visitorName: "John Doe",
      totalPrice: 100,
      createdAt: "2021-10-26",
      updatedAt: "2021-10-27",
    },
  ],
  pagination: {
    totalItems: 1,
    currentPage: 1,
    pageSize: 20,
    totalPages: 1,
  },
};

export const getOrdersDocSchema = {
  tags: [tag],
  description: `List ${tag}s`,
  querystring: {
    type: "object",
    properties: {
      page: { type: "number" },
      pageSize: { type: "number" },
      userId: { type: "string" },
    },
  },
  response: {
    200: generateSchemaFromSampleObject(responseExample),
  },
};
