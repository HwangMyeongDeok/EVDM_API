import { AppError } from "../../common/middlewares/AppError";
import InventoryRepository from "./inventory.repository";
import { Inventory } from "./inventory.model";
import { AppDataSource } from "../../config/data-source";
import { VehicleVariant } from "../vehicle-variant/vehicle-variant.model";
import { Dealer } from "../dealer/dealer.model";

export class InventoryService {
  private repo = InventoryRepository;

  async getAll(): Promise<Inventory[]> {
    return this.repo.findAll();
  }

  async getById(id: number): Promise<Inventory> {
    const inv = await this.repo.findById(id);
    if (!inv) throw new AppError("Inventory not found", 404);
    return inv;
  }

  /**
   * Cập nhật tồn kho (delta có thể âm hoặc dương)
   * - Kiểm tra variant hợp lệ
   * - Nếu dealerId có → kiểm tra dealer hợp lệ (trừ khi skipDealerCheck = true)
   * - Gọi repository.updateStock() để cập nhật
   */
  async updateStock(
    variantId: number,
    dealerId: number | null,
    delta: number,
    skipDealerCheck = false
  ): Promise<Inventory> {
    const variantRepo = AppDataSource.getRepository(VehicleVariant);
    const dealerRepo = AppDataSource.getRepository(Dealer);

    const variant = await variantRepo.findOne({ where: { variant_id: variantId } });
    if (!variant) throw new AppError("Vehicle variant not found", 404);

    if (dealerId && !skipDealerCheck) {
      const dealer = await dealerRepo.findOne({ where: { dealer_id: dealerId } });
      if (!dealer) throw new AppError("Dealer not found", 404);
    }

    return this.repo.updateStock(variantId, dealerId, delta);
  }

  async delete(id: number): Promise<void> {
    const inv = await this.repo.findById(id);
    if (!inv) throw new AppError("Inventory not found", 404);
    await this.repo.delete(id);
  }
}

export default new InventoryService();
