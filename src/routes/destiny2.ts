import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { getDestinyProfile, getCharacters, getItems, getManifestDefinition } from '../controllers/destiny2Controller';

const router = Router();

/**
 * Routes API Destiny2
 * Structure similaire à l'API Bungie: /{membershipType}/Profile/{destinyMembershipId}/
 */

/**
 * @route GET /destiny2/:membershipType/Profile/:membershipId
 * @description Récupère le profil Destiny2 d'un joueur
 * @param {string} membershipType - Type d'appartenance (ex: 3 pour Steam)
 * @param {string} membershipId - ID d'appartenance Destiny
 * @param {string} [components] - Composants à inclure (ex: 100,200,300)
 * @access Privé
 */
router.get('/:membershipType/Profile/:membershipId', authMiddleware, getDestinyProfile);

/**
 * @route GET /destiny2/:membershipType/Profile/:membershipId/Characters
 * @description Récupère les personnages d'un profil Destiny2
 * @param {string} membershipType - Type d'appartenance
 * @param {string} membershipId - ID d'appartenance Destiny
 * @param {string} [components] - Composants à inclure (ex: 200)
 * @access Privé
 */
router.get('/:membershipType/Profile/:membershipId/Characters', authMiddleware, getCharacters);

/**
 * @route GET /destiny2/:membershipType/Profile/:membershipId/Items
 * @description Récupère les items d'un profil Destiny2
 * @param {string} membershipType - Type d'appartenance
 * @param {string} membershipId - ID d'appartenance Destiny
 * @param {string} [components] - Composants à inclure (ex: 102,201,300)
 * @access Privé
 */
router.get('/:membershipType/Profile/:membershipId/Items', authMiddleware, getItems);

/**
 * @route GET /destiny2/Manifest/:definition/:hash
 * @description Récupère une définition du manifeste Destiny2
 * @param {string} definition - Type de définition (ex: InventoryItem)
 * @param {string} hash - Hash de l'élément à récupérer
 * @access Privé
 */
router.get('/Manifest/:definition/:hash', authMiddleware, getManifestDefinition);

export default router;
