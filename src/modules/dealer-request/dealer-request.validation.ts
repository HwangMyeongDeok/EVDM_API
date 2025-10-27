import { z } from "zod";

export const createRequestSchema = z.object({
  body: z.object({
    variant_id: z.number().int().positive("Variant ID is required"),
    requested_quantity: z.number().int().min(1, "Requested quantity must be at least 1"),
  }),
});

export const requestIdParamSchema = z.object({
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive("Invalid request ID")),
  }),
});

export const rejectRequestSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }),
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive("Invalid request ID")),
  }),
});
