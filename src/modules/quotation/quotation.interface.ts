import { Document, Types } from "mongoose";

export interface IQuotationItem {
  variantId: Types.ObjectId | string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
}

export interface IQuotation extends Document {
  _id: Types.ObjectId;
  quotationNumber: string;
  customer: Types.ObjectId | string;
  dealer: Types.ObjectId | string;
  staff: Types.ObjectId | string;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED";
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountTotal: number;
  totalAmount: number;
  notes?: string;
  approvedBy?: Types.ObjectId | string;
  items: IQuotationItem[];
}

export interface CreateQuotationItemDto {
  variantId: string;
  quantity: number;
}

export interface CreateQuotationDto {
  customerId: string;
  items: CreateQuotationItemDto[];
  notes?: string;
}
