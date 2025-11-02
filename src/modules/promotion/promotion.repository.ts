import { AppDataSource } from "../../config/data-source";
import { Promotion } from "./promotion.model";
import { PromotionStatus, PromotionApplicableTo } from "./promotion.model";
import { MoreThanOrEqual, LessThanOrEqual } from "typeorm";

export class PromotionRepository {
  private repo = AppDataSource.getRepository(Promotion);

  async findAll(): Promise<Promotion[]> {
    const now = new Date();
    return this.repo.find({
      where: {
        applicable_to: PromotionApplicableTo.ALL,
        status: PromotionStatus.ACTIVE,
        start_date: LessThanOrEqual(now),
        end_date: MoreThanOrEqual(now),
      },
      order: { created_at: "DESC" },
    });
  }

  async findByCode(code: string): Promise<Promotion | null> {
    return this.repo.findOne({
      where: { code },
    });
  }

  async incrementUsage(code: string): Promise<void> {
    await this.repo.increment({ code }, "times_used", 1);
  }
}

export default new PromotionRepository();