import { z } from "zod";

// Schema tạo mới đại lý
export const createDealerSchema = z.object({
  body: z.object({
    dealer_name: z.string().min(2, "Dealer name is required"),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
  }),
});

// Schema cập nhật đại lý
export const updateDealerSchema = z.object({
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive()),
  }),
  body: z.object({
    dealer_name: z.string().min(2).optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
  }),
});

// Schema lấy chi tiết hoặc xóa đại lý
export const dealerIdParamSchema = z.object({
  params: z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive()),
  }),
});
