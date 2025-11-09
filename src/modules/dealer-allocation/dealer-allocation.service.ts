import { AppError } from "../../common/middlewares/AppError";
import DealerAllocationRepository from "./dealer-allocation.repository";
import {
  DealerVehicleAllocation,
  DealerVehicleAllocationItem,
  AllocationStatus,
} from "./dealer-allocation.model";
import { AppDataSource } from "../../config/data-source";
import { VehicleVariant } from "../vehicle-variant/vehicle-variant.model";
import { Dealer } from "../dealer/dealer.model";
import { DealerVehicleRequest } from "../dealer-request/dealer-request.model";
import InventoryRepository from "../inventory/inventory.repository";

export class DealerAllocationService {
  private repo = DealerAllocationRepository;

  async create(dto: {
    request_id?: number;
    dealer_id: number;
    delivery_batch?: number;
    delivery_date: Date;
    notes?: string;
    items: { variant_id: number; quantity: number }[];
  }): Promise<DealerVehicleAllocation> {
    const dealerRepo = AppDataSource.getRepository(Dealer);
    const variantRepo = AppDataSource.getRepository(VehicleVariant);
    const requestRepo = AppDataSource.getRepository(DealerVehicleRequest);

    const dealer = await dealerRepo.findOne({
      where: { dealer_id: dto.dealer_id },
    });
    if (!dealer) throw new AppError("Dealer not found", 404);

    if (!dto.request_id) {
      throw new AppError("Request ID is required", 400);
    }

    const request = await requestRepo.findOne({
      where: { request_id: dto.request_id },
    });

    if (!request) {
      throw new AppError("Request not found", 404);
    }

    if (!dto.request_id) {
      throw new AppError("Request ID is required to create an allocation", 400);
    }

    const allocation = new DealerVehicleAllocation();
    allocation.dealer_id = dto.dealer_id;
    allocation.dealer = dealer;
    allocation.request_id = dto.request_id;
    allocation.request = request;
    allocation.delivery_batch = dto.delivery_batch ?? 0;
    allocation.delivery_date = dto.delivery_date;
    allocation.notes = dto.notes;
    allocation.status = AllocationStatus.PENDING;
    allocation.allocation_date = new Date();

    allocation.items = [];
    for (const itemDto of dto.items) {
      const variant = await variantRepo.findOne({
        where: { variant_id: itemDto.variant_id },
      });
      if (!variant)
        throw new AppError(
          `Vehicle variant ${itemDto.variant_id} not found`,
          404
        );

      const item = new DealerVehicleAllocationItem();
      item.variant_id = itemDto.variant_id;
      item.variant = variant;
      item.quantity = itemDto.quantity;
      allocation.items.push(item);
    }

    return this.repo.save(allocation);
  }

  async getAllByDealer(dealerId: number): Promise<DealerVehicleAllocation[]> {
    return this.repo.findAllByDealer(dealerId);
  }

  async getById(
    id: number,
    dealerId: number
  ): Promise<DealerVehicleAllocation> {
    const alloc = await this.repo.findById(id);
    if (!alloc || alloc.dealer_id !== dealerId)
      throw new AppError("Allocation not found", 404);
    return alloc;
  }

  async markInTransit(id: number): Promise<DealerVehicleAllocation> {
    const alloc = await this.repo.findById(id);
    if (!alloc) throw new AppError("Allocation not found", 404);
    if (alloc.status !== AllocationStatus.PENDING)
      throw new AppError(
        "Only PENDING allocations can be marked as IN_TRANSIT",
        400
      );

    alloc.status = AllocationStatus.IN_TRANSIT;
    return this.repo.save(alloc);
  }

  async markDelivered(id: number): Promise<DealerVehicleAllocation> {
    const alloc = await this.repo.findById(id);
    if (!alloc) throw new AppError("Allocation not found", 404);
    if (alloc.status !== AllocationStatus.IN_TRANSIT)
      throw new AppError("Only IN_TRANSIT allocations can be delivered", 400);

    for (const item of alloc.items) {
      await InventoryRepository.updateStock(
        item.variant_id,
        alloc.dealer_id,
        item.quantity
      );
      await InventoryRepository.updateStock(
        item.variant_id,
        null,
        -item.quantity
      );
    }

    alloc.status = AllocationStatus.DELIVERED;

    return this.repo.save(alloc);
  }

  async confirmReceipt(id: number): Promise<DealerVehicleAllocation> {
    const alloc = await this.repo.findById(id);
    if (!alloc) throw new AppError("Allocation not found", 404);
    if (
      ![AllocationStatus.PENDING, AllocationStatus.IN_TRANSIT].includes(
        alloc.status
      )
    )
      throw new AppError(
        "Only PENDING or IN_TRANSIT allocations can be confirmed as received",
        400
      );

    for (const item of alloc.items) {
      await InventoryRepository.updateStock(
        item.variant_id,
        alloc.dealer_id,
        item.quantity
      );
      await InventoryRepository.updateStock(
        item.variant_id,
        null,
        -item.quantity
      );
    }

    alloc.status = AllocationStatus.DELIVERED;

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
