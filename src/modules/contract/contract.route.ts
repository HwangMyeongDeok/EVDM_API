import { Router } from "express";
import {
  authMiddleware,
  checkRole,
} from "../../common/middlewares/auth.middleware";
import ContractController from "./contract.controller";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  approveContractSchema,
  createFromQuotationSchema,
  createManualSchema,
  uploadAttachmentSchema,
  makePaymentSchema,
  deliverContractSchema,
} from "./contract.validation";
import { UserRole } from "../user/user.model";

const router = Router();
const contractController = new ContractController();

const staffRoles: UserRole[] = [UserRole.DEALER_STAFF, UserRole.DEALER_MANAGER];
const managerRoles: UserRole[] = [UserRole.DEALER_MANAGER];

router.post(
  "/from-quotation/:id",
  authMiddleware,
  checkRole(staffRoles),
  validate(createFromQuotationSchema),
  contractController.createFromQuotation
);

router.post(
  "/manual",
  authMiddleware,
  checkRole(staffRoles),
  validate(createManualSchema),
  contractController.createManual
);

router.post(
  "/:id/attachments",
  authMiddleware,
  checkRole(staffRoles),
  validate(uploadAttachmentSchema),
  contractController.uploadAttachment
);

router.post(
  "/:id/pay",
  authMiddleware,
  checkRole(staffRoles),
  validate(makePaymentSchema),
  contractController.makePayment
);

router.post(
  "/:id/deliver",
  authMiddleware,
  checkRole(staffRoles),
  validate(deliverContractSchema),
  contractController.deliver
);

router.patch(
  "/:id/approve",
  authMiddleware,
  checkRole(managerRoles),
  validate(approveContractSchema),
  contractController.approve
);

router.get(
  "/:id",
  authMiddleware,
  checkRole(staffRoles),
  contractController.getById
);

export default router;