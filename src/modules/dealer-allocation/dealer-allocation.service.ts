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
import { Inventory } from "../inventory/inventory.model";
import { IsNull } from "typeorm";

export class DealerAllocationService {
  private repo = DealerAllocationRepository;
  private inventoryRepo = AppDataSource.getRepository(Inventory);

  async getByRequestId(
    requestId: number,
    dealerId: number
  ): Promise<DealerVehicleAllocation[]> {
    const allocations = await this.repo.findByRequestId(requestId);

    const filtered = allocations.filter((a) => a.dealer_id === dealerId);

    if (!filtered.length) {
      throw new AppError("No allocations found for this request", 404);
    }

    return filtered;
  }
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
    if (!request) throw new AppError("Request not found", 404);

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

    await this.transferStockFromCentralToDealer(alloc);
    alloc.status = AllocationStatus.DELIVERED;

    return this.repo.save(alloc);
  }

  async confirmReceipt(id: number): Promise<DealerVehicleAllocation> {
    const alloc = await this.repo.findById(id);
    if (!alloc) throw new AppError("Allocation not found", 404);

    // Lấy tất cả allocations của request này
    const allAllocations = await this.repo.findAllByRequestId(alloc.request_id);

    // Tính tổng giá trị request hiện tại (không cần lưu vào DB)
    const requestTotalAmount = alloc.request.items.reduce(
      (sum, item) => sum + item.requested_quantity * item.variant.retail_price,
      0
    );

    // Tính tổng paid_amount đã thanh toán trước đó
    const totalPaid = allAllocations.reduce(
      (sum, a) => sum + (a.paid_amount || 0),
      0
    );

    // Kiểm tra cọc 50% đầu tiên
    const isFirstConfirmation = alloc.status === AllocationStatus.PENDING;
    if (isFirstConfirmation && totalPaid < requestTotalAmount * 0.5) {
      throw new AppError(
        "Chưa thanh toán cọc 50%, không thể xác nhận lô hàng đầu tiên",
        400
      );
    }

    // Chuyển stock từ trung tâm sang đại lý
    await this.transferStockFromCentralToDealer(alloc);

    // Cập nhật trạng thái allocation
    alloc.status = AllocationStatus.DELIVERED;

    // Tính giá trị allocation này
    const allocationValue = alloc.items.reduce(
      (sum, i) => sum + i.quantity * i.variant.retail_price,
      0
    );

    // Cập nhật paid_amount cho allocation (trả dần)
    // Nếu chưa đủ 50% cọc, allocation đầu tiên sẽ được tính đúng 50% cọc
    if (isFirstConfirmation) {
      alloc.paid_amount = requestTotalAmount * 0.5;
    } else {
      // Các allocation tiếp theo trả dần theo giá trị allocation
      const remaining = requestTotalAmount - totalPaid;
      alloc.paid_amount = Math.min(allocationValue, remaining);
    }

    return this.repo.save(alloc);
  }

  async delete(id: number): Promise<void> {
    const alloc = await this.repo.findById(id);
    if (!alloc) throw new AppError("Allocation not found", 404);
    if (alloc.status !== AllocationStatus.PENDING)
      throw new AppError("Cannot delete allocation after processing", 400);
    await this.repo.delete(id);
  }

  /**
   * Helper: chuyển stock từ kho trung tâm sang đại lý
   */
  private async transferStockFromCentralToDealer(
    alloc: DealerVehicleAllocation
  ) {
    for (const item of alloc.items) {
      const variantId = item.variant_id;

      // Lấy/tạo kho trung tâm
      let centralInv = await this.inventoryRepo.findOne({
        where: { variant_id: variantId, dealer_id: IsNull() },
      });
      if (!centralInv) {
        throw new AppError(
          `Central inventory for variant ${variantId} not found`,
          400
        );
      }

      // Kiểm tra tồn kho trung tâm
      if (centralInv.quantity < item.quantity) {
        throw new AppError(
          `Insufficient stock for variant ${variantId} in central warehouse`,
          400
        );
      }

      // Trừ kho trung tâm
      centralInv.quantity -= item.quantity;
      centralInv.last_updated = new Date();
      await this.inventoryRepo.save(centralInv);

      // Lấy/tạo kho đại lý
      let dealerInv = await this.inventoryRepo.findOne({
        where: { variant_id: variantId, dealer_id: alloc.dealer_id },
      });

      if (!dealerInv) {
        dealerInv = this.inventoryRepo.create({
          variant_id: variantId,
          dealer_id: alloc.dealer_id,
          quantity: 0,
        });
      }

      // Cộng kho đại lý
      dealerInv.quantity += item.quantity;
      dealerInv.last_updated = new Date();
      await this.inventoryRepo.save(dealerInv);
    }
  }
}

export default new DealerAllocationService();
