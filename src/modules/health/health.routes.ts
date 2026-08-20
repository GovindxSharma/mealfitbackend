import { Router } from 'express';
import { HealthController } from './health.controller';

const router = Router();

router.get('/', HealthController.getLiveness);
router.get('/live', HealthController.getLiveness);
router.get('/details', HealthController.getDetailedStatus);
router.get('/ready', HealthController.getDetailedStatus);

export const healthRoutes = router;
