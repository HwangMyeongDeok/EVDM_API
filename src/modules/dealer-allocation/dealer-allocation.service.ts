import { AppError } from "../../common/middlewares/AppError";
import DealerAllocationRepository from "./dealer-allocation.repository";
import { DealerVehicleAllocation, AllocationStatus } from "./dealer-allocation.model";
import { AppDataSource } from "../../config/data-source";
import { VehicleVariant } from "../vehicle-variant/vehicle-variant.model";
import { Dealer } from "../dealer/dealer.model";
import { DealerVehicleRequest } from "../dealer-request/dealer-request.model";
import InventoryRepository from "../inventory/inventory.repository";

export class DealerAllocationService {
  private repo = DealerAllocationRepository;

  async create(dto: { dealer_id: number; variant_id: number; allocated_quantity: number; request_id?: number }): Promise<DealerVehicleAllocation> {
    const dealerRepo = AppDataSource.getRepository(Dealer);
    const variantRepo = AppDataSource.getRepository(VehicleVariant);

    const dealer = await dealerRepo.findOne({ where: { dealer_id: dto.dealer_id } });
    if (!dealer) throw new AppError("Dealer not found", 404);

    const variant = await variantRepo.findOne({ where: { variant_id: dto.variant_id } });
    if (!variant) throw new AppError("Vehicle variant not found", 404);

    const allocation = new DealerVehicleAllocation();
    allocation.dealer_id = dto.dealer_id;
    allocation.variant_id = dto.variant_id;
    allocation.allocated_quantity = dto.allocated_quantity;
    allocation.status = AllocationStatus.PENDING;
    allocation.request_id = dto.request_id ?? null;

    return this.repo.save(allocation);
  }

  async getAllByDealer(dealerId: number): Promise<DealerVehicleAllocation[]> {
    return this.repo.findAllByDealer(dealerId);
  }

  async getById(id: number, dealerId: number): Promise<DealerVehicleAllocation> {
    const alloc = await this.repo.findById(id);
    if (!alloc || alloc.dealer_id !== dealerId) throw new AppError("Allocation not found", 404);
    return alloc;
  }

  async markInTransit(id: number): Promise<DealerVehicleAllocation> {
    const alloc = await this.repo.findById(id);
    if (!alloc) throw new AppError("Allocation not found", 404);
    if (alloc.status !== AllocationStatus.PENDING)
      throw new AppError("Only PENDING allocations can be marked as IN_TRANSIT", 400);

    alloc.status = AllocationStatus.IN_TRANSIT;
    return this.repo.save(alloc);
  }

  async markDelivered(id: number): Promise<DealerVehicleAllocation> {
    const alloc = await this.repo.findById(id);
    if (!alloc) throw new AppError("Allocation not found", 404);
    if (alloc.status !== AllocationStatus.IN_TRANSIT)
      throw new AppError("Only IN_TRANSIT allocations can be delivered", 400);

    // Cộng kho đại lý, trừ kho hãng
    await InventoryRepository.updateStock(alloc.variant_id, alloc.dealer_id, alloc.allocated_quantity);
    await InventoryRepository.updateStock(alloc.variant_id, null, -alloc.allocated_quantity);

    alloc.status = AllocationStatus.DELIVERED;
    alloc.delivery_date = new Date();

    return this.repo.save(alloc);
  }

  async delete(id: number): Promise<void> {
    const alloc = await this.repo.findById(id);
    if (!alloc) throw new AppError("Allocation not found", 404);
    if (alloc.status !== AllocationStatus.PENDING)
      throw new AppError("Cannot delete allocation after processing", 400);
    await this.repo.delete(id);
  }
}

export default new DealerAllocationService();
