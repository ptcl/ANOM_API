import { Router } from 'express';
import { getAvailableTimelines, getTimelineById, getAllTimelines, createTimeline, updateTimeline, deleteTimeline, interact, goHome, goBack } from '../../controllers/timeline.controller';
import { IdentityMiddleware } from '../../middlewares/identity.middleware';
import { ActiveAgentMiddleware } from '../../middlewares/activeAgent.middleware';
import { AccessMiddleware } from '../../middlewares/access.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateTimelineSchema, UpdateTimelineSchema, InteractTimelineSchema, GoBackSchema } from '../../schemas/timeline.schema';
import { TimelineIdParamSchema } from '../../schemas/common.schema';

const router = Router();

router.get('/timelines/available', getAvailableTimelines);
router.post('/agent/timeline/interact', IdentityMiddleware, ActiveAgentMiddleware, validate(InteractTimelineSchema), interact);
router.post('/agent/timeline/home', IdentityMiddleware, ActiveAgentMiddleware, goHome);
router.post('/agent/timeline/back', IdentityMiddleware, ActiveAgentMiddleware, validate(GoBackSchema), goBack);
router.get('/agent/timeline/:timelineId', IdentityMiddleware, ActiveAgentMiddleware, validate(TimelineIdParamSchema, { source: 'params' }), getTimelineById);

router.get('/founder/timelines', IdentityMiddleware, AccessMiddleware, getAllTimelines);
router.post('/founder/timeline', IdentityMiddleware, AccessMiddleware, validate(CreateTimelineSchema), createTimeline);
router.get('/founder/timeline/:timelineId', IdentityMiddleware, AccessMiddleware, validate(TimelineIdParamSchema, { source: 'params' }), getTimelineById);
router.patch('/founder/timeline/:timelineId', IdentityMiddleware, AccessMiddleware, validate(TimelineIdParamSchema, { source: 'params' }), validate(UpdateTimelineSchema), updateTimeline);
router.delete('/founder/timeline/:timelineId', IdentityMiddleware, AccessMiddleware, validate(TimelineIdParamSchema, { source: 'params' }), deleteTimeline);

export default router;

