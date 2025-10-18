import { Router } from 'express';
import CustomerController from './customer.controller';
import { authMiddleware, checkRole } from '../../common/middlewares/auth.middleware';
import { UserRole } from '../user/user.interface';
import { validate } from '../../common/middlewares/validate.middleware';
import { createCustomerSchema } from './customer.validation';

const router = Router();
const customerController = new CustomerController();

const allowedRoles: UserRole[] = ['DEALER_STAFF', 'DEALER_MANAGER'];

router.post(
  '/',
  authMiddleware,
  checkRole(allowedRoles),
  validate(createCustomerSchema),
  customerController.create
);

export default router;