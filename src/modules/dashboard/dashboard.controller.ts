import { Request, Response, NextFunction } from "express";
import DashboardService from "./dashboard.service";
import { UserRole } from "../user/user.model";

class DashboardController {
  public async getAuto(req: Request, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as UserRole;
      if (!role) {
        return res.status(401).json({ success: false, message: "Không xác thực được vai trò người dùng." });
      }

      if (role === UserRole.DEALER_MANAGER) {
        return this.getManager(req, res, next);
      }
      if (role === UserRole.DEALER_STAFF) {
        return this.getStaff(req, res, next);
      }
      if (role === UserRole.EVM_STAFF || role === UserRole.ADMIN) {
        return this.getEvm(req, res, next);
      }

      return res.status(403).json({ success: false, message: "Vai trò không được phép truy cập dashboard." });
    } catch (error) {
      next(error);
    }
  }

  public async getManager(req: Request, res: Response, next: NextFunction) {
    try {
      const dealerId = Number(req.user?.dealer_id);
      if (!dealerId) {
        return res.status(400).json({ success: false, message: "Thiếu `dealer_id` của người dùng." });
      }
      const { from, to, limit } = req.query as { from?: string; to?: string; limit?: string };

      const data = await DashboardService.managerDashboard({
        dealerId,
        from,
        to,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public async getStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const dealerId = Number(req.user?.dealer_id);
      const userId = Number(req.user?.user_id);
      if (!dealerId || !userId) {
        return res.status(400).json({ success: false, message: "Thiếu `dealer_id` hoặc `user_id` của người dùng." });
      }
      const { from, to, limit } = req.query as { from?: string; to?: string; limit?: string };

      const data = await DashboardService.staffDashboard({
        dealerId,
        userId,
        from,
        to,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public async getEvm(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to, limit } = req.query as { from?: string; to?: string; limit?: string };
      const data = await DashboardService.evmDashboard({
        from,
        to,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export default DashboardController;
