import { Router } from 'express';
import vehicleRoute from './vehicles/vehicle.route';
import quotationRoute from './quotation/quotation.route';
import customerRoute from './customer/customer.route';
import contractRoute from './contract/contract.route';
import paymentRoute from './payment/payment.route';
import dealerRoute from './dealer/dealer.route';
import dealerAllocationRoute from './dealer-allocation/dealer-allocation.route';
import dealerRequestRoute from './dealer-request/dealer-request.route';
import dealerDebtRoute from './dealer-debt/dealer-debt.route';
import inventoryRoute from './inventory/inventory.route';

const router = Router();

interface IRoute {
  path: string;
  route: Router;
}

const appRoutes: IRoute[] = [
  { path: '/vehicles', route: vehicleRoute },
  { path: '/quotations', route: quotationRoute },
  { path: '/customers', route: customerRoute },
  { path: '/contracts', route: contractRoute },
  { path: '/payments', route: paymentRoute },
  { path: '/dealers', route: dealerRoute },
  { path: '/dealer-allocations', route: dealerAllocationRoute },
  { path: '/dealer-requests', route: dealerRequestRoute },
  { path: '/dealer-debts', route: dealerDebtRoute },
  { path: '/inventory', route: inventoryRoute },

];

appRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;