import { AppDataSource } from "../../config/data-source";
import { DealerDebt } from "./dealer-debt.model";

export class DealerDebtRepository {
  private repo = AppDataSource.getRepository(DealerDebt);

  async save(debt: DealerDebt): Promise<DealerDebt> {
    return await this.repo.save(debt);
  }

  async findAll(): Promise<DealerDebt[]> {
    return this.repo.find({
      relations: ["dealer"],
      order: { created_at: "DESC" },
    });
  }

  async findById(id: number): Promise<DealerDebt | null> {
    return this.repo.findOne({
      where: { debt_id: id },
      relations: ["dealer"],
    });
  }

  async findByDealer(dealerId: number): Promise<DealerDebt[]> {
    return this.repo.find({
      where: { dealer_id: dealerId },
      relations: ["dealer"],
      order: { created_at: "DESC" },
    });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

export default new DealerDebtRepository();
