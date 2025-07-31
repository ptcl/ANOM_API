import { Request, Response } from 'express';
import { generateState, generateJWT, verifyJWT } from '../utils/auth';
import { bungieService } from '../services';
import { playerService } from '../services/playerService';




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
export const handleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code missing'
      });
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

    // 🆕 TOUJOURS RETOURNER JSON (pas de redirection)
    return res.json({
      success: true,
      data: {
        token: jwtToken,
        player: {
          id: player._id,
          bungieId: player.bungieId,
          displayName: player.displayName,
          role: player.role,
          profilePicture: player.profilePicturePath,
          joinedAt: player.joinedAt,
        }
      },
      message: 'Authentication successful - Copy the token for your requests!'
    });

  } catch (error: any) {
    console.error('❌ Bungie callback failed:', error);

    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Authentication failed'
    });
  }
};
/**
 * Vérifie un token JWT et retourne les infos du joueur
 */
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
        player: {
          id: player._id,
          bungieId: player.bungieId,
          displayName: player.displayName,
          role: player.role,
          profilePicture: player.profilePicturePath,
          joinedAt: player.joinedAt,
          lastActivity: player.lastActivity,
        }
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

    return res.json({
      success: true,
      data: {
        player: {
          id: player._id,
          bungieId: player.bungieId,
          displayName: player.displayName,
          role: player.role,
          profilePicture: player.profilePicturePath,
          joinedAt: player.joinedAt,
          lastActivity: player.lastActivity,
          settings: player.settings,
        }
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