import { Router } from "express";
import PaymentController from "./payment.controller";
import { authMiddleware, checkRole } from "../../common/middlewares/auth.middleware";
import { UserRole } from "../user/user.model";

const router = Router();
const ctrl = new PaymentController();

const staff = [UserRole.DEALER_STAFF, UserRole.DEALER_MANAGER];

router.post('/create', authMiddleware, ctrl.create);
router.get('/contract/:contractId', authMiddleware, ctrl.getByContract);
router.get('/vnpay-return', ctrl.vnpayReturn);
router.get('/vnpay-ipn', ctrl.vnpayIpn);

export default router;