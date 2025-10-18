import { IVehicle } from './vehicle.interface';
import { VehicleModel } from './vehicle.model';

class VehicleRepository {
  public async findAll(): Promise<IVehicle[]> {
    return VehicleModel.find().select(
      'modelName bodyType imageUrl variants.version variants.color variants.retailPrice'
    );
  }

  public async findById(id: string): Promise<IVehicle | null> {
    return VehicleModel.findById(id);
  }
}

export default new VehicleRepository();