import { AppError } from "../../common/middlewares/AppError";
import VehicleVariantRepository from "./vehicle-variant.repository";
import { VehicleVariant } from "./vehicle-variant.model";

export class VehicleVariantService {
  private repo = VehicleVariantRepository;

  async getAll(opts?: { page?: number; limit?: number }) {
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const limit = opts?.limit && opts.limit > 0 ? opts.limit : 20;
    const skip = (page - 1) * limit;

    const variants = await this.repo.findAll({
      take: limit,
      skip,
      relations: ["vehicle"],
      order: { "v.variant_id": "DESC" } as any,
    });

    return variants;
  }

  async getById(id: number) {
    const v = await this.repo.findById(id, ["vehicle", "units", "inventory"]);
    if (!v) throw new AppError("Variant not found", 404);
    return v;
  }

  async getByVehicle(vehicleId: number) {
    return this.repo.findByVehicleId(vehicleId);
  }

  async create(payload: Partial<VehicleVariant>) {
    if (!payload.vehicle_id) throw new AppError("vehicle_id is required", 400);
    if (payload.retail_price == null) throw new AppError("retail_price is required", 400);

    const v = new VehicleVariant();
    Object.assign(v, payload);
    return this.repo.save(v);
  }

  async update(id: number, payload: Partial<VehicleVariant>) {
    const v = await this.repo.findById(id);
    if (!v) throw new AppError("Variant not found", 404);

    Object.assign(v, payload);
    return this.repo.save(v);
  }

  async remove(id: number) {
    const v = await this.repo.findById(id);
    if (!v) throw new AppError("Variant not found", 404);

    await this.repo.delete(id);
    return { success: true };
  }
}

export default new VehicleVariantService();
