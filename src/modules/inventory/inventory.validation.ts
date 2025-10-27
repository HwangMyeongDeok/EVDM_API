import { z } from "zod";

export const updateStockSchema = z.object({
  body: z.object({
    variant_id: z.number().int().positive("Variant ID is required"),
    dealer_id: z.number().int().optional().nullable(),
    delta: z.number().min(-9999).max(9999, "Invalid delta value"),
  }),
});

export const inventoryIdParamSchema = z.object({
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive()),
  }),
});
