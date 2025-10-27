import { z } from "zod";

export const createAllocationSchema = z.object({
  body: z.object({
    dealer_id: z.number().int().positive("Dealer ID is required"),
    variant_id: z.number().int().positive("Variant ID is required"),
    allocated_quantity: z.number().int().min(1, "Allocated quantity must be at least 1"),
    request_id: z.number().int().positive().optional(),
  }),
});

export const allocationIdParamSchema = z.object({
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive("Invalid allocation ID")),
  }),
});
