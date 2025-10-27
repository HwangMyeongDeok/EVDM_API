import { Request, Response, NextFunction } from "express";
import InventoryService from "./inventory.service";

class InventoryController {
  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await InventoryService.getAll();
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const inv = await InventoryService.getById(id);
      res.json({ success: true, data: inv });
    } catch (error) {
      next(error);
    }
  }

  public async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { variant_id, dealer_id, delta } = req.body;
      const inv = await InventoryService.updateStock(
        variant_id,
        dealer_id ?? null,
        delta
      );
      res.json({ success: true, data: inv });
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await InventoryService.delete(id);
      res.json({ success: true, message: "Inventory deleted" });
    } catch (error) {
      next(error);
    }
  }
}

export default InventoryController;
