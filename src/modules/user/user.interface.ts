import { Document, Types } from 'mongoose';

export type UserRole = 'DEALER_STAFF' | 'DEALER_MANAGER' | 'EVM_STAFF' | 'ADMIN';

export interface IUser extends Document {
  email: string;
  password?: string;
  role: UserRole;
  dealer?: Types.ObjectId;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
}