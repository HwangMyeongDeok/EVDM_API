import { Document } from 'mongoose';

export interface IDealer extends Document {
  dealerName: string;
  address?: string;
  phone?: string;
  email?: string;
}