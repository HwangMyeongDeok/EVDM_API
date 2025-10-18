import { Router } from "express";
import QuotationController from "./quotation.controller";
import { authMiddleware, checkRole } from "../../common/middlewares/auth.middleware";
import { UserRole } from "../user/user.interface";
import { validate } from "../../common/middlewares/validate.middleware";
import { createQuotationSchema } from "./quotation.validation";

const router = Router();
const quotationController = new QuotationController();
const allowedRoles: UserRole[] = ['DEALER_STAFF', 'DEALER_MANAGER'];

router.post(
  '/',
  authMiddleware,
  checkRole(allowedRoles),
  validate(createQuotationSchema),
  quotationController.create
);