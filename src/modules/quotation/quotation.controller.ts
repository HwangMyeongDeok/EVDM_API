import { Request, Response, NextFunction } from "express";
import QuotationService from "./quotation.service";
import { AppError } from "../../common/middlewares/AppError";

class QuotationController {
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const staffId = Number(req.user?.id);
      const dealerId = Number(req.user?.dealer);

      if (!staffId || !dealerId) {
        throw new AppError("Missing staffId or dealerId", 401);
      }

      const newQuotation = await QuotationService.create(
        staffId,
        dealerId,
        req.body
      );

      res.status(201).json({
        success: true,
        message: "Quotation created successfully",
        data: newQuotation,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const dealerId = Number(req.user?.dealer);
      if (!dealerId) {
        throw new AppError("Missing dealerId", 400);
      }

      const quotations = await QuotationService.getAllByDealer(dealerId);

      res.status(200).json({
        success: true,
        count: quotations.length,
        data: quotations,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new AppError("Invalid quotation ID", 400);
      }

      const quotation = await QuotationService.getById(id);

      res.status(200).json({
        success: true,
        data: quotation,
      });
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new AppError("Invalid quotation ID", 400);
      }

      const updatedQuotation = await QuotationService.update(id, req.body);

      res.status(200).json({
        success: true,
        message: "Quotation updated successfully",
        data: updatedQuotation,
      });
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new AppError("Invalid quotation ID", 400);
      }

      await QuotationService.delete(id);

      res.status(200).json({
        success: true,
        message: "Quotation deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default QuotationController;
