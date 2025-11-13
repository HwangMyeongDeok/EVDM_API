import { z } from "zod";

export const createCustomerSchema = z.object({
  body: z.object({
    full_name: z.string().min(1, "Full name is required"),
    phone: z
      .string()
      .min(9, "Phone number must have at least 9 digits")
      .max(15, "Phone number is too long"),
    email: z
      .string()
      .email("Invalid email format")
      .optional(),
    address: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Customer ID is required"),
  }),
  body: z.object({
    fullName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    address: z.string().optional(),
    dealer: z.string().optional(),
  }),
});

export const getCustomerByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Customer ID is required"),
  }),
});

export const deleteCustomerSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Customer ID is required"),
  }),
});
