import { Router } from "express";
import VehicleController from "./vehicle.controller";
import { UserRole } from "../user/user.interface";
import {
  authMiddleware,
  checkRole,
} from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { vehicleIdParamSchema } from "./vehicle.validation";

const router = Router();
const { getAll, getById } = new VehicleController();

const allowedRoles: UserRole[] = ["DEALER_STAFF", "DEALER_MANAGER"];
router.get("/", 
    authMiddleware, 
    checkRole(allowedRoles), 
    getAll);
router.get(
  "/:id",
  authMiddleware,
  checkRole(allowedRoles),
  validate(vehicleIdParamSchema),
  getById
);

export default router;
