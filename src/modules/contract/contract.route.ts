import { Router } from "express";
import {
  authMiddleware,
  checkRole,
} from "../../common/middlewares/auth.middleware";
import { UserRole } from "../user/user.interface";
import ContractController from "./contract.controller";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  approveContractSchema,
  createContractSchema,
  handoverContractSchema,
} from "./contract.validation";

const router = Router();
const contractController = new ContractController();

const staffRoles: UserRole[] = ["DEALER_STAFF", "DEALER_MANAGER"];
const managerRoles: UserRole[] = ["DEALER_MANAGER"];

router.post(
  "/",
  authMiddleware,
  checkRole(staffRoles),
  validate(createContractSchema),
  contractController.createContract
);

router.patch(
  "/:id/approve",
  authMiddleware,
  checkRole(managerRoles),
  validate(approveContractSchema),
  contractController.approve
);

router.post(
  "/:id/handover",
  authMiddleware,
  checkRole(staffRoles),
  validate(handoverContractSchema),
  contractController.handover
);
export default router;
