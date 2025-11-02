import { AppError } from "../../common/middlewares/AppError";
import PromotionRepository from "./promotion.repository";
import { Promotion } from "./promotion.model";
import { PromotionStatus, PromotionApplicableTo } from "./promotion.model";

type AppliedPromo = {
  code: string;
  amount_vnd: number;
  description?: string;
};

export class PromotionService {
  private repo = PromotionRepository;

  async getAll(): Promise<Promotion[]> {
    return this.repo.findAll();
  }

  async validateAndApplyCode(code: string, subtotal: number): Promise<AppliedPromo> {
    const promo = await this.repo.findByCode(code);
    if (!promo) {
      throw new AppError("promotion not found", 400);
    }

    if (promo.status !== PromotionStatus.ACTIVE) {
      throw new AppError("promotion is not active", 400);
    }

    const now = new Date();
    if (promo.start_date && now < promo.start_date) {
      throw new AppError("promotion is not active", 400);
    }
    if (promo.end_date && now > promo.end_date) {
      throw new AppError("promotion is not active", 400);
    }

    if (promo.applicable_to !== PromotionApplicableTo.ALL) {
      throw new AppError("promotion is not applicable", 400);
    }

    if (promo.times_used >= promo.usage_limit && promo.usage_limit > 0) {
      throw new AppError("promotion is not applicable", 400);
    }

    let amount_vnd: number;
    if (promo.discount_percentage && promo.discount_percentage > 0) {
      amount_vnd = Math.min(subtotal * (promo.discount_percentage / 100), subtotal);
    } else if (promo.discount_amount && promo.discount_amount > 0) {
      amount_vnd = Math.min(promo.discount_amount, subtotal);
    } else {
      throw new AppError("promotion is not applicable", 400);
    }
    return {
      code: promo.code,
      amount_vnd,
      description: promo.description,
    };
  }
}

export default new PromotionService();