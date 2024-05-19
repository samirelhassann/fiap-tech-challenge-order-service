import { z } from "zod";

import { convertZodSchemaToDocsTemplate } from "@/drivers/webserver/utils/convertZodSchemaToDocsTemplate";
import { generateSchemaFromSampleObject } from "@/drivers/webserver/utils/generateSchemaFromSampleObject";

import { GetOrderByIdViewModel } from "../viewModel/GetOrderByIdViewModel";
import { tag } from "./constants";

export const getOrderByIdPathParamsSchema = z.object({
  id: z.string(),
});

const responseExample: GetOrderByIdViewModel = {
  id: "1",
  number: "1",
  user: {
    id: "1",
    name: "User 1",
  },
  totalPrice: 10,
  createdAt: "2021-01-01T00:00:00.000Z",
  visitorName: "John Doe",
  updatedAt: "2021-01-01T00:00:00.000Z",
  combos: [
    {
      id: "1",
      name: "Combo 1",
      description: "Combo 1",
      price: 10,
      quantity: 1,
      annotation: "annotation",
      products: [
        {
          id: "1",
          name: "Product 1",
          description: "Product 1",
          price: 10,
        },
      ],
    },
  ],
};

export const getOrderByIdDocSchema = {
  tags: [tag],
  description: `List ${tag}s`,
  params: convertZodSchemaToDocsTemplate({
    schema: getOrderByIdPathParamsSchema,
  }),
  response: {
    200: generateSchemaFromSampleObject(responseExample),
  },
};
