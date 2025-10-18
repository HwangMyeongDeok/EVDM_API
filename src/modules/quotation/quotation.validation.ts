import { z } from "zod";

export const quotationItemSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  description: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  discountAmount: z.number().min(0, "Discount amount must be non-negative").default(0),
  lineTotal: z.number().min(0, "Line total must be non-negative"),
});

export const createQuotationSchema = z.object({
  body: z.object({
    quotationNumber: z.string().min(1, "Quotation number is required"),
    customer: z.string().min(1, "Customer ID is required"),
    dealer: z.string().min(1, "Dealer ID is required"),
    staff: z.string().min(1, "Staff ID is required"),
    status: z
      .enum(["DRAFT", "SENT", "APPROVED", "REJECTED"])
      .default("DRAFT"),
    subtotal: z.number().min(0, "Subtotal must be non-negative"),
    taxRate: z.number().min(0).max(100).default(10),
    taxAmount: z.number().min(0, "Tax amount must be non-negative"),
    discountTotal: z.number().min(0).default(0),
    totalAmount: z.number().min(0, "Total amount must be non-negative"),
    notes: z.string().optional(),
    approvedBy: z.string().optional(),
    items: z
      .array(quotationItemSchema)
      .min(1, "Quotation must have at least one item"),
  }),
});

export const updateQuotationSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Quotation ID is required"),
  }),
  body: z
    .object({
      quotationNumber: z.string().optional(),
      customer: z.string().optional(),
      dealer: z.string().optional(),
      staff: z.string().optional(),
      status: z.enum(["DRAFT", "SENT", "APPROVED", "REJECTED"]).optional(),
      subtotal: z.number().min(0).optional(),
      taxRate: z.number().min(0).max(100).optional(),
      taxAmount: z.number().min(0).optional(),
      discountTotal: z.number().min(0).optional(),
      totalAmount: z.number().min(0).optional(),
      notes: z.string().optional(),
      approvedBy: z.string().optional(),
      items: z.array(quotationItemSchema).optional(),
    })
    .strict(),
});

export const quotationIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Quotation ID is required"),
  }),
});
