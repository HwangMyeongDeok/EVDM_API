import { Router } from "express";
import { authMiddleware, checkRole } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { loginSchema, registerSchema } from "./auth.validation";
import { UserRole } from "../user/user.model";
import AuthController from "./auth.controller";

const router = Router();
const Admin = [UserRole.ADMIN];

const ctrl= new AuthController();

router.post("/login", validate(loginSchema), ctrl.login);
router.post("/register", authMiddleware, checkRole(Admin), validate(registerSchema), ctrl.register);

export default router;