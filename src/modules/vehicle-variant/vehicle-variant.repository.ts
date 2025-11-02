import { Repository } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { VehicleVariant, VehicleVariantStatus } from "./vehicle-variant.model";

class VehicleVariantRepository {
  private repo: Repository<VehicleVariant>;

  constructor() {
    this.repo = AppDataSource.getRepository(VehicleVariant);
  }

  async save(entity: VehicleVariant) {
    return this.repo.save(entity);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }

  async findById(id: number, relations: string[] = []) {
    return this.repo.findOne({ where: { variant_id: id }, relations });
  }

  async findAll(options?: {
    take?: number;
    skip?: number;
    where?: any;
    relations?: string[];
    order?: any;
  }) {
    const qb = this.repo.createQueryBuilder("v");

    if (options?.relations?.length) {
      for (const r of options.relations) {
        qb.leftJoinAndSelect(`v.${r}`, r);
      }
    }

    if (options?.where) {
      qb.where(options.where);
    }

    if (options?.order) {
      qb.orderBy(options.order);
    }

    if (typeof options?.skip === "number") qb.skip(options.skip);
    if (typeof options?.take === "number") qb.take(options.take);

    return qb.getMany();
  }

  async findByVehicleId(vehicleId: number) {
    return this.repo.find({ where: { vehicle_id: vehicleId } });
  }

 async findActiveVariants() {
  return this.repo.find({ where: { status: VehicleVariantStatus.ACTIVE } });
}

}

export default new VehicleVariantRepository();
