import { Request, Response, NextFunction } from "express";
import DealerDebtService from "./dealer-debt.service";

class DealerDebtController {
  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DealerDebtService.getAll();
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public async getByDealer(req: Request, res: Response, next: NextFunction) {
    try {
      const dealerId = Number(req.params.dealerId);
      const data = await DealerDebtService.getByDealer(dealerId);
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await DealerDebtService.getById(id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { dealer_id, amount, due_date } = req.body;
      const debt = await DealerDebtService.create(
        Number(dealer_id),
        Number(amount),
        due_date ? new Date(due_date) : undefined
      );
      res.status(201).json({ success: true, data: debt });
    } catch (error) {
      next(error);
    }
  }

  public async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      const debt = await DealerDebtService.updateStatus(id, status);
      res.json({ success: true, data: debt });
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await DealerDebtService.delete(id);
      res.json({ success: true, message: "Dealer debt deleted" });
    } catch (error) {
      next(error);
    }
  }
}

export default DealerDebtController;
