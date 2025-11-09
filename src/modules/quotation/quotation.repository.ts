import { AppDataSource } from "../../config/data-source";
import { Quotation } from "./quotation.model";
import { In } from "typeorm";

export class QuotationRepository {
  private repo = AppDataSource.getRepository(Quotation);

  async save(quotation: Quotation): Promise<Quotation> {
    return await this.repo.save(quotation);
  }

  async findById(id: number): Promise<Quotation | null> {
    return this.repo.findOne({
      where: { quotation_id: id },
      relations: [
        "dealer",
        "customer",
        "user",
        "variant",
        "variant.vehicle",
      ],
    });
  }

  async findAllByDealer(dealerId: number): Promise<Quotation[]> {
    return this.repo.find({
      where: { dealer_id: dealerId },
      relations: ["dealer", "customer", "user", "variant", "variant.vehicle"],
      order: { created_at: "DESC" },
    });
  }

  async findAllByUser(userId: number): Promise<Quotation[]> {
    return this.repo.find({
      where: { user_id: userId },
      relations: ["dealer", "customer", "user", "variant","variant.vehicle"],
      order: { created_at: "DESC" },
    });
  }

  async findAllWithRelations(): Promise<Quotation[]> {
    return this.repo.find({
      relations: ["dealer", "customer", "user", "variant","variant.vehicle"],
      order: { created_at: "DESC" },
    });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async findByIds(ids: number[]): Promise<Quotation[]> {
    return this.repo.find({
      where: { quotation_id: In(ids) },
      relations: ["variant"],
    });
  }
}

export default new QuotationRepository();