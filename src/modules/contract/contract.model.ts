import { Schema, model } from 'mongoose';
import { IContract, IContractItem } from './contract.interface';

const ContractItemSchema = new Schema<IContractItem>({
  variantId: { type: Schema.Types.ObjectId, ref: 'VehicleVariant', required: true },
  description: String,
  color: String,
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  lineTotal: { type: Number, required: true },
}, { _id: false });

const ContractSchema = new Schema<IContract>({
  contractNumber: { type: String, required: true, unique: true },
  quotation: { type: Schema.Types.ObjectId, ref: 'Quotation', required: true },
  dealer: { type: Schema.Types.ObjectId, ref: 'Dealer', required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  staff: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  contractDate: { type: Date, required: true },
  deliveryDate: Date,
  status: { type: String, enum: ['DRAFT', 'PENDING_SIGN', 'SIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'DRAFT' },
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['UNPAID', 'PARTIAL', 'PAID'], default: 'UNPAID' },
  paymentPlan: { type: String, enum: ['FULL', 'DEPOSIT'], default: 'FULL' },
  depositAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, required: true },
  items: [ContractItemSchema],
}, { timestamps: true });

export const ContractModel = model<IContract>('Contract', ContractSchema);