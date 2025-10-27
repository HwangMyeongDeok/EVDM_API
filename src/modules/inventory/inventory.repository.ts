import { AppDataSource } from "../../config/data-source";
import { Inventory } from "./inventory.model";
import { IsNull } from "typeorm";
import { AppError } from "../../common/middlewares/AppError";

export class InventoryRepository {
  private repo = AppDataSource.getRepository(Inventory);

  async findAll(): Promise<Inventory[]> {
    return this.repo.find({
      relations: ["variant", "variant.vehicle", "dealer"],
      order: { last_updated: "DESC" },
    });
  }

  async findById(id: number): Promise<Inventory | null> {
    return this.repo.findOne({
      where: { inventory_id: id },
      relations: ["variant", "variant.vehicle", "dealer"],
    });
  }

  async findByVariantAndDealer(variantId: number, dealerId: number | null): Promise<Inventory | null> {
    return this.repo.findOne({
      where: {
        variant_id: variantId,
        dealer_id: dealerId === null ? (IsNull() as any) : (dealerId as any),
      },
    });
  }

  async save(inventory: Inventory): Promise<Inventory> {
    return this.repo.save(inventory);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  /**
   * Cập nhật tồn kho: tăng (delta > 0) hoặc giảm (delta < 0)
   * Tự động tạo bản ghi nếu chưa tồn tại.
   */
  async updateStock(variantId: number, dealerId: number | null, delta: number): Promise<Inventory> {
    let inv = await this.findByVariantAndDealer(variantId, dealerId);

    if (!inv) {
      inv = new Inventory();
      inv.variant_id = variantId;
      inv.dealer_id = dealerId ?? null;
      inv.quantity = 0;
    }

    const newQty = inv.quantity + delta;
    if (newQty < 0) throw new AppError("Insufficient stock", 400);

    inv.quantity = newQty;
    inv.last_updated = new Date();
    return await this.repo.save(inv);
  }
}

export default new InventoryRepository();
