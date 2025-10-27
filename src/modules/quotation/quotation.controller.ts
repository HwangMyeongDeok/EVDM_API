import { Request, Response, NextFunction } from "express";
import QuotationService from "./quotation.service";

class QuotationController {
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.user?.user_id);
      const dealerId = Number(req.user?.dealer_id);
      const quotation = await QuotationService.create(req.body, userId, dealerId);
      res.status(201).json({ success: true, data: quotation });
    } catch (error) { next(error); }
  }

  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const dealerId = Number(req.user?.dealer_id);
      const quotations = await QuotationService.getAllByDealer(dealerId);
      res.json({ success: true, count: quotations.length, data: quotations });
    } catch (error) { next(error); }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const quotation = await QuotationService.getById(id);
      res.json({ success: true, data: quotation });
    } catch (error) { next(error); }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const dealerId = Number(req.user?.dealer_id);
      const quotation = await QuotationService.update(id, req.body, dealerId);
      res.json({ success: true, data: quotation });
    } catch (error) { next(error); }
  }

  public async send(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const dealerId = Number(req.user?.dealer_id);
      const quotation = await QuotationService.send(id, dealerId);
      res.json({ success: true, data: quotation });
    } catch (error) { next(error); }
  }

  public async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const managerId = Number(req.user?.user_id);
      const dealerId = Number(req.user?.dealer_id);
      const quotation = await QuotationService.approve(id, managerId, dealerId);
      res.json({ success: true, data: quotation });
    } catch (error) { next(error); }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const dealerId = Number(req.user?.dealer_id);
      await QuotationService.delete(id, dealerId);
      res.json({ success: true, message: "Deleted" });
    } catch (error) { next(error); }
  }
}

export default QuotationController;