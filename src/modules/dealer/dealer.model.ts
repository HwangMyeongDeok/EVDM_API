import { Schema, model } from 'mongoose';
import { IDealer } from './dealer.interface';

const DealerSchema = new Schema<IDealer>({
  dealerName: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
}, { timestamps: true });

export const DealerModel = model<IDealer>('Dealer', DealerSchema);