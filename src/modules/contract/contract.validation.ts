import { z } from "zod";

export const createFromQuotationSchema = z.object({
  body: z.object({
    delivery_date: z.string().optional(),
    payment_plan: z.enum(["FULL", "DEPOSIT"]),
    deposit_amount: z.number().min(0).optional(),
  }),
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive()),
  }),
});

export const createManualSchema = z.object({
  body: z.object({
    customer_id: z.number().int().positive(),
    delivery_date: z.string().optional(),
    payment_plan: z.enum(["FULL", "DEPOSIT"]),
    deposit_amount: z.number().min(0).optional(),
    total_amount: z.number().min(0),
    items: z.array(
      z.object({
        variant_id: z.number().int().positive(),
        quantity: z.number().int().min(1),
        unit_price: z.number().min(0),
        color: z.string().optional(),
        description: z.string().optional(),
      })
    ),
  }),
});

export const uploadAttachmentSchema = z.object({
  body: z.object({
    type: z.enum([
      "CCCD_FRONT",
      "CCCD_BACK",
      "HO_KHAU",
      "HOA_DON",
      "OTHER",
    ]),
    file_url: z.string().url(),
  }),
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive()),
  }),
});

export const makePaymentSchema = z.object({
  body: z.object({
    amount: z.number().min(0),
    method: z.enum(["CASH", "BANK", "CARD"]),
    note: z.string().optional(),
  }),
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive()),
  }),
});

export const deliverContractSchema = z.object({
  body: z.object({
    vin: z.string().length(17),
    license_plate: z.string().optional(),
    delivery_photos: z.array(z.string().url()).optional(),
  }),
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive()),
  }),
});

export const approveContractSchema = z.object({
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive()),
  }),
});