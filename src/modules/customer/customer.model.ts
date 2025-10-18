import { Schema, model } from 'mongoose';
import { ICustomer } from './customer.interface';

const CustomerSchema = new Schema<ICustomer>({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  address: { type: String },
  dealer: { type: Schema.Types.ObjectId, ref: 'Dealer', required: true },
}, { timestamps: true });

export const CustomerModel = model<ICustomer>('Customer', CustomerSchema);