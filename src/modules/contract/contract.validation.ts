import { z } from "zod";

export const contractItemSchema = z.object({
  variantId: z.string().min(1, "variantId is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Unit price must be >= 0"),
  discountAmount: z.number().min(0).default(0),
  lineTotal: z.number().min(0, "Line total must be >= 0"),
});

export const createContractSchema = z.object({
  body: z.object({
    contractNumber: z.string().min(1, "Contract number is required"),
    quotation: z.string().min(1, "Quotation is required"),
    dealer: z.string().min(1, "Dealer is required"),
    customer: z.string().min(1, "Customer is required"),
    staff: z.string().min(1, "Staff is required"),
    approvedBy: z.string().optional(),

    contractDate: z.coerce.date().refine((v) => !isNaN(v.getTime()), {
      message: "Invalid contract date",
    }),
    deliveryDate: z.coerce
      .date()
      .refine((v) => !isNaN(v.getTime()), {
        message: "Invalid delivery date",
      })
      .optional(),

    status: z
      .enum([
        "DRAFT",
        "PENDING_SIGN",
        "SIGNED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ])
      .optional(),

    totalAmount: z.number().min(0, "Total amount must be >= 0"),
    discountAmount: z.number().min(0).default(0),
    finalAmount: z.number().min(0, "Final amount must be >= 0"),

    paymentStatus: z.enum(["UNPAID", "PARTIAL", "PAID"]).optional(),
    paymentPlan: z.enum(["FULL", "DEPOSIT"]).optional(),

    depositAmount: z.number().min(0).default(0),
    remainingAmount: z.number().min(0, "Remaining amount must be >= 0"),

    items: z.array(contractItemSchema).min(1, "At least one contract item is required"),
  }),
});

export const updateContractSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Contract ID is required"),
  }),
  body: z.object({
    quotation: z.string().optional(),
    dealer: z.string().optional(),
    customer: z.string().optional(),
    staff: z.string().optional(),
    approvedBy: z.string().optional(),
    contractDate: z.coerce.date().optional(),
    deliveryDate: z.coerce.date().optional(),
    status: z
      .enum([
        "DRAFT",
        "PENDING_SIGN",
        "SIGNED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ])
      .optional(),
    totalAmount: z.number().min(0).optional(),
    discountAmount: z.number().min(0).optional(),
    finalAmount: z.number().min(0).optional(),
    paymentStatus: z.enum(["UNPAID", "PARTIAL", "PAID"]).optional(),
    paymentPlan: z.enum(["FULL", "DEPOSIT"]).optional(),
    depositAmount: z.number().min(0).optional(),
    remainingAmount: z.number().min(0).optional(),
    items: z.array(contractItemSchema).optional(),
  }),
});

export const getContractByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Contract ID is required"),
  }),
});

export const approveContractSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Contract ID is required"),
  }),
});

export const handoverContractSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Contract ID is required"),
  }),
  body: z.object({
    handoverDate: z.coerce
      .date()
      .refine((v) => !isNaN(v.getTime()), { message: "Invalid handover date" })
      .optional(),
    notes: z.string().optional(),
  }),
});