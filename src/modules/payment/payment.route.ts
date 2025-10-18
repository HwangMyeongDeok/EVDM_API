import { Router } from 'express';
import PaymentController from './payment.controller';
import { authMiddleware, checkRole } from '../../common/middlewares/auth.middleware';
import { UserRole } from '../user/user.interface';
import { validate } from '../../common/middlewares/validate.middleware';
import { createPaymentSchema } from './payment.validation';


const router = Router();
const paymentController = new PaymentController();
const staffRoles: UserRole[] = ['DEALER_STAFF', 'DEALER_MANAGER'];

router.post(
  '/',
  authMiddleware,
  checkRole(staffRoles),
  validate(createPaymentSchema),
  paymentController.create
);

export default router;