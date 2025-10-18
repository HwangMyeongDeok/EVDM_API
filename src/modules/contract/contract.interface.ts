import { Document, Types } from 'mongoose';

export interface IContractItem extends Types.Subdocument {
  variantId: Types.ObjectId | string;
  description?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
}

export interface IContract extends Document {
  _id: Types.ObjectId | string;
  contractNumber: string; 
  quotation: Types.ObjectId | string;
  dealer: Types.ObjectId  | string;
  customer: Types.ObjectId  | string;
  staff: Types.ObjectId | string;
  approvedBy?: Types.ObjectId | string;
  contractDate: Date;
  deliveryDate?: Date;
  status: 'DRAFT' | 'PENDING_APPROVAL' |'PENDING_SIGN' | 'SIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  paymentPlan: 'FULL' | 'DEPOSIT';
  depositAmount: number;
  remainingAmount: number;
  items: IContractItem[];
}