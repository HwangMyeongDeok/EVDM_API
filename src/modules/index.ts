import { Router } from 'express';
import vehicleRoute from './vehicles/vehicle.route'; 
import quotationRoute from './quotation/quotation.route';
const router = Router();

interface IRoute {
    path: string;
    route: Router;
}

const appRoutes: IRoute[] = [
    { path: '/vehicles', route: vehicleRoute },
    { path: '/quotations', route: quotationRoute },
];

appRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;