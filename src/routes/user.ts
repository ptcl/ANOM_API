import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers';

const router = Router();

/**
 * Routes de gestion du profil utilisateur
 * @route GET /user/profile - Récupère le profil de l'utilisateur connecté
 * @route PUT /user/profile - Met à jour le profil de l'utilisateur connecté
 */
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
