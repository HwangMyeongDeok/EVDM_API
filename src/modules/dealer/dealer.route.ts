import { Router } from "express";
import DealerController from "./dealer.controller";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  authMiddleware,
  checkRole,
} from "../../common/middlewares/auth.middleware";
import {
  createDealerSchema,
  updateDealerSchema,
  dealerIdParamSchema,
} from "./dealer.validation";
import { UserRole } from "../user/user.model";

const router = Router();
const ctrl = new DealerController();

const adminRoles: UserRole[] = [UserRole.ADMIN];

router.get("/", authMiddleware, checkRole(adminRoles), ctrl.getAll);

router.get(
  "/:id",
  authMiddleware,
  checkRole(adminRoles),
  validate(dealerIdParamSchema),
  ctrl.getById
);

router.post(
  "/",
  authMiddleware,
  checkRole(adminRoles),
  validate(createDealerSchema),
  ctrl.create
);

router.patch(
  "/:id",
  authMiddleware,
  checkRole(adminRoles),
  validate(updateDealerSchema),
  ctrl.update
);

router.delete(
  "/:id",
  authMiddleware,
  checkRole(adminRoles),
  validate(dealerIdParamSchema),
  ctrl.delete
);

export default router;
