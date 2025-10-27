import { Request, Response, NextFunction } from "express";
import DealerService from "./dealer.service";

class DealerController {
  // Lấy danh sách đại lý
  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const dealers = await DealerService.getAll();
      res.json({ success: true, count: dealers.length, data: dealers });
    } catch (error) {
      next(error);
    }
  }

  // Lấy chi tiết 1 đại lý
  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const dealer = await DealerService.getById(id);
      res.json({ success: true, data: dealer });
    } catch (error) {
      next(error);
    }
  }

  // Tạo đại lý mới
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dealer = await DealerService.create(req.body);
      res.status(201).json({ success: true, data: dealer });
    } catch (error) {
      next(error);
    }
  }

  // Cập nhật đại lý
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const dealer = await DealerService.update(id, req.body);
      res.json({ success: true, data: dealer });
    } catch (error) {
      next(error);
    }
  }

  // Xóa đại lý
  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await DealerService.delete(id);
      res.json({ success: true, message: "Dealer deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default DealerController;
