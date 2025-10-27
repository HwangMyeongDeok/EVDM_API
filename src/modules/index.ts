import { Router } from "express";
import vehicleRoute from "./vehicles/vehicle.route";
import quotationRoute from "./quotation/quotation.route";
import customerRoute from "./customer/customer.route";
import contractRoute from "./contract/contract.route";
import paymentRoute from "./payment/payment.route";
import authRoute from "./auth/auth.route";

const router = Router();

interface IRoute {
  path: string;
  route: Router;
}

const appRoutes: IRoute[] = [
  { path: "/auth", route: authRoute },
  { path: "/vehicles", route: vehicleRoute },
  { path: "/quotations", route: quotationRoute },
  { path: "/customers", route: customerRoute },
  { path: "/contracts", route: contractRoute },
  { path: "/payments", route: paymentRoute },
];

appRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
