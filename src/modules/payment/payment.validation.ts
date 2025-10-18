import { z } from "zod";

export const createPaymentSchema = z.object({
  body: z.object({
    dealer: z.string().min(1, "Dealer ID is required"),
    customer: z.string().min(1, "Customer ID is required"),
    contract: z.string().optional(),
    transactionId: z.string().optional(),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    paymentType: z.enum(["FULL", "INSTALLMENT"] as const, {
      message: "Payment type is required",
    }),
    paymentMethod: z.enum(["BANK_TRANSFER", "CASH", "CREDIT_CARD"] as const, {
      message: "Payment method is required",
    }),
    paymentStatus: z
      .enum(["PENDING", "COMPLETED", "FAILED"] as const, {
        message: "Payment status is required",
      })
      .default("PENDING"),
    paymentContext: z
      .enum(["CUSTOMER", "DEALER"] as const)
      .default("CUSTOMER"),
    paymentDate: z.coerce
      .date()
      .refine((v) => !isNaN(v.getTime()), { message: "Invalid payment date" })
      .optional(),
  }),
});

export const updatePaymentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Payment ID is required"),
  }),
  body: z.object({
    dealer: z.string().optional(),
    customer: z.string().optional(),
    contract: z.string().optional(),
    transactionId: z.string().optional(),
    amount: z.number().min(0).optional(),
    paymentType: z.enum(["FULL", "INSTALLMENT"] as const).optional(),
    paymentMethod: z.enum(["BANK_TRANSFER", "CASH", "CREDIT_CARD"] as const).optional(),
    paymentStatus: z.enum(["PENDING", "COMPLETED", "FAILED"] as const).optional(),
    paymentContext: z.enum(["CUSTOMER", "DEALER"] as const).optional(),
    paymentDate: z.coerce.date().optional(),
  }),
});

export const getPaymentByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Payment ID is required"),
  }),
});

export const deletePaymentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Payment ID is required"),
  }),
});
