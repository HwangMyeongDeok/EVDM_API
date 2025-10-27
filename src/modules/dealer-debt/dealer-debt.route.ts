import { Router } from "express";
import DealerDebtController from "./dealer-debt.controller";
import {
  authMiddleware,
  checkRole,
} from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  createDealerDebtSchema,
  updateDealerDebtStatusSchema,
  dealerDebtIdParamSchema,
} from "./dealer-debt.validation";
import { UserRole } from "../user/user.model";

const router = Router();
const ctrl = new DealerDebtController();

const admin = [UserRole.ADMIN];
const manager = [UserRole.DEALER_MANAGER];

// Lấy tất cả công nợ (admin)
router.get("/", authMiddleware, checkRole(admin), ctrl.getAll);

// Lấy công nợ theo đại lý
router.get("/dealer/:dealerId", authMiddleware, checkRole(manager), ctrl.getByDealer);

// Lấy chi tiết công nợ
router.get("/:id", authMiddleware, checkRole(manager), validate(dealerDebtIdParamSchema), ctrl.getById);

// Tạo công nợ mới
router.post("/", authMiddleware, checkRole(admin), validate(createDealerDebtSchema), ctrl.create);

// Cập nhật trạng thái công nợ
router.patch("/:id/status", authMiddleware, checkRole(admin), validate(updateDealerDebtStatusSchema), ctrl.updateStatus);

// Xóa công nợ
router.delete("/:id", authMiddleware, checkRole(admin), validate(dealerDebtIdParamSchema), ctrl.delete);

export default router;
