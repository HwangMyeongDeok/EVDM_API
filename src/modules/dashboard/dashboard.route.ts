import { Router } from "express";
import DashboardController from "./dashboard.controller";
import { authMiddleware, checkRole } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { rangeQuerySchema } from "./dashboard.validation";
import { UserRole } from "../user/user.model";

const router = Router();
const ctrl = new DashboardController();

// Dùng /dashboard tự động theo role
router.get(
  "/",
  authMiddleware,
  validate(rangeQuerySchema),
  ctrl.getAuto
);

// Tường minh từng role:
router.get(
  "/manager",
  authMiddleware,
  checkRole([UserRole.DEALER_MANAGER]),
  validate(rangeQuerySchema),
  ctrl.getManager
);

router.get(
  "/staff",
  authMiddleware,
  checkRole([UserRole.DEALER_STAFF]),
  validate(rangeQuerySchema),
  ctrl.getStaff
);

router.get(
  "/evm",
  authMiddleware,
  checkRole([UserRole.EVM_STAFF, UserRole.ADMIN]),
  validate(rangeQuerySchema),
  ctrl.getEvm
);

export default router;
