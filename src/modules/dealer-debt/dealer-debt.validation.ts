import { z } from "zod";

export const createDealerDebtSchema = z.object({
  body: z.object({
    dealer_id: z.number().int().positive("Dealer ID is required"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    due_date: z
      .string()
      .datetime({ message: "Invalid due date" })
      .optional(),
  }),
});

export const updateDealerDebtStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Debt ID is required"),
  }),
  body: z.object({
    status: z.enum(["PENDING", "PAID", "OVERDUE"]),
  }),
});

export const dealerDebtIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Debt ID is required"),
  }),
});
