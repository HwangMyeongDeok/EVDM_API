import { Schema, model } from 'mongoose';
import { IQuotation, IQuotationItem } from './quotation.interface';

const QuotationItemSchema = new Schema<IQuotationItem>({
  variantId: { type: Schema.Types.ObjectId, ref: 'VehicleVariant', required: true },
  description: String,
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  lineTotal: { type: Number, required: true },
}, { _id: false });

const QuotationSchema = new Schema<IQuotation>({
  quotationNumber: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  dealer: { type: Schema.Types.ObjectId, ref: 'Dealer', required: true },
  staff: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['DRAFT', 'SENT', 'APPROVED', 'REJECTED'], default: 'DRAFT' },
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 10 },
  taxAmount: { type: Number, required: true },
  discountTotal: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  notes: String,
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [QuotationItemSchema],
}, { timestamps: true });

export const QuotationModel = model<IQuotation>('Quotation', QuotationSchema);