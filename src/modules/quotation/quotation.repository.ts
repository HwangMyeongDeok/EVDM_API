import { AppDataSource } from "../../config/data-source";
import { Quotation } from "./quotation.model";

class QuotationRepository {
  private repo = AppDataSource.getRepository(Quotation);

  async create(data: Partial<Quotation>): Promise<Quotation> {
    const quotation = this.repo.create(data);
    return await this.repo.save(quotation);
  }

  async findById(id: number): Promise<Quotation | null> {
    return await this.repo.findOne({
      where: { quotation_id: id },
      relations: ["dealer", "customer", "user", "items", "items.variant"],
    });
  }

  async findAllByDealer(dealerId: number): Promise<Quotation[]> {
    return await this.repo.find({
      where: { dealer: { dealer_id: dealerId } },
      relations: ["dealer", "customer", "user", "items"],
      order: { created_at: "DESC" },
    });
  }

  async updateById(
    id: number,
    updateData: Partial<Quotation>
  ): Promise<Quotation | null> {
    const quotation = await this.repo.findOne({
      where: { quotation_id: id },
    });
    if (!quotation) return null;

    Object.assign(quotation, updateData);
    return await this.repo.save(quotation);
  }

  async deleteById(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected !== 0;
  }
}

export default new QuotationRepository();
