import { Router } from "express";
import QuotationController from "./quotation.controller";
import {
  authMiddleware,
  checkRole,
} from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  createQuotationSchema,
  updateQuotationSchema,
} from "./quotation.validation";
import { UserRole } from "../user/user.model";

const router = Router();
const ctrl = new QuotationController();

const staff = [UserRole.DEALER_STAFF, UserRole.DEALER_MANAGER];
const manager = [UserRole.DEALER_MANAGER];

router.post(
  "/",
  authMiddleware,
  // checkRole(staff),
  // validate(createQuotationSchema),
  ctrl.create
);
router.get("/", authMiddleware, checkRole(staff), ctrl.getAll);
router.get("/:id", authMiddleware, checkRole(staff), ctrl.getById);
router.patch(
  "/:id",
  authMiddleware,
  checkRole(staff),
  validate(updateQuotationSchema),
  ctrl.update
);
router.post("/:id/send", authMiddleware, checkRole(staff), ctrl.send);
router.post("/:id/approve", authMiddleware, checkRole(manager), ctrl.approve);
router.delete("/:id", authMiddleware, checkRole(staff), ctrl.delete);

export default router;
