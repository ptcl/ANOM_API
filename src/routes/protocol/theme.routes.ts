import { Router } from 'express';
import { getAllThemes } from '../../controllers/theme.controller';
import { IdentityMiddleware } from '../../middlewares/identity.middleware';

const router = Router();

router.get('/themes', IdentityMiddleware, getAllThemes);

export default router;
