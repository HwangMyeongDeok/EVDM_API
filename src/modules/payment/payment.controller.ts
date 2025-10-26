import { Request, Response, NextFunction } from "express";
import PaymentService from "./payment.service";

class PaymentController {
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.user?.id);
      const dealerId = Number(req.user?.dealer);
      const payment = await PaymentService.create(req.body, userId, dealerId);
      res.status(201).json({ success: true, data: payment });
    } catch (error) { next(error); }
  }

  public async getByContract(req: Request, res: Response, next: NextFunction) {
    try {
      const contractId = Number(req.params.contractId);
      const payments = await PaymentService.getByContractId(contractId);
      res.json({ success: true, count: payments.length, data: payments });
    } catch (error) { next(error); }
  }
}

export default PaymentController;