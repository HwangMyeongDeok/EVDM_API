import { AppDataSource } from "../../config/data-source";
import { DealerVehicleAllocation } from "./dealer-allocation.model";
import { AllocationStatus } from "./dealer-allocation.model";

export class DealerAllocationRepository {
  private repo = AppDataSource.getRepository(DealerVehicleAllocation);

  async save(
    allocation: DealerVehicleAllocation
  ): Promise<DealerVehicleAllocation> {
    return await this.repo.save(allocation);
  }

  async findAllByDealer(dealerId: number): Promise<DealerVehicleAllocation[]> {
    return this.repo.find({
      where: { dealer_id: dealerId },
      relations: ["items", "items.variant", "items.variant.vehicle", "request"],
      order: { created_at: "DESC" },
    });
  }

  async findById(id: number): Promise<DealerVehicleAllocation | null> {
    return this.repo.findOne({
      where: { allocation_id: id },
      relations: [
        "dealer",
        "items",
        "items.variant",
        "items.variant.vehicle",
        "request",
      ],
    });
  }

  async findPending(): Promise<DealerVehicleAllocation[]> {
    return this.repo.find({
      where: { status: AllocationStatus.PENDING },
      relations: [
        "dealer",
        "items",
        "items.variant",
        "items.variant.vehicle",
        "request",
      ],
    });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

export default new DealerAllocationRepository();
