import { Router } from "express";
import VehicleVariantController from "./vehicle-variant.controller";
import {
  authMiddleware,
  checkRole,
} from "../../common/middlewares/auth.middleware";

import { UserRole } from "../user/user.model";

const router = Router();
const ctrl = new VehicleVariantController();

const staff = [UserRole.DEALER_STAFF, UserRole.DEALER_MANAGER];
const manager = [UserRole.DEALER_MANAGER];

router.post(
  "/",
  authMiddleware,
  checkRole(manager),
  ctrl.create
);

router.get("/", authMiddleware, checkRole(staff), ctrl.getAll);

router.get("/:id", authMiddleware, checkRole(staff), ctrl.getById);

router.patch(
  "/:id",
  authMiddleware,
  checkRole(manager),
  ctrl.update
);

router.delete("/:id", authMiddleware, checkRole(manager), ctrl.remove);

export default router;
