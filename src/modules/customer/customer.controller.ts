import { Request, Response, NextFunction } from "express";
import CustomerService from "./customer.service";
import { AppError } from "../../common/middlewares/AppError";

class CustomerController {
  public async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.query as string) || "";
      const dealerId = Number(req.user?.dealer);

      if (!dealerId) throw new AppError("Dealer not found", 400);

      const customers = await CustomerService.searchByDealer(dealerId, query);

      res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { full_name, phone, email, address } = req.body;
      const dealer_id = Number(req.user?.dealer);

      if (!dealer_id) throw new AppError("Dealer not found", 400);
      if (!full_name?.trim()) throw new AppError("full_name is required", 400);

      const customer = await CustomerService.createCustomer({
        full_name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        dealer_id,
      });

      res.status(201).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new AppError("Invalid ID", 400);

      const customer = await CustomerService.getById(id);
      res.status(200).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }
}

export default CustomerController;