import { Router } from 'express';
import CustomerController from './customer.controller';
import { authMiddleware, checkRole } from '../../common/middlewares/auth.middleware';
import { validate } from '../../common/middlewares/validate.middleware';
import { createCustomerSchema } from './customer.validation';
import { UserRole } from '../user/user.model';

const router = Router();
const customerController = new CustomerController();

const allowedRoles: UserRole[] = [UserRole.DEALER_STAFF, UserRole.DEALER_MANAGER];

router.get(
  '/',
  authMiddleware,
  checkRole(allowedRoles),
  customerController.list
);

router.post(
  '/',
  authMiddleware,
  checkRole(allowedRoles),
  validate(createCustomerSchema),
  customerController.create
);
router.get("/search", checkRole(allowedRoles), customerController.search);

router.get(
  '/:id',
  authMiddleware,
  checkRole(allowedRoles),
  customerController.getById
);

export default router;