import { Request, Response, NextFunction } from 'express';
import ContractService from './contract.service';
import { AppError } from '../../common/middlewares/AppError';

class ContractController {

  public async createContract(req: Request, res: Response, next: NextFunction) {
    try {
      const staffId = req.user?.id;
      if (!staffId) {
        return next(new AppError('staffId not found', 401));
      }

      const { quotationId } = req.body;

      const newContract = await ContractService.createContract(quotationId, staffId);

      res.status(201).json({ success: true, data: newContract });
    } catch (error) {
      next(error);
    }
  }

  public async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const managerId = req.user?.id;
      if (!managerId) {
        return next(new AppError('managerId not found', 401));
      }

      const { id } = req.params;

      const approvedContract = await ContractService.approveContract(id, managerId);

      res.status(200).json({ success: true, data: approvedContract });
    } catch (error) {
      next(error);
    }
  }

  public async handover(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { vin } = req.body;
      const completedContract = await ContractService.handoverVehicle(id, vin);
      res.status(200).json({ success: true, data: completedContract });
    } catch (error) {
      next(error);
    }
  }

}

export default ContractController;