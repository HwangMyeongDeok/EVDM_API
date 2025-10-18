import { AppError } from '../../common/middlewares/AppError';
import VehicleRepository from './vehicle.repository';
import { IVehicle } from './vehicle.interface';

class VehicleService {
  public async getAllVehicles(): Promise<IVehicle[]> {
    return VehicleRepository.findAll();
  }

  public async getVehicleById(id: string): Promise<IVehicle> {
    const vehicle = await VehicleRepository.findById(id);

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    return vehicle;
  }
}
    
export default new VehicleService();