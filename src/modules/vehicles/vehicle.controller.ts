import { Request, Response, NextFunction } from 'express';
import VehicleService from './vehicle.service';

 class VehicleController {
  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await VehicleService.getAllVehicles();
      res.status(200).json({
        success: true,
        count: vehicles.length,
        data: vehicles,
      });
    } catch (error) {
      next(error); 
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.getVehicleById(req.params.id);
      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default VehicleController