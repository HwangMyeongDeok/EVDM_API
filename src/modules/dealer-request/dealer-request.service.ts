import { AppError } from "../../common/middlewares/AppError";
import DealerRequestRepository from "./dealer-request.repository";
import { DealerVehicleRequest, DealerVehicleRequestStatus } from "./dealer-request.model";
import { AppDataSource } from "../../config/data-source";
import { VehicleVariant } from "../vehicle-variant/vehicle-variant.model";
import { Dealer } from "../dealer/dealer.model";
import InventoryRepository from "../inventory/inventory.repository";

export class DealerRequestService {
  private repo = DealerRequestRepository;

  async create(dealerId: number, dto: { variant_id: number; requested_quantity: number }): Promise<DealerVehicleRequest> {
    const variantRepo = AppDataSource.getRepository(VehicleVariant);
    const dealerRepo = AppDataSource.getRepository(Dealer);

    const variant = await variantRepo.findOne({ where: { variant_id: dto.variant_id } });
    if (!variant) throw new AppError("Vehicle variant not found", 404);

    const dealer = await dealerRepo.findOne({ where: { dealer_id: dealerId } });
    if (!dealer) throw new AppError("Dealer not found", 404);

    const request = new DealerVehicleRequest();
    request.dealer_id = dealerId;
    request.variant_id = dto.variant_id;
    request.requested_quantity = dto.requested_quantity;
    request.status = DealerVehicleRequestStatus.PENDING;

    return this.repo.save(request);
  }

  async getAllByDealer(dealerId: number): Promise<DealerVehicleRequest[]> {
    return this.repo.findAllByDealer(dealerId);
  }

  async getById(id: number, dealerId: number): Promise<DealerVehicleRequest> {
    const req = await this.repo.findById(id);
    if (!req || req.dealer_id !== dealerId) throw new AppError("Request not found", 404);
    return req;
  }

  async approve(id: number): Promise<DealerVehicleRequest> {
    const req = await this.repo.findById(id);
    if (!req) throw new AppError("Request not found", 404);
    if (req.status !== DealerVehicleRequestStatus.PENDING)
      throw new AppError("Request already processed", 400);

    const inventory = await InventoryRepository.findByVariantAndDealer(req.variant_id, null);
    if (!inventory || inventory.quantity < req.requested_quantity) {
      throw new AppError("Not enough stock in manufacturer inventory", 400);
    }

    // Trừ kho hãng
    inventory.quantity -= req.requested_quantity;
    await InventoryRepository.save(inventory);

    // Cộng kho đại lý
    await InventoryRepository.updateStock(req.variant_id, req.dealer_id, req.requested_quantity);

    req.status = DealerVehicleRequestStatus.APPROVED;
    return this.repo.save(req);
  }

  async reject(id: number, reason?: string): Promise<DealerVehicleRequest> {
    const req = await this.repo.findById(id);
    if (!req) throw new AppError("Request not found", 404);
    if (req.status !== DealerVehicleRequestStatus.PENDING)
      throw new AppError("Request already processed", 400);

    req.status = DealerVehicleRequestStatus.REJECTED;
    return this.repo.save(req);
  }

  async delete(id: number, dealerId: number): Promise<void> {
    const req = await this.repo.findById(id);
    if (!req || req.dealer_id !== dealerId) throw new AppError("Request not found", 404);
    if (req.status !== DealerVehicleRequestStatus.PENDING)
      throw new AppError("Cannot delete after approval or rejection", 400);
    await this.repo.delete(id);
  }
}

export default new DealerRequestService();
