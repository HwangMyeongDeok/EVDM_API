import { AppError } from "../../common/middlewares/AppError";
import DealerRequestRepository from "./dealer-request.repository";
import {
  DealerVehicleRequest,
  DealerVehicleRequestStatus,
} from "./dealer-request.model";
import { AppDataSource } from "../../config/data-source";
import { VehicleVariant } from "../vehicle-variant/vehicle-variant.model";
import { Dealer } from "../dealer/dealer.model";
import InventoryRepository from "../inventory/inventory.repository";

class DealerRequestService {
  private repo = DealerRequestRepository;

  async create(
    dealerId: number,
    dto: { items: { variant_id: number; requested_quantity: number }[] }
  ): Promise<DealerVehicleRequest> {
    if (!dto?.items?.length) {
      throw new AppError("Tạo yêu cầu thất bại: danh sách items không được rỗng", 400);
    }

    const variantRepo = AppDataSource.getRepository(VehicleVariant);
    const dealerRepo = AppDataSource.getRepository(Dealer);

    const dealer = await dealerRepo.findOne({ where: { dealer_id: dealerId } });
    if (!dealer) throw new AppError("Không tìm thấy đại lý", 404);

    // Kiểm tra các variant tồn tại
    for (const it of dto.items) {
      const variant = await variantRepo.findOne({ where: { variant_id: it.variant_id } });
      if (!variant) {
        throw new AppError(`Không tìm thấy mẫu xe (variant_id=${it.variant_id})`, 404);
      }
      if (it.requested_quantity <= 0) {
        throw new AppError(`Số lượng yêu cầu của variant_id=${it.variant_id} phải > 0`, 400);
      }
    }

    return this.repo.createWithItems(dealerId, dto.items);
  }

  async getAllByDealer(dealerId: number): Promise<DealerVehicleRequest[]> {
    return this.repo.findAllByDealer(dealerId);
  }
  async getAll(): Promise<DealerVehicleRequest[]> {
  return this.repo.findAll();
}


async getById(id: number, role: string, dealerId?: number): Promise<DealerVehicleRequest> {
  const req = await this.repo.findById(id);
  if (!req) throw new AppError("Không tìm thấy yêu cầu", 404);

  if (role !== "EVM_STAFF" && req.dealer_id !== dealerId) {
    throw new AppError("Không có quyền truy cập yêu cầu này", 403);
  }

  return req;
}


  async approve(id: number): Promise<DealerVehicleRequest> {
    const req = await this.repo.findById(id);
    if (!req) throw new AppError("Không tìm thấy yêu cầu", 404);
    if (req.status !== DealerVehicleRequestStatus.PENDING)
      throw new AppError("Yêu cầu đã được xử lý trước đó", 400);

    // Kiểm tra tồn kho hãng cho TẤT CẢ item
    for (const it of req.items) {
      const manufacturerStock = await InventoryRepository.findByVariantAndDealer(it.variant_id, null);
      if (!manufacturerStock || manufacturerStock.quantity < it.requested_quantity) {
        throw new AppError(
          `Kho hãng không đủ số lượng cho variant_id=${it.variant_id} (cần ${it.requested_quantity})`,
          400
        );
      }
    }

    // Thực thi trừ/cộng kho theo từng item trong transaction
    await AppDataSource.transaction(async () => {
      for (const it of req.items) {
        // Trừ kho hãng
        const manufacturerStock = await InventoryRepository.findByVariantAndDealer(it.variant_id, null);
        if (!manufacturerStock) {
          throw new AppError(`Không tìm thấy kho hãng cho variant_id=${it.variant_id}`, 400);
        }
        manufacturerStock.quantity -= it.requested_quantity;
        if (manufacturerStock.quantity < 0) {
          throw new AppError(
            `Kho hãng không đủ số lượng sau khi trừ cho variant_id=${it.variant_id}`,
            400
          );
        }
        await InventoryRepository.save(manufacturerStock);

        // Cộng kho đại lý
        await InventoryRepository.updateStock(it.variant_id, req.dealer_id, it.requested_quantity);
      }

      req.status = DealerVehicleRequestStatus.APPROVED;
      await this.repo.save(req);
    });

    return (await this.repo.findById(id))!;
  }

  async reject(id: number, reason?: string): Promise<DealerVehicleRequest> {
    const req = await this.repo.findById(id);
    if (!req) throw new AppError("Không tìm thấy yêu cầu", 404);
    if (req.status !== DealerVehicleRequestStatus.PENDING)
      throw new AppError("Yêu cầu đã được xử lý trước đó", 400);

    req.status = DealerVehicleRequestStatus.REJECTED;
    // (Tuỳ bạn: có thể lưu reason vào trường notes hoặc bảng log riêng)
    return this.repo.save(req);
  }

  async delete(id: number, dealerId: number): Promise<void> {
    const req = await this.repo.findById(id);
    if (!req || req.dealer_id !== dealerId) throw new AppError("Không tìm thấy yêu cầu", 404);
    if (req.status !== DealerVehicleRequestStatus.PENDING)
      throw new AppError("Không thể xoá yêu cầu sau khi đã duyệt hoặc từ chối", 400);
    await this.repo.delete(id);
  }
}

export default new DealerRequestService();
