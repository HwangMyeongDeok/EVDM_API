import { Request, Response, NextFunction } from 'express';
import CustomerService from './customer.service';
import { AppError } from '../../common/middlewares/AppError';

class CustomerController {
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dealerId = req.user?.dealer;
      if (!dealerId) {
        return next(new AppError('Dealer ID not found', 400));
      }

      const customerData = { ...req.body, dealer: dealerId };
      const newCustomer = await CustomerService.createCustomer(customerData);
      res.status(201).json({ success: true, data: newCustomer });
    } catch (error) {
      next(error);
    }
  }
}

export default CustomerController;