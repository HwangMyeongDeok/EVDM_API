import { Document, Types } from 'mongoose';

export interface IVehicleUnit extends Types.Subdocument {
  vin: string;
  dealer?: Types.ObjectId;
  importDate: Date;
  status: 'IN_TRANSIT' | 'IN_DEALER' | 'SOLD';
}

export interface IVehicleVariant extends Types.Subdocument {
  version: string;
  color: string;
  dealerPrice: number;
  basePrice: number;
  retailPrice: number;
  discountPercent: number;
  modelYear: number;
  batteryCapacityKwh?: number;
  rangeKm?: number;
  motorPowerKw?: number;
  acceleration0100?: number;
  topSpeedKmh?: number;
  chargingTimeHours?: number;
  status: 'ACTIVE' | 'DISCONTINUED';
  units: IVehicleUnit[]; 
}

export interface IVehicle extends Document {
  modelName: string;
  specifications?: string;
  bodyType: 'SUV' | 'Sedan' | 'Hatchback' | 'Crossover' | 'Pickup' | 'MPV';
  seats: number;
  doors: number;
  warrantyYears: number;
  description?: string;
  imageUrl?: string;
  variants: IVehicleVariant[]; 
}