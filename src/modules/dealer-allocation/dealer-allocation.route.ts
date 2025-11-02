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

const adminRoles: UserRole[] = [UserRole.ADMIN];
const dealerRoles: UserRole[] = [UserRole.DEALER_MANAGER, UserRole.DEALER_STAFF];

router.post(
  "/",
  authMiddleware,
  checkRole(adminRoles),
  validate(createAllocationSchema),
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
  checkRole(adminRoles),
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

export default router;
