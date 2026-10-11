import { Router } from 'express';
import branchRoutes from './branch.routes.js';
import employeeRoutes from './employee.routes.js';
import categoryRoutes from './category.routes.js';
import assetRoutes from './asset.routes.js';

const apiRouter = Router();

apiRouter.use('/branches', branchRoutes);
apiRouter.use('/employees', employeeRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/assets', assetRoutes);

export default apiRouter;
