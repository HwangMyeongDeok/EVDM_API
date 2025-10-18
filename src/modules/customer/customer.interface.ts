import { Document, Types } from 'mongoose';

export interface ICustomer extends Document {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  dealer: Types.ObjectId;
}