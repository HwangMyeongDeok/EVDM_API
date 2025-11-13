import { z } from "zod";

export const rangeQuerySchema = z.object({
  query: z.object({
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Tham số `from` không hợp lệ. Định dạng phải là YYYY-MM-DD.")
      .optional(),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Tham số `to` không hợp lệ. Định dạng phải là YYYY-MM-DD.")
      .optional(),
    limit: z
      .string()
      .transform((v) => Number(v))
      .pipe(
        z
          .number()
          .int()
          .positive("Tham số `limit` phải là số nguyên dương.")
      )
      .optional(),
  }),
});
