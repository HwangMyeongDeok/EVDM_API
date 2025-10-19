import { IVehicle } from "./vehicle.interface";
import { VehicleModel } from "./vehicle.model";

class VehicleRepository {
  public async findAll(): Promise<IVehicle[]> {
    return VehicleModel.find().select(
      "modelName bodyType seats description doors warrantyYears imageUrl " +
        "variants.version variants.color variants.retailPrice variants.discountPercent " +
        "variants.rangeKm variants.acceleration0100 variants.status variants.motorPowerKw " +
        "variants.topSpeedKmh variants.chargingTimeHours"
    );
  }

  public async findById(id: string): Promise<IVehicle | null> {
    return VehicleModel.findById(id);
  }
}

export default new VehicleRepository();
