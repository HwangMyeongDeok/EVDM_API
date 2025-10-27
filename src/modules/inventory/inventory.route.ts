import { Router } from "express";
import InventoryController from "./inventory.controller";
import {
  authMiddleware,
  checkRole,
} from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  updateStockSchema,
  inventoryIdParamSchema,
} from "./inventory.validation";
import { UserRole } from "../user/user.model";

const router = Router();
const ctrl = new InventoryController();

const admin = [UserRole.ADMIN];
const dealerRoles = [UserRole.DEALER_MANAGER, UserRole.DEALER_STAFF];

// Lấy tất cả tồn kho (admin)
router.get("/", authMiddleware, checkRole(admin), ctrl.getAll);

// Lấy tồn kho chi tiết
router.get(
  "/:id",
  authMiddleware,
  checkRole(dealerRoles),
  validate(inventoryIdParamSchema),
  ctrl.getById
);

// Cập nhật kho
router.patch(
  "/update",
  authMiddleware,
  checkRole(admin),
  validate(updateStockSchema),
  ctrl.updateStock
);

// Xóa bản ghi tồn kho
router.delete(
  "/:id",
  authMiddleware,
  checkRole(admin),
  validate(inventoryIdParamSchema),
  ctrl.delete
);

export default router;
