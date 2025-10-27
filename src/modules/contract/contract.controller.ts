import { Request, Response, NextFunction } from "express";
import ContractService from "./contract.service";
import { AppError } from "../../common/middlewares/AppError";

class ContractController {
  public async createFromQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const quotationId = Number(req.params.id);
      const userId = Number(req.user?.user_id);
      const dealerId = Number(req.user?.dealer_id);
      const contract = await ContractService.createFromQuotation(quotationId, req.body, userId, dealerId);
      res.status(201).json({ success: true, data: contract });
    } catch (error) { next(error); }
  }

  public async createManual(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.user?.user_id);
      const dealerId = Number(req.user?.dealer_id);
      const contract = await ContractService.createManual(req.body, userId, dealerId);
      res.status(201).json({ success: true, data: contract });
    } catch (error) { next(error); }
  }

  public async uploadAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const contractId = Number(req.params.id);
      const dealerId = Number(req.user?.dealer_id);
      await ContractService.uploadAttachment(contractId, req.body, dealerId);
      res.json({ success: true, message: "Attachment uploaded" });
    } catch (error) { next(error); }
  }

  public async makePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const contractId = Number(req.params.id);
      const userId = Number(req.user?.user_id);
      const dealerId = Number(req.user?.dealer_id);
      const result = await ContractService.makePayment(contractId, req.body, userId, dealerId);
      res.json(result);
    } catch (error) { next(error); }
  }

  public async deliver(req: Request, res: Response, next: NextFunction) {
    try {
      const contractId = Number(req.params.id);
      const dealerId = Number(req.user?.dealer_id);
      const result = await ContractService.deliver(contractId, req.body, dealerId);
      res.json(result);
    } catch (error) { next(error); }
  }

  public async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const contractId = Number(req.params.id);
      const managerId = Number(req.user?.user_id);
      const dealerId = Number(req.user?.dealer_id);
      const contract = await ContractService.approve(contractId, managerId, dealerId);
      res.json({ success: true, data: contract });
    } catch (error) { next(error); }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const contract = await ContractService.getById(id);
      res.json({ success: true, data: contract });
    } catch (error) { next(error); }
  }
}

export default ContractController;