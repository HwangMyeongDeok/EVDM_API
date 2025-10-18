import { Schema, model, Types } from 'mongoose';
import { IVehicle, IVehicleUnit, IVehicleVariant } from './vehicle.interface';

const VehicleUnitSchema = new Schema<IVehicleUnit>({
    vin: { type: String, required: true, unique: true },
    dealer: { type: Types.ObjectId, ref: 'Dealer' },
    importDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['IN_TRANSIT', 'IN_DEALER', 'SOLD'],
        default: 'IN_TRANSIT'
    }
});


const VehicleVariantSchema = new Schema<IVehicleVariant>({
    version: { type: String, required: true },
    color: { type: String, required: true },
    dealerPrice: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    retailPrice: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 }, 
    modelYear: { type: Number, default: new Date().getFullYear() + 1 },
    batteryCapacityKwh: Number,
    rangeKm: Number,
    motorPowerKw: Number,
    acceleration0100: Number,
    topSpeedKmh: Number,
    chargingTimeHours: Number,
    status: { type: String, enum: ['ACTIVE', 'DISCONTINUED'], default: 'ACTIVE' },
    units: [VehicleUnitSchema]
});


const VehicleSchema = new Schema<IVehicle>({
    modelName: { type: String, required: true, unique: true },
    specifications: String, 
    bodyType: { type: String, enum: ['SUV','Sedan','Hatchback','Crossover','Pickup','MPV'], required: true },
    seats: { type: Number, default: 5 }, 
    doors: { type: Number, default: 5 },
    warrantyYears: { type: Number, default: 10 }, 
    description: String,
    imageUrl: String,
    variants: [VehicleVariantSchema]
}, { timestamps: true });

export const VehicleModel = model('Vehicle', VehicleSchema);