import { Router } from 'express';
import { createAnnouncement, deleteAnnouncement, getAllAnnouncements, getAllAnnouncementsForFounders, markAnnouncementAsRead, updateAnnouncement } from '../../controllers/announcement.controller';
import { IdentityMiddleware } from '../../middlewares/identity.middleware';
import { ActiveAgentMiddleware } from '../../middlewares/activeAgent.middleware';
import { AccessMiddleware } from '../../middlewares/access.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateAnnouncementSchema, UpdateAnnouncementSchema } from '../../schemas/announcement.schema';
import { AnnouncementIdParamSchema } from '../../schemas/common.schema';

const router = Router();

router.get('/announcements', getAllAnnouncements);
router.post('/announcement/:id/read', IdentityMiddleware, ActiveAgentMiddleware, validate(AnnouncementIdParamSchema, { source: 'params' }), markAnnouncementAsRead);

router.get('/founder/announcements', IdentityMiddleware, AccessMiddleware, getAllAnnouncementsForFounders);
router.post('/founder/announcement', IdentityMiddleware, AccessMiddleware, validate(CreateAnnouncementSchema), createAnnouncement);
router.patch('/founder/announcement/:id', IdentityMiddleware, AccessMiddleware, validate(AnnouncementIdParamSchema, { source: 'params' }), validate(UpdateAnnouncementSchema), updateAnnouncement);
router.delete('/founder/announcement/:id', IdentityMiddleware, AccessMiddleware, validate(AnnouncementIdParamSchema, { source: 'params' }), deleteAnnouncement);

export default router;

