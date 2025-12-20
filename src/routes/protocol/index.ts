import { Router } from 'express';
import agentRoutes from './agent.routes';
import contractRoutes from './contract.routes';
import announcementRoutes from './announcement.routes';
import emblemRoutes from './emblem.routes';
import badgeRoutes from './badge.routes';
import rewardCodeRoutes from './rewardCode.routes';
import timelineRoutes from './timeline.routes';
import loreRoutes from './lore.routes';
import utilsRoutes from './utils.routes';
import roleRoutes from './role.routes';
import divisionRoutes from './division.routes';
import themeRoutes from './theme.routes';

const router = Router();

router.use(agentRoutes);
router.use(contractRoutes);
router.use(announcementRoutes);
router.use(emblemRoutes);
router.use(badgeRoutes);
router.use(rewardCodeRoutes);
router.use(timelineRoutes);
router.use(loreRoutes);
router.use(utilsRoutes);
router.use(roleRoutes);
router.use(divisionRoutes);
router.use(themeRoutes);

export default router;


