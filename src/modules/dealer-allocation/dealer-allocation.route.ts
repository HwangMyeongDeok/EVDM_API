import { Router } from "express";
import DealerAllocationController from "./dealer-allocation.controller";
import {
  authMiddleware,
  checkRole,
} from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  createAllocationSchema,
  allocationIdParamSchema,
} from "./dealer-allocation.validation";
import { UserRole } from "../user/user.model";

const router = Router();
const ctrl = new DealerAllocationController();

const adminRoles: UserRole[] = [UserRole.ADMIN, UserRole.DEALER_MANAGER];
const dealerRoles: UserRole[] = [UserRole.DEALER_MANAGER, UserRole.EVM_STAFF];

router.get(
  "/:request_id",
  authMiddleware,
  checkRole(dealerRoles),
  validate(allocationIdParamSchema),
  ctrl.getByRequestId
);

router.post(
  "/",
  authMiddleware,
  checkRole(dealerRoles),
  // validate(createAllocationSchema),
  ctrl.create
);

router.get("/", authMiddleware, checkRole(dealerRoles), ctrl.getAll);

router.get(
  "/:id",
  authMiddleware,
  checkRole(dealerRoles),
  validate(allocationIdParamSchema),
  ctrl.getById
);

router.patch(
  "/:id/in-transit",
  authMiddleware,
  checkRole(dealerRoles),
  validate(allocationIdParamSchema),
  ctrl.markInTransit
);

router.patch(
  "/:id/deliver",
  authMiddleware,
  checkRole(adminRoles),
  validate(allocationIdParamSchema),
  ctrl.markDelivered
);

router.delete(
  "/:id",
  authMiddleware,
  checkRole(adminRoles),
  validate(allocationIdParamSchema),
  ctrl.delete
);

router.patch(
  "/:id/confirm-receipt",
  authMiddleware,
  checkRole(dealerRoles),
  validate(allocationIdParamSchema),
  ctrl.confirmReceipt
);

export default router;
