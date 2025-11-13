import { AppDataSource } from "../../config/data-source";
import { Dealer } from "./dealer.model";

export class DealerRepository {
  private repo = AppDataSource.getRepository(Dealer);

  async findAll(): Promise<Dealer[]> {
    return this.repo.find({
      order: { created_at: "DESC" },
      relations: ["dealerContracts", "users"],
    });
  }

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

  async create(dealer: Dealer): Promise<Dealer> {
    return this.repo.save(dealer);
  }

  async update(id: number, data: Partial<Dealer>): Promise<Dealer> {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new Error("Update failed: Dealer not found");
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

export default new DealerRepository();
