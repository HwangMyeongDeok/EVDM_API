import { Document, Types } from 'mongoose';

export interface IPayment extends Document {
  dealer: Types.ObjectId  | string;
  customer: Types.ObjectId  | string;
  contract?: Types.ObjectId | string;
  transactionId?: string;
  amount: number;
  paymentType: 'FULL' | 'INSTALLMENT';
  paymentMethod: 'BANK_TRANSFER' | 'CASH' | 'CREDIT_CARD';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentContext: 'CUSTOMER' | 'DEALER';
  paymentDate: Date;
}