import { z } from "zod";

const itemSchema = z.object({
  variant_id: z.number().int().positive("variant_id phải là số nguyên dương"),
  requested_quantity: z.number().int().min(1, "Số lượng yêu cầu tối thiểu là 1"),
});

export const createRequestSchema = z.object({
  body: z.object({
    items: z.array(itemSchema)
      .min(1, "Danh sách mẫu xe (items) không được rỗng")
      .refine(arr => new Set(arr.map(i => i.variant_id)).size === arr.length, {
        message: "Danh sách items có variant_id bị trùng",
      }),
  }),
});

export const requestIdParamSchema = z.object({
  params: z.object({
    id: z.string().transform(Number).pipe(
      z.number().int().positive("request_id không hợp lệ")
    ),
  }),
});
