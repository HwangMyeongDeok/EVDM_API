import { Router } from 'express';
import PromotionController from './promotion.controller';
import { authMiddleware, checkRole } from '../../common/middlewares/auth.middleware';
import { UserRole } from '../user/user.model';

const router = Router();
const promotionController = new PromotionController();

const allowedRoles: UserRole[] = [UserRole.DEALER_STAFF, UserRole.DEALER_MANAGER];

router.get(
  '/',
  authMiddleware,
  checkRole(allowedRoles),
  promotionController.list
);

router.post(
  '/apply-code',
  authMiddleware,
  checkRole(allowedRoles),
  promotionController.applyCode
);

export default router;