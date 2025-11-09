import { Request, Response, NextFunction } from "express";
import DealerAllocationService from "./dealer-allocation.service";

class DealerAllocationController {

  public async getByRequestId(req: Request, res: Response, next: NextFunction) {
    try {
      const dealerId = Number(req.user?.dealer_id);
      const requestId = Number(req.params.request_id);
      const data = await DealerAllocationService.getByRequestId(requestId, dealerId);
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DealerAllocationService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const dealerId = Number(req.user?.dealer_id);
      const data = await DealerAllocationService.getAllByDealer(dealerId);
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const dealerId = Number(req.user?.dealer_id);
      const id = Number(req.params.id);
      const data = await DealerAllocationService.getById(id, dealerId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public async markInTransit(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await DealerAllocationService.markInTransit(id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public async markDelivered(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await DealerAllocationService.markDelivered(id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await DealerAllocationService.delete(id);
      res.json({ success: true, message: "Allocation deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  public async confirmReceipt(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const data = await DealerAllocationService.confirmReceipt(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

}

export default DealerAllocationController;
