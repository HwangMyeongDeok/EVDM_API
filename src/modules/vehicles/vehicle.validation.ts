import { z } from "zod";

export const vehicleUnitSchema = z.object({
  vin: z.string().min(1, "VIN is required"),
  dealer: z.string().optional(),
  importDate: z.coerce.date().optional(),
  status: z
    .enum(["IN_TRANSIT", "IN_DEALER", "SOLD"])
    .default("IN_TRANSIT"),
});

export const vehicleVariantSchema = z.object({
  version: z.string().min(1, "Version is required"),
  color: z.string().min(1, "Color is required"),
  dealerPrice: z.number().min(0, "Dealer price must be non-negative"),
  basePrice: z.number().min(0, "Base price must be non-negative"),
  retailPrice: z.number().min(0, "Retail price must be non-negative"),
  discountPercent: z.number().min(0).max(100).default(0),
  modelYear: z.number().int().min(2000).max(2100).default(new Date().getFullYear() + 1),
  batteryCapacityKwh: z.number().min(0).optional(),
  rangeKm: z.number().min(0).optional(),
  motorPowerKw: z.number().min(0).optional(),
  acceleration0100: z.number().min(0).optional(),
  topSpeedKmh: z.number().min(0).optional(),
  chargingTimeHours: z.number().min(0).optional(),
  status: z.enum(["ACTIVE", "DISCONTINUED"]).default("ACTIVE"),
  units: z.array(vehicleUnitSchema).optional(),
});

export const createVehicleSchema = z.object({
  body: z.object({
    modelName: z.string().min(1, "Model name is required"),
    specifications: z.string().optional(),
    bodyType: z.enum(["SUV", "Sedan", "Hatchback", "Crossover", "Pickup", "MPV"]),
    seats: z.number().int().positive().default(5),
    doors: z.number().int().positive().default(5),
    warrantyYears: z.number().min(0).default(10),
    description: z.string().optional(),
    imageUrl: z.string().url("Image URL must be valid").optional(),
    variants: z.array(vehicleVariantSchema).min(1, "At least one variant is required"),
  }),
});

export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Vehicle ID is required"),
  }),
  body: z
    .object({
      modelName: z.string().optional(),
      specifications: z.string().optional(),
      bodyType: z.enum(["SUV", "Sedan", "Hatchback", "Crossover", "Pickup", "MPV"]).optional(),
      seats: z.number().int().positive().optional(),
      doors: z.number().int().positive().optional(),
      warrantyYears: z.number().min(0).optional(),
      description: z.string().optional(),
      imageUrl: z.string().url("Image URL must be valid").optional(),
      variants: z.array(vehicleVariantSchema).optional(),
    })
    .strict(),
});

export const vehicleIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Vehicle ID is required"),
  }),
});
