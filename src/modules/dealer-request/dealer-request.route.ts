import { Router } from "express";
import DealerRequestController from "./dealer-request.controller";
import {
  authMiddleware,
  checkRole,
} from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  createRequestSchema,
  requestIdParamSchema,
  rejectRequestSchema,
} from "./dealer-request.validation";
import { UserRole } from "../user/user.model";

const router = Router();
const ctrl = new DealerRequestController();

// Quyền hạn: nhân viên/QL đại lý tạo yêu cầu, hãng duyệt
const staffRoles: UserRole[] = [UserRole.DEALER_STAFF, UserRole.DEALER_MANAGER];
const evmRoles: UserRole[] = [UserRole.EVM_STAFF];

router.post(
  "/",
  authMiddleware,
  checkRole(staffRoles),
  validate(createRequestSchema),
  ctrl.create
);

router.get("/", authMiddleware, checkRole(staffRoles), ctrl.getAll);

router.get(
  "/:id",
  authMiddleware,
  checkRole(staffRoles),
  validate(requestIdParamSchema),
  ctrl.getById
);

router.patch(
  "/:id/approve",
  authMiddleware,
  checkRole(evmRoles),
  validate(requestIdParamSchema),
  ctrl.approve
);

router.patch(
  "/:id/reject",
  authMiddleware,
  checkRole(evmRoles),
  validate(rejectRequestSchema),
  ctrl.reject
);

router.delete(
  "/:id",
  authMiddleware,
  checkRole(evmRoles),
  validate(requestIdParamSchema),
  ctrl.delete
);

export default router;
