import { AppDataSource } from "../../config/data-source";
import { Dealer } from "./dealer.model";

export class DealerRepository {
  private repo = AppDataSource.getRepository(Dealer);

  // Lấy danh sách tất cả đại lý
  async findAll(): Promise<Dealer[]> {
    return this.repo.find({
      order: { created_at: "DESC" },
      relations: ["dealerContracts", "users"],
    });
  }

  // Lấy chi tiết đại lý theo ID
  async findById(id: number): Promise<Dealer | null> {
    return this.repo.findOne({
      where: { dealer_id: id },
      relations: [
        "dealerContracts",
        "users",
        "inventory",
        "vehicleRequests",
        "vehicleAllocations",
        "customers",
        "quotations",
        "contracts",
        "payments",
        "debts",
        "promotions",
        "reports",
      ],
    });
  }

  // Tạo mới đại lý
  async create(dealer: Dealer): Promise<Dealer> {
    return this.repo.save(dealer);
  }

  // Cập nhật thông tin đại lý
  async update(id: number, data: Partial<Dealer>): Promise<Dealer> {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new Error("Update failed: Dealer not found");
    return updated;
  }

  // Xóa đại lý
  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

export default new DealerRepository();
