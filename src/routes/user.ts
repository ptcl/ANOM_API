import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers';
import { playerService } from '../services/playerService';

const router = Router();

// Obtenir le profil de l'utilisateur connecté
router.get('/profile', getProfile);

// Mettre à jour le profil de l'utilisateur connecté
router.put('/profile', updateProfile);


export default router;
