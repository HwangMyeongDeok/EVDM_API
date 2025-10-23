import { AppError } from '../../common/middlewares/AppError';
import VehicleRepository from './vehicle.repository';
import { Vehicle } from './vehicle.model';

class VehicleService {
  public async getAllVehicles(): Promise<Vehicle[]> {
    return VehicleRepository.findAll();
  }

  public async getVehicleById(id: number): Promise<Vehicle> {
    const vehicle = await VehicleRepository.findById(id);

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    return vehicle;
  }
}
    
export default new VehicleService();