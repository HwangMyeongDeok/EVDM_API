import { Schema, model } from 'mongoose';
import { IPayment } from './payment.interface';

const PaymentSchema = new Schema<IPayment>({
  dealer: { type: Schema.Types.ObjectId, ref: 'Dealer', required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  contract: { type: Schema.Types.ObjectId, ref: 'Contract' },
  transactionId: String,
  amount: { type: Number, required: true },
  paymentType: { type: String, enum: ['FULL', 'INSTALLMENT'], required: true },
  paymentMethod: { type: String, enum: ['BANK_TRANSFER', 'CASH', 'CREDIT_CARD'], required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], required: true },
  paymentContext: { type: String, enum: ['CUSTOMER', 'DEALER'], default: 'CUSTOMER' },
  paymentDate: { type: Date, default: Date.now },
}, { timestamps: true });

export const PaymentModel = model<IPayment>('Payment', PaymentSchema);