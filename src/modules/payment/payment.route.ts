import { Router } from "express";
import PaymentController from "./payment.controller";
import { authMiddleware, checkRole } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { createPaymentSchema } from "./payment.validation";
import { UserRole } from "../user/user.model";

const router = Router();
const ctrl = new PaymentController();

const staff = [UserRole.DEALER_STAFF, UserRole.DEALER_MANAGER];

router.post("/", authMiddleware, checkRole(staff), validate(createPaymentSchema), ctrl.create);
router.get("/contract/:contractId", authMiddleware, checkRole(staff), ctrl.getByContract);

export default router;