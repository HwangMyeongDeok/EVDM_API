import { Request, Response, NextFunction } from "express";
import DealerRequestService from "./dealer-request.service";

class DealerRequestController {
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dealerId = Number(req.user?.dealer_id);
      const data = await DealerRequestService.create(dealerId, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const dealerId = Number(req.user?.dealer_id);
      const data = await DealerRequestService.getAllByDealer(dealerId);
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const dealerId = Number(req.user?.dealer_id);
      const id = Number(req.params.id);
      const data = await DealerRequestService.getById(id, dealerId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await DealerRequestService.approve(id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await DealerRequestService.reject(id, req.body.reason);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const dealerId = Number(req.user?.dealer_id);
      const id = Number(req.params.id);
      await DealerRequestService.delete(id, dealerId);
      res.json({ success: true, message: "Request deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default DealerRequestController;
