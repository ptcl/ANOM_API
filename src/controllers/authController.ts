import { Request, Response } from 'express';
import { generateState, generateJWT, verifyJWT } from '../utils/auth';
import { bungieService } from '../services';
import { IAgent } from '../types/agent';
import { agentService } from '../services/agentService';




/**
 * Initie le processus d'authentification Bungie
 */
export const initiateLogin = async (req: Request, res: Response) => {
  try {
    const state = generateState();
    const authUrl = bungieService.generateAuthUrl(state);

    // Option de redirection directe si demandée
    const { direct } = req.query;
    if (direct === 'true') {
      console.log('🔄 Redirecting directly to Bungie auth URL');
      return res.redirect(authUrl);
    }

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

    // Vérification du profil avant sauvegarde
    if (!userProfile || !userProfile.membershipId) {
      console.error('❌ Profil Bungie invalide:', userProfile);
      return res.status(400).json({
        success: false,
        error: 'Profil Bungie invalide ou incomplet',
        message: 'Les données du profil Bungie sont incomplètes ou invalides'
      });
    }

    // Log des données importantes
    console.log('👤 Profil utilisateur récupéré:');
    console.log('   membershipId:', userProfile.membershipId);
    console.log('   displayName:', userProfile.displayName);

    // Sauvegarde en base
    const agent = await agentService.createOrUpdateAgent(userProfile, tokens);

    // Génère JWT
    const jwtPayload = {
      agentId: agent._id!.toString(),
      bungieId: agent.bungieId,
      agentName: agent.protocol.agentName,
      role: agent.protocol.role
    };

    const jwtToken = generateJWT(jwtPayload);

    console.log(`✅ Authentication successful for: ${agent.protocol.agentName} (ID: ${agent._id})`);

    // Retourne une réponse JSON au lieu de rediriger
    return res.json({
      success: true,
      data: {
        token: jwtToken,
        agent: {
          _id: agent._id,
          rawdata: null,
          protocol: {
            agentName: agent.protocol.agentName,
            customName: agent.protocol?.customName,
            species: agent.protocol.species,
            role: agent.protocol.role,
            clearanceLevel: agent.protocol?.clearanceLevel || 1,
            hasSeenRecruitment: agent.protocol?.hasSeenRecruitment || false,
            protocolJoinedAt: agent.protocol?.protocolJoinedAt,
            group: agent.protocol.group,
            settings: agent.protocol.settings
          },
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt
        } as IAgent,
        bungieProfile: userProfile // Pour la rétrocompatibilité
      },
      message: 'Authentication successful'
    });

  } catch (error: any) {
    console.error('❌ Bungie callback failed:', error);

    // Journalisation détaillée pour le débogage
    if (error.response) {
      console.error('   Réponse d\'erreur:', error.response.data);
      console.error('   Status:', error.response.status);
    }

    // Retourne une erreur en JSON
    return res.status(500).json({
      success: false,
      error: error.message || 'Authentication failed',
      message: 'Failed to process Bungie callback',
      details: error.stack
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

    // Récupère les infos actuelles de l'agent
    const agent = await agentService.getAgentById(decoded.agentId);

    if (!agent) {
      return res.json({
        success: false,
        data: { valid: false },
        message: 'Agent not found'
      });
    }

    // Met à jour la dernière activité
    await agentService.updateLastActivity(agent._id!.toString());

    return res.json({
      success: true,
      data: {
        valid: true,
        agent: {
          _id: agent._id,
          rawdata: null, // On n'a pas les données Bungie ici
          protocol: {
            agentName: agent.protocol.agentName,
            customName: agent.protocol?.customName || undefined,
            species: agent.protocol.species,
            role: agent.protocol.role,
            clearanceLevel: agent.protocol?.clearanceLevel || 1,
            hasSeenRecruitment: agent.protocol?.hasSeenRecruitment || false,
            protocolJoinedAt: agent.protocol?.protocolJoinedAt,
            group: agent.protocol.group,
            settings: agent.protocol.settings
          },
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt
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

    // Récupère les infos actuelles de l'agent
    const agent = await agentService.getAgentById(decoded.agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    // Génère un nouveau JWT
    const jwtPayload = {
      agentId: agent._id!.toString(),
      bungieId: agent.bungieId,
      agentName: agent.protocol.agentName,
      role: agent.protocol.role
    };

    const newToken = generateJWT(jwtPayload);

    // Met à jour la dernière activité
    await agentService.updateLastActivity(agent._id!.toString());

    return res.json({
      success: true,
      data: {
        token: newToken,
        agent: {
          _id: agent._id,
          rawdata: null, // On n'a pas les données Bungie ici
          protocol: {
            agentName: agent.protocol.agentName,
            customName: agent.protocol?.customName || undefined,
            species: agent.protocol.species,
            role: agent.protocol.role,
            clearanceLevel: agent.protocol?.clearanceLevel || 1,
            hasSeenRecruitment: agent.protocol?.hasSeenRecruitment || false,
            protocolJoinedAt: agent.protocol?.protocolJoinedAt,
            group: agent.protocol.group,
            settings: agent.protocol.settings
          },
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt
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

    const agent = await agentService.getAgentById(decoded.agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    // Récupérer les données Bungie complètes si l'agent a un token d'accès valide
    let bungieProfile = null;
    try {
      if (agent.bungieTokens && agent.bungieTokens.accessToken) {
        bungieProfile = await bungieService.getCurrentUser(agent.bungieTokens.accessToken);
      }
    } catch (error) {
      console.log('⚠️ Impossible de récupérer le profil Bungie complet:', error);
      // On continue même si la récupération du profil Bungie échoue
    }

    return res.json({
      success: true,
      data: {
        agent: {
          _id: agent._id,
          rawdata: bungieProfile?.rawData || null,
          protocol: {
            agentName: agent.protocol.agentName,
            customName: agent.protocol?.customName || undefined,
            species: agent.protocol.species,
            role: agent.protocol.role,
            clearanceLevel: agent.protocol?.clearanceLevel || 1,
            hasSeenRecruitment: agent.protocol?.hasSeenRecruitment || false,
            protocolJoinedAt: agent.protocol?.protocolJoinedAt,
            group: agent.protocol.group,
            settings: agent.protocol.settings
          },
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt
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
    const updatedAgent = await agentService.updateAgentProfile(decoded.agentId, updateData);

    if (!updatedAgent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    return res.json({
      success: true,
      data: {
        agent: {
          _id: updatedAgent._id,
          rawdata: null, // On n'a pas les données Bungie ici
          protocol: {
            agentName: updatedAgent.protocol.agentName,
            customName: updatedAgent.protocol?.customName || undefined,
            species: updatedAgent.protocol.species,
            role: updatedAgent.protocol.role,
            clearanceLevel: updatedAgent.protocol?.clearanceLevel || 1,
            hasSeenRecruitment: updatedAgent.protocol?.hasSeenRecruitment || false,
            protocolJoinedAt: updatedAgent.protocol?.protocolJoinedAt,
            group: updatedAgent.protocol.group,
            settings: updatedAgent.protocol.settings
          },
          createdAt: updatedAgent.createdAt,
          updatedAt: updatedAgent.updatedAt
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