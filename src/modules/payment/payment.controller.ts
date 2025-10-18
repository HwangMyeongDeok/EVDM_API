import { Request, Response, NextFunction } from 'express';
import PaymentService from './payment.service';
import { AppError } from '../../common/middlewares/AppError';

class PaymentController {
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = { id: req.user!.id, dealerId: req.user!.dealer! };
      if (!staff.id || !staff.dealerId) {
        return next(new AppError('staffId or dealerId not found', 401));
      }
      
      const newPayment = await PaymentService.createPayment(req.body, staff);
      res.status(201).json({ success: true, data: newPayment });
    } catch (error) {
      next(error);
    }
  }
}

export default PaymentController;