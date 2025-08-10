import { Router } from 'express';
import { getDestinyProfile, getCharacters } from '../controllers/Destiny.controller';

const router = Router();

router.get('/:membershipType/Profile/:membershipId', getDestinyProfile);
router.get('/:membershipType/Profile/:membershipId/Characters', getCharacters);
export default router;
