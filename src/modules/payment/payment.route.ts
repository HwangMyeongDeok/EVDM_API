import { Router } from "express";
import PaymentController from "./payment.controller";
import {
  authMiddleware,
  checkRole,
} from "../../common/middlewares/auth.middleware";
import { UserRole } from "../user/user.model";

const router = Router();
const ctrl = new PaymentController();

const staffRoles = [UserRole.DEALER_STAFF, UserRole.DEALER_MANAGER];
const allViewRoles = [
  UserRole.DEALER_STAFF,
  UserRole.DEALER_MANAGER,
  UserRole.ADMIN,
];
router.post("/create", authMiddleware, checkRole(staffRoles), ctrl.create);
router.get("/vnpay-return", ctrl.vnpayReturn);
router.post("/vnpay-ipn", ctrl.vnpayIpn);
router.get("/:id", authMiddleware, checkRole(staffRoles), ctrl.getById);
router.get("/", authMiddleware, checkRole(allViewRoles), ctrl.getAll);
router.post(
  "/deposit",
  authMiddleware,
  checkRole(staffRoles),
  ctrl.createDeposit
);
router.get("/vnpay-return-deposit", ctrl.vnpayReturnDeposit);

export default router;
