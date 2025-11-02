import { Request, Response, NextFunction } from "express";
import VehicleVariantService from "./vehicle-variant.service";

class VehicleVariantController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const variants = await VehicleVariantService.getAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, data: variants });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const variant = await VehicleVariantService.getById(id);
      res.json({ success: true, data: variant });
    } catch (err) {
      next(err);
    }
  }

  async getByVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleId = Number(req.params.vehicleId);
      const list = await VehicleVariantService.getByVehicle(vehicleId);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;
      const created = await VehicleVariantService.create(payload);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.variantId);
      const payload = req.body;
      const updated = await VehicleVariantService.update(id, payload);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.variantId);
      const result = await VehicleVariantService.remove(id);
      res.json({ ...result, success: true });
    } catch (err) {
      next(err);
    }
  }
}

export default VehicleVariantController;
