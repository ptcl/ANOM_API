import { Request, Response } from 'express';
import { bungieService } from '../services';
import { IAgent } from '../types/agent';

export const getDestinyProfile = async (req: Request, res: Response) => {
    try {
        const { membershipType, membershipId } = req.params;
        const components = req.query.components as string | undefined;

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification non fourni ou invalide'
            });
        }

        const accessToken = authHeader.split(' ')[1];

        const profileData = await bungieService.getDestinyProfile(
            accessToken,
            membershipType,
            membershipId,
            components
        );

        const agentResponse: IAgent = {
            _id: undefined,
            bungieId: membershipId,
            bungieUser: {
                membershipId: parseInt(membershipId),
                uniqueName: "Manifest Agent",
                displayName: "Manifest Agent",
                profilePicture: 0,
                about: '',
                firstAccess: new Date(),
                lastAccess: new Date(),
                psnDisplayName: '',
                showActivity: false,
                locale: 'en',
                localeInheritDefault: true,
                profilePicturePath: '',
                profileThemeName: 'default',
                steamDisplayName: '',
                twitchDisplayName: '',
                cachedBungieGlobalDisplayName: '',
                cachedBungieGlobalDisplayNameCode: 0
            },
            protocol: {
                agentName: profileData.profile?.userInfo?.displayName || 'Unknown Agent',
                customName: undefined,
                species: 'HUMAN',
                role: 'AGENT',
                clearanceLevel: 1,
                hasSeenRecruitment: false,
                protocolJoinedAt: undefined,
                group: 'PROTOCOL',
                settings: {
                    notifications: false,
                    publicProfile: false,
                    protocolOSTheme: 'DEFAULT',
                    protocolSounds: false
                }
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return res.json({
            success: true,
            message: 'Profil Destiny2 récupéré avec succès',
            data: {
                agent: agentResponse
            }
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

export const getCharacters = async (req: Request, res: Response) => {
    try {
        const { membershipType, membershipId } = req.params;
        const components = req.query.components as string || '200';

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification non fourni ou invalide'
            });
        }

        const accessToken = authHeader.split(' ')[1];

        const profileData = await bungieService.getDestinyProfile(
            accessToken,
            membershipType,
            membershipId,
            components
        );

        const agentResponse: IAgent = {
            _id: undefined,
            bungieId: membershipId,
            bungieUser: {
                membershipId: parseInt(membershipId),
                uniqueName: "Manifest Agent",
                displayName: "Manifest Agent",
                profilePicture: 0,
                about: '',
                firstAccess: new Date(),
                lastAccess: new Date(),
                psnDisplayName: '',
                showActivity: false,
                locale: 'en',
                localeInheritDefault: true,
                profilePicturePath: '',
                profileThemeName: 'default',
                steamDisplayName: '',
                twitchDisplayName: '',
                cachedBungieGlobalDisplayName: '',
                cachedBungieGlobalDisplayNameCode: 0
            },
            protocol: {
                agentName: profileData.profile?.userInfo?.displayName || 'Unknown Agent',
                customName: undefined,
                species: 'HUMAN',
                role: 'AGENT',
                clearanceLevel: 1,
                hasSeenRecruitment: false,
                protocolJoinedAt: undefined,
                group: 'PROTOCOL',
                settings: {
                    notifications: false,
                    publicProfile: false,
                    protocolOSTheme: 'DEFAULT',
                    protocolSounds: false
                }
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return res.json({
            success: true,
            message: 'Personnages Destiny2 récupérés avec succès',
            data: {
                agent: agentResponse
            }
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
