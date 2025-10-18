import { Router } from 'express';
import vehicleRoute from './vehicles/vehicle.route'; 

const router = Router();

interface IRoute {
    path: string;
    route: Router;
}

const appRoutes: IRoute[] = [
    { path: '/vehicles', route: vehicleRoute },
];

appRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;