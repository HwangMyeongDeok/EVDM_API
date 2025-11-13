import { Router } from "express";
import UserController from "./user.controller";
import {
  authMiddleware,
  checkRole,
} from "../../common/middlewares/auth.middleware";
import { UserRole } from "./user.model";

const router = Router();
const ctrl = new UserController();

const adminRoles: UserRole[] = [UserRole.ADMIN];

router.get("/", authMiddleware, checkRole(adminRoles), ctrl.getAll);
router.get("/:id", authMiddleware, checkRole(adminRoles), ctrl.getById);
router.post("/", authMiddleware, checkRole(adminRoles), ctrl.create);
router.patch("/:id", authMiddleware, checkRole(adminRoles), ctrl.update);
router.delete("/:id", authMiddleware, checkRole(adminRoles), ctrl.delete);

export default router;
