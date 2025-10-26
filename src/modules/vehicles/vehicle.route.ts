import { Router } from "express";
import VehicleController from "./vehicle.controller";
import {
  authMiddleware,
  checkRole,
} from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { vehicleIdParamSchema } from "./vehicle.validation";
import { UserRole } from "../user/user.model";

const router = Router();
const { getAll, getById } = new VehicleController();

const allowedRoles: UserRole[] = [UserRole.DEALER_STAFF, UserRole.DEALER_MANAGER];
router.get("/", 
    // authMiddleware, 
    // checkRole(allowedRoles), 
    getAll);
router.get(
  "/:id",
  // authMiddleware,
  // checkRole(allowedRoles),
  validate(vehicleIdParamSchema),
  getById
);

export default router;
