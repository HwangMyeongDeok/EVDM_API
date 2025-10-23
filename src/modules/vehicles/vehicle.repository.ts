import { AppDataSource } from "../../config/data-source";
import { Vehicle } from "./vehicle.model";

export class VehicleRepository {
  private repo = AppDataSource.getRepository(Vehicle);

  async findAll(): Promise<Vehicle[]> {
    return this.repo.find({
      relations: ["variants", "variants.units"],
    });
  }

  async findById(id: number): Promise<Vehicle | null> {
    return this.repo.findOne({
      where: { vehicle_id: id },
      relations: ["variants", "variants.units"],
    });
  }
}

export default new VehicleRepository();
