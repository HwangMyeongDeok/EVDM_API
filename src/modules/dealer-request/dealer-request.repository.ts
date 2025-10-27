import { AppDataSource } from "../../config/data-source";
import { DealerVehicleRequest } from "./dealer-request.model";
import { DealerVehicleRequestStatus } from "./dealer-request.model";

export class DealerRequestRepository {
  private repo = AppDataSource.getRepository(DealerVehicleRequest);

  async save(request: DealerVehicleRequest): Promise<DealerVehicleRequest> {
    return await this.repo.save(request);
  }

  async findAllByDealer(dealerId: number): Promise<DealerVehicleRequest[]> {
    return this.repo.find({
      where: { dealer_id: dealerId },
      relations: ["variant", "variant.vehicle"],
      order: { created_at: "DESC" },
    });
  }

  async findById(id: number): Promise<DealerVehicleRequest | null> {
    return this.repo.findOne({
      where: { request_id: id },
      relations: ["dealer", "variant", "variant.vehicle"],
    });
  }

  async findPending(): Promise<DealerVehicleRequest[]> {
    return this.repo.find({
      where: { status: DealerVehicleRequestStatus.PENDING },
      relations: ["dealer", "variant", "variant.vehicle"],
    });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

export default new DealerRequestRepository();
