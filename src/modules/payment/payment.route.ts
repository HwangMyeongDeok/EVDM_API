import { Router } from "express";
import PaymentController from "./payment.controller";
import { authMiddleware, checkRole } from "../../common/middlewares/auth.middleware";
import { UserRole } from "../user/user.model";

const router = Router();
const ctrl = new PaymentController();

const staffRoles = [UserRole.DEALER_STAFF, UserRole.DEALER_MANAGER];

router.post("/create", authMiddleware, checkRole(staffRoles), ctrl.create);
router.get("/vnpay-return", ctrl.vnpayReturn);
router.post("/vnpay-ipn", ctrl.vnpayIpn);
export default router;