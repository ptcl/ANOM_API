import { Request, Response } from 'express';
import { generateState, generateJWT, verifyJWT } from '../utils/auth';
import { bungieService } from '../services';
import { playerService } from '../services/playerService';
import { IAgent } from '../types/agent';




/**
 * Initie le processus d'authentification Bungie
 */
export const initiateLogin = async (req: Request, res: Response) => {
  try {
    const state = generateState();
    const authUrl = bungieService.generateAuthUrl(state);

    res.json({
      success: true,
      data: {
        authUrl,
        state
      },
      message: 'Bungie authorization URL generated'
    });
  } catch (error) {
    console.error('❌ Failed to initiate Bungie login:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate login process'
    });
  }
};

/**
 * Traite le callback d'autorisation Bungie avec persistance
 */
// Dans ton contrôleur handleCallback - MODIFICATION
export const handleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      // Redirection vers frontend avec erreur
      return res.redirect('http://localhost:3000/?error=missing_code');
    }

    console.log('📝 Processing Bungie callback...');

    // Échange le code contre des tokens
    const tokens = await bungieService.exchangeCodeForTokens(code as string);

    // Récupère le profil utilisateur
    const userProfile = await bungieService.getCurrentUser(tokens.access_token);

    // Sauvegarde en base
    const player = await playerService.createOrUpdatePlayer(userProfile, tokens);

    // Génère JWT
    const jwtPayload = {
      playerId: player._id!.toString(),
      bungieId: player.bungieId,
      displayName: player.displayName,
      role: player.role
    };

    const jwtToken = generateJWT(jwtPayload);

    console.log(`✅ Authentication successful for: ${player.displayName} (ID: ${player._id})`);

    // Retourne une réponse JSON au lieu de rediriger
    return res.json({
      success: true,
      data: {
        token: jwtToken,
        agent: {
          _id: player._id,
          rawdata: null,
          protocol: {
            agentName: player.displayName,
            customName: player.protocol?.customName,
            species: 'HUMAN',
            role: player.role.toUpperCase(),
            clearanceLevel: player.protocol?.clearanceLevel || 1,
            hasSeenRecruitment: player.protocol?.hasSeenRecruitment || false,
            protocolJoinedAt: player.protocol?.protocolJoinedAt,
            group: 'PROTOCOL',
            settings: {
              notifications: player.settings?.notifications || false,
              publicProfile: player.settings?.publicProfile || false,
              protocolOSTheme: 'DEFAULT',
              protocolSounds: player.settings?.protocolSounds || false
            }
          },
          createdAt: player.joinedAt,
          updatedAt: player.lastActivity
        } as IAgent,
        bungieProfile: userProfile // Pour la rétrocompatibilité
      },
      message: 'Authentication successful'
    });

  } catch (error: any) {
    console.error('❌ Bungie callback failed:', error);

    // Retourne une erreur en JSON
    return res.status(500).json({
      success: false,
      error: error.message || 'Authentication failed',
      message: 'Failed to process Bungie callback'
    });
  }
};
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token required'
      });
    }

    const decoded = verifyJWT(token);

    // Récupère les infos actuelles du joueur
    const player = await playerService.getPlayerById(decoded.playerId);

    if (!player) {
      return res.json({
        success: false,
        data: { valid: false },
        message: 'Player not found'
      });
    }

    // Met à jour la dernière activité
    await playerService.updateLastActivity(player._id!.toString());

    return res.json({
      success: true,
      data: {
        valid: true,
        agent: {
          _id: player._id,
          rawdata: null, // On n'a pas les données Bungie ici
          protocol: {
            agentName: player.displayName,
            customName: player.protocol?.customName || undefined,
            species: (player.protocol?.species as 'HUMAN' | 'EXO' | 'AWOKEN') || 'HUMAN',
            role: (player.role.toUpperCase() as 'AGENT' | 'SPECIALIST' | 'FOUNDER'),
            clearanceLevel: player.protocol?.clearanceLevel || 1,
            hasSeenRecruitment: player.protocol?.hasSeenRecruitment || false,
            protocolJoinedAt: player.protocol?.protocolJoinedAt,
            group: (player.protocol?.group as 'PROTOCOL' | 'AURORA' | 'ZENITH') || 'PROTOCOL',
            settings: {
              notifications: player.settings?.notifications || false,
              publicProfile: player.settings?.publicProfile || false,
              protocolOSTheme: (player.settings?.protocolOSTheme?.toUpperCase() as 'DEFAULT' | 'DARKNESS') || 'DEFAULT',
              protocolSounds: player.settings?.protocolSounds || false
            }
          },
          createdAt: player.joinedAt,
          updatedAt: player.lastActivity
        } as IAgent
      },
      message: 'Token is valid'
    });
  } catch (error) {
    return res.json({
      success: false,
      data: { valid: false },
      message: 'Token is invalid or expired'
    });
  }
};

/**
 * Rafraîchit un token JWT avant son expiration
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token required'
      });
    }

    // Vérifie l'ancien token
    let decoded;
    try {
      decoded = verifyJWT(token);
    } catch (error: any) {
      // Si le token est déjà expiré ou invalide
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        message: 'Please log in again'
      });
    }

    // Récupère les infos actuelles du joueur
    const player = await playerService.getPlayerById(decoded.playerId);

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    // Génère un nouveau JWT
    const jwtPayload = {
      playerId: player._id!.toString(),
      bungieId: player.bungieId,
      displayName: player.displayName,
      role: player.role
    };

    const newToken = generateJWT(jwtPayload);

    // Met à jour la dernière activité
    await playerService.updateLastActivity(player._id!.toString());

    return res.json({
      success: true,
      data: {
        token: newToken,
        agent: {
          _id: player._id,
          rawdata: null, // On n'a pas les données Bungie ici
          protocol: {
            agentName: player.displayName,
            customName: player.protocol?.customName || undefined,
            species: (player.protocol?.species as 'HUMAN' | 'EXO' | 'AWOKEN') || 'HUMAN',
            role: (player.role.toUpperCase() as 'AGENT' | 'SPECIALIST' | 'FOUNDER'),
            clearanceLevel: player.protocol?.clearanceLevel || 1,
            hasSeenRecruitment: player.protocol?.hasSeenRecruitment || false,
            protocolJoinedAt: player.protocol?.protocolJoinedAt,
            group: (player.protocol?.group as 'PROTOCOL' | 'AURORA' | 'ZENITH') || 'PROTOCOL',
            settings: {
              notifications: player.settings?.notifications || false,
              publicProfile: player.settings?.publicProfile || false,
              protocolOSTheme: (player.settings?.protocolOSTheme?.toUpperCase() as 'DEFAULT' | 'DARKNESS') || 'DEFAULT',
              protocolSounds: player.settings?.protocolSounds || false
            }
          },
          createdAt: player.joinedAt,
          updatedAt: player.lastActivity
        } as IAgent
      },
      message: 'Token refreshed successfully'
    });
  } catch (error: any) {
    console.error('❌ Error refreshing token:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to refresh token',
      message: error.message
    });
  }
};

/**
 * Récupère le profil du joueur connecté
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    // 🆕 DEBUG: Log de l'header Authorization
    console.log('🔍 Authorization header:', authHeader);

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header missing'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header must start with "Bearer "'
      });
    }

    const token = authHeader.split(' ')[1];

    // 🆕 DEBUG: Log du token extrait
    console.log('🔍 Extracted token:', token ? token.substring(0, 20) + '...' : 'UNDEFINED');
    console.log('🔍 Token length:', token ? token.length : 0);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // 🆕 DEBUG: Vérification du format JWT (doit avoir 3 parties séparées par des points)
    const tokenParts = token.split('.');
    console.log('🔍 Token parts count:', tokenParts.length);
    console.log('🔍 Token parts lengths:', tokenParts.map(part => part.length));

    if (tokenParts.length !== 3) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JWT format - must have 3 parts separated by dots',
        debug: {
          partsCount: tokenParts.length,
          token: token.substring(0, 50) + '...'
        }
      });
    }

    // Tentative de décodage
    let decoded;
    try {
      decoded = verifyJWT(token);
      console.log('✅ Token decoded successfully:', decoded);
    } catch (jwtError: any) {
      console.error('❌ JWT verification failed:', jwtError.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        details: jwtError.message,
        debug: {
          tokenStart: token.substring(0, 50) + '...',
          partsCount: tokenParts.length
        }
      });
    }

    const player = await playerService.getPlayerById(decoded.playerId);

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    // Récupérer les données Bungie complètes si le joueur a un token d'accès valide
    let bungieProfile = null;
    try {
      if (player.bungieTokens && player.bungieTokens.accessToken) {
        bungieProfile = await bungieService.getCurrentUser(player.bungieTokens.accessToken);
      }
    } catch (error) {
      console.log('⚠️ Impossible de récupérer le profil Bungie complet:', error);
      // On continue même si la récupération du profil Bungie échoue
    }

    return res.json({
      success: true,
      data: {
        agent: {
          _id: player._id,
          rawdata: bungieProfile?.rawData || null,
          protocol: {
            agentName: player.displayName,
            customName: player.protocol?.customName || undefined,
            species: (player.protocol?.species as 'HUMAN' | 'EXO' | 'AWOKEN') || 'HUMAN',
            role: (player.role.toUpperCase() as 'AGENT' | 'SPECIALIST' | 'FOUNDER'),
            clearanceLevel: player.protocol?.clearanceLevel || 1,
            hasSeenRecruitment: player.protocol?.hasSeenRecruitment || false,
            protocolJoinedAt: player.protocol?.protocolJoinedAt,
            group: (player.protocol?.group as 'PROTOCOL' | 'AURORA' | 'ZENITH') || 'PROTOCOL',
            settings: {
              notifications: player.settings?.notifications || false,
              publicProfile: player.settings?.publicProfile || false,
              protocolOSTheme: (player.settings?.protocolOSTheme?.toUpperCase() as 'DEFAULT' | 'DARKNESS') || 'DEFAULT',
              protocolSounds: player.settings?.protocolSounds || false
            }
          },
          createdAt: player.joinedAt,
          updatedAt: player.lastActivity
        } as IAgent,
        bungieProfile: bungieProfile // Pour la rétrocompatibilité
      }
    });
  } catch (error) {
    console.error('❌ Error getting profile:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
};

/**
 * Met à jour le profil d'un joueur
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // Vérification du token d'authentification
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Valid token required'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = verifyJWT(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Récupération des données de mise à jour
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No update data provided'
      });
    }

    // Validation des données de mise à jour (exemple)
    if (updateData.role && !['agent', 'specialist', 'founder', 'admin'].includes(updateData.role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role specified'
      });
    }

    // Mise à jour du profil
    const updatedPlayer = await playerService.updatePlayerProfile(decoded.playerId, updateData);

    if (!updatedPlayer) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    return res.json({
      success: true,
      data: {
        agent: {
          _id: updatedPlayer._id,
          rawdata: null, // On n'a pas les données Bungie ici
          protocol: {
            agentName: updatedPlayer.displayName,
            customName: updatedPlayer.protocol?.customName || undefined,
            species: (updatedPlayer.protocol?.species as 'HUMAN' | 'EXO' | 'AWOKEN') || 'HUMAN',
            role: (updatedPlayer.role.toUpperCase() as 'AGENT' | 'SPECIALIST' | 'FOUNDER'),
            clearanceLevel: updatedPlayer.protocol?.clearanceLevel || 1,
            hasSeenRecruitment: updatedPlayer.protocol?.hasSeenRecruitment || false,
            protocolJoinedAt: updatedPlayer.protocol?.protocolJoinedAt,
            group: (updatedPlayer.protocol?.group as 'PROTOCOL' | 'AURORA' | 'ZENITH') || 'PROTOCOL',
            settings: {
              notifications: updatedPlayer.settings?.notifications || false,
              publicProfile: updatedPlayer.settings?.publicProfile || false,
              protocolOSTheme: (updatedPlayer.settings?.protocolOSTheme?.toUpperCase() as 'DEFAULT' | 'DARKNESS') || 'DEFAULT',
              protocolSounds: updatedPlayer.settings?.protocolSounds || false
            }
          },
          createdAt: updatedPlayer.joinedAt,
          updatedAt: updatedPlayer.lastActivity
        } as IAgent
      },
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    console.error('❌ Error updating profile:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      message: error.message
    });
  }
};