import { Request, Response } from 'express';
import { bungieService } from '../services';

/**
 * @function getDestinyProfile
 * @description Récupère le profil Destiny2 d'un joueur
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 */
export const getDestinyProfile = async (req: Request, res: Response) => {
    try {
        const { membershipType, membershipId } = req.params;
        const components = req.query.components as string | undefined;
        
        // Récupérer le token depuis le header d'autorisation
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification non fourni ou invalide'
            });
        }
        
        const accessToken = authHeader.split(' ')[1];
        
        // Appel au service Bungie pour récupérer les données du profil
        const profileData = await bungieService.getDestinyProfile(
            accessToken,
            membershipType,
            membershipId,
            components
        );
        
        return res.json({
            success: true,
            message: 'Profil Destiny2 récupéré avec succès',
            data: profileData
        });
    } catch (error: any) {
        console.error('❌ Erreur lors de la récupération du profil Destiny2:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil Destiny2',
            error: error.message
        });
    }
};

/**
 * @function getCharacters
 * @description Récupère les personnages d'un profil Destiny2
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 */
export const getCharacters = async (req: Request, res: Response) => {
    try {
        const { membershipType, membershipId } = req.params;
        const components = req.query.components as string || '200'; // Composant par défaut pour les personnages
        
        // Récupérer le token depuis le header d'autorisation
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification non fourni ou invalide'
            });
        }
        
        const accessToken = authHeader.split(' ')[1];
        
        // Appel au service Bungie pour récupérer les données des personnages
        const profileData = await bungieService.getDestinyProfile(
            accessToken,
            membershipType,
            membershipId,
            components
        );
        
        return res.json({
            success: true,
            message: 'Personnages Destiny2 récupérés avec succès',
            data: profileData.characters || {}
        });
    } catch (error: any) {
        console.error('❌ Erreur lors de la récupération des personnages Destiny2:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des personnages Destiny2',
            error: error.message
        });
    }
};

/**
 * @function getItems
 * @description Récupère les items d'un profil Destiny2
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 */
export const getItems = async (req: Request, res: Response) => {
    try {
        const { membershipType, membershipId } = req.params;
        const components = req.query.components as string || '102,201,300'; // Composants par défaut pour les items
        
        // Récupérer le token depuis le header d'autorisation
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification non fourni ou invalide'
            });
        }
        
        const accessToken = authHeader.split(' ')[1];
        
        // Appel au service Bungie pour récupérer les données des items
        const profileData = await bungieService.getDestinyProfile(
            accessToken,
            membershipType,
            membershipId,
            components
        );
        
        return res.json({
            success: true,
            message: 'Items Destiny2 récupérés avec succès',
            data: {
                profileInventory: profileData.profileInventory || {},
                characterInventories: profileData.characterInventories || {},
                itemComponents: profileData.itemComponents || {}
            }
        });
    } catch (error: any) {
        console.error('❌ Erreur lors de la récupération des items Destiny2:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des items Destiny2',
            error: error.message
        });
    }
};

/**
 * @function getManifestDefinition
 * @description Récupère une définition du manifeste Destiny2
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 */
export const getManifestDefinition = async (req: Request, res: Response) => {
    try {
        const { definition, hash } = req.params;
        
        // À implémenter - Accès au manifeste Destiny2
        // Cela nécessiterait un autre service ou une autre méthode dans bungieService
        
        return res.json({
            success: true,
            message: 'Définition du manifeste récupérée avec succès',
            data: {
                definition,
                hash,
                // Données à implémenter
            }
        });
    } catch (error: any) {
        console.error('❌ Erreur lors de la récupération de la définition du manifeste:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la définition du manifeste',
            error: error.message
        });
    }
};
