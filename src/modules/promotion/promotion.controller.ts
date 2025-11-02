import { Request, Response, NextFunction } from "express";
import PromotionService from "./promotion.service";
import { AppError } from "../../common/middlewares/AppError";

class PromotionController {
  
  public async list(req: Request, res: Response, next: NextFunction) {
    try {
      const promotions = await PromotionService.getAll();

      res.status(200).json({
        success: true,
        data: promotions,
      });
    } catch (error) {
      next(error);
    }
  }

  public async applyCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, subtotal } = req.body;

      if (!code?.trim()) throw new AppError("Code is required", 400);
      if (typeof subtotal !== 'number' || subtotal <= 0) throw new AppError("Invalid subtotal", 400);

      const applied = await PromotionService.validateAndApplyCode(code.trim(), subtotal);

      res.status(200).json({
        success: true,
        data: applied,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PromotionController;