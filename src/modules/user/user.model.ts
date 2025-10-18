import { Schema, model } from 'mongoose';
import { IUser } from './user.interface';

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['DEALER_STAFF', 'DEALER_MANAGER', 'EVM_STAFF', 'ADMIN'], required: true },
  dealer: { type: Schema.Types.ObjectId, ref: 'Dealer' },
  fullName: { type: String, required: true },
  phone: { type: String },
  avatarUrl: { type: String },
}, { timestamps: true });

export const UserModel = model<IUser>('User', UserSchema);