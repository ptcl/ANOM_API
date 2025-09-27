import { Request, Response } from 'express';
import { generateState, generateJWT, verifyJWT } from '../utils/auth';
import { bungieService } from '../services';
import { IAgent } from '../types/agent';
import { agentService } from '../services/agentservice';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { isDev, getServerConfig, isTest } from '../utils/environment';
import { formatForUser } from '../utils';

export const initiateLogin = async (req: Request, res: Response) => {
  try {
    const state = generateState();
    const authUrl = bungieService.generateAuthUrl(state);

    const { direct } = req.query;
    if (direct !== undefined && typeof direct !== 'string') {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Paramètre direct invalide',
        error: 'validation_error'
      });
    }

    console.log('Login initiation request:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      direct: direct === 'true',
      timestamp: formatForUser()
    });

    if (direct === 'true') {
      if (!authUrl || !authUrl.startsWith('https://www.bungie.net')) {
        return ApiResponseBuilder.error(res, 500, {
          message: 'URL d\'autorisation invalide',
          error: 'invalid_auth_url'
        });
      }
      return res.redirect(authUrl);
    }

    return ApiResponseBuilder.success(res, {
      message: 'URL d\'autorisation Bungie générée',
      data: {
        authUrl,
        state
      }
    });

  } catch (error: any) {
    console.error('Erreur lors de l\'initiation de la connexion Bungie:', {
      error: error.message,
      stack: error.stack,
      timestamp: formatForUser(),
      ip: req.ip
    });

    return ApiResponseBuilder.error(res, 500, {
      message: 'Échec de l\'initialisation du processus de connexion',
      error: 'login_initialization_failed'
    });
  }
};

export const handleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      console.warn('Tentative de callback sans code valide:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: formatForUser()
      });

      const serverConfig = getServerConfig();
      const frontendUrl = serverConfig.frontendUrl || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/?error=missing_code`);
    }

    if (!state || typeof state !== 'string') {
      console.warn('Tentative de callback sans state valide:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: formatForUser()
      });

      const serverConfig = getServerConfig();
      const frontendUrl = serverConfig.frontendUrl || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/?error=invalid_state`);
    }

    if (code.length > 1000) {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Mauvais code de validation',
        error: 'validation_error'
      });
    }

    // Log de sécurité pour le callback
    console.log('OAuth callback received:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      hasCode: !!code,
      hasState: !!state,
      timestamp: formatForUser()
    });

    // Échange sécurisé du code contre les tokens
    const tokens = await bungieService.exchangeCodeForTokens(code);
    
    if (!tokens || !tokens.access_token) {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Échec de l\'échange de tokens',
        error: 'token_exchange_failed'
      });
    }

    // Récupération sécurisée du profil utilisateur
    const userProfile = await bungieService.getCurrentUser(tokens.access_token);

    if (!userProfile || !userProfile.bungieId) {
      console.error('Profil Bungie invalide reçu:', {
        hasProfile: !!userProfile,
        hasBungieId: !!(userProfile?.bungieId),
        ip: req.ip,
        timestamp: formatForUser()
      });

      return ApiResponseBuilder.error(res, 400, {
        message: 'Profil Bungie invalide ou incomplet',
        error: 'invalid_bungie_profile'
      });
    }
    const agent = await agentService.createOrUpdateAgent(userProfile, tokens);

    if (!agent || !agent._id) {
      console.error('Échec de la création/mise à jour de l\'agent:', {
        bungieId: userProfile.bungieId,
        timestamp: formatForUser()
      });

      return ApiResponseBuilder.error(res, 500, {
        message: 'Échec de la création du profil d\'agent',
        error: 'agent_creation_failed'
      });
    }

    // Validation des données de l'agent avant génération du JWT
    if (!agent.protocol || !agent.protocol.agentName || !agent.protocol.role) {
      console.error('Données d\'agent incomplètes:', {
        agentId: agent._id,
        hasProtocol: !!agent.protocol,
        hasAgentName: !!(agent.protocol?.agentName),
        hasRole: !!(agent.protocol?.role),
        timestamp: formatForUser()
      });

      return ApiResponseBuilder.error(res, 500, {
        message: 'Profil d\'agent incomplet',
        error: 'incomplete_agent_profile'
      });
    }

    // Génération sécurisée du JWT
    const jwtPayload = {
      agentId: agent._id.toString(),
      bungieId: agent.bungieId,
      protocol: {
        agentName: agent.protocol.agentName,
        role: agent.protocol.role
      }
    };

    const jwtToken = generateJWT(jwtPayload);

    if (!jwtToken) {
      return ApiResponseBuilder.error(res, 500, {
        message: 'Échec de la génération du token',
        error: 'token_generation_failed'
      });
    }

    // Log de succès pour l'audit
    console.log('Authentication successful:', {
      agentId: agent._id.toString(),
      bungieId: agent.bungieId,
      agentName: agent.protocol.agentName,
      ip: req.ip,
      timestamp: formatForUser()
    });

    // Réponse sécurisée selon l'environnement
    if (isTest()) {
      // En développement, retourner les données directement avec filtrage
      return res.json({
        success: true,
        data: {
          token: jwtToken,
          agent: {
            _id: agent._id,
            destinyMemberships: agent.destinyMemberships || [],
            bungieUser: agent.bungieUser ? {
              membershipId: agent.bungieUser.membershipId,
              uniqueName: agent.bungieUser.uniqueName,
              displayName: agent.bungieUser.displayName,
              profilePicture: agent.bungieUser.profilePicture || 0
            } : {
              membershipId: parseInt(agent.bungieId),
              uniqueName: agent.protocol.agentName,
              displayName: agent.protocol.agentName,
              profilePicture: 0
            },
            protocol: {
              agentName: agent.protocol.agentName,
              customName: agent.protocol.customName || undefined,
              species: agent.protocol.species,
              role: agent.protocol.role,
              clearanceLevel: agent.protocol.clearanceLevel || 1,
              hasSeenRecruitment: agent.protocol.hasSeenRecruitment || false,
              protocolJoinedAt: agent.protocol.protocolJoinedAt,
              group: agent.protocol.group,
              settings: agent.protocol.settings
            },
            createdAt: agent.createdAt,
            updatedAt: agent.updatedAt
          } as IAgent
        },
        message: 'Authentification réussie'
      });
    } else {
      // En production, redirection sécurisée
      const serverConfig = getServerConfig();
      const frontendUrl = serverConfig.frontendUrl;
      
      if (!frontendUrl || (!frontendUrl.startsWith('https://') && !frontendUrl.startsWith('http://localhost'))) {
        console.error('URL frontend invalide configurée:', frontendUrl);
        return ApiResponseBuilder.error(res, 500, {
          message: 'Configuration serveur invalide',
          error: 'invalid_frontend_url'
        });
      }

      // Encodage sécurisé du token pour l'URL
      const encodedToken = encodeURIComponent(jwtToken);
      return res.redirect(`${frontendUrl}/identity/bungie/callback?token=${encodedToken}`);
    }
  } catch (error: any) {
    // Log sécurisé de l'erreur sans exposer de données sensibles
    console.error('Échec du callback Bungie:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: formatForUser()
    });

    // Log additionnel pour les erreurs HTTP
    if (error.response) {
      console.error('Détails de la réponse d\'erreur:', {
        status: error.response.status,
        statusText: error.response.statusText,
        timestamp: formatForUser()
      });
    }

    // Redirection d'erreur sécurisée
    const serverConfig = getServerConfig();
    const frontendUrl = serverConfig.frontendUrl || 'http://localhost:3000';
    
    if (isDev()) {
      return ApiResponseBuilder.error(res, 500, {
        message: 'Échec du traitement du callback Bungie',
        error: 'callback_processing_failed'
      });
    } else {
      return res.redirect(`${frontendUrl}/?error=authentication_failed`);
    }
  }
};
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    // Validation stricte du token
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Token requis',
        error: 'missing_token'
      });
    }

    // Limitation de la longueur du token
    if (token.length > 2000) {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Token trop long',
        error: 'invalid_token_length'
      });
    }

    // Vérification du format JWT basique
    if (!token.includes('.') || token.split('.').length !== 3) {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Format de token invalide',
        error: 'invalid_token_format'
      });
    }

    // Décodage sécurisé du JWT
    let decoded;
    try {
      decoded = verifyJWT(token);
    } catch (jwtError: any) {
      console.log('Token verification failed:', {
        error: jwtError.message,
        ip: req.ip,
        timestamp: formatForUser()
      });

      return res.json({
        success: false,
        data: { valid: false },
        message: 'Token invalide ou expiré'
      });
    }

    // Validation de la structure du payload
    if (!decoded || !decoded.agentId || typeof decoded.agentId !== 'string') {
      return res.json({
        success: false,
        data: { valid: false },
        message: 'Payload de token invalide'
      });
    }

    // Récupération sécurisée de l'agent
    const agent = await agentService.getAgentById(decoded.agentId);

    if (!agent) {
      console.log('Agent not found for token:', {
        agentId: decoded.agentId,
        ip: req.ip,
        timestamp: formatForUser()
      });

      return res.json({
        success: false,
        data: { valid: false },
        message: 'Agent non trouvé'
      });
    }

    // Mise à jour sécurisée de la dernière activité
    try {
      await agentService.updateLastActivity(agent._id!.toString());
    } catch (updateError: any) {
      console.error('Failed to update last activity:', {
        agentId: agent._id?.toString(),
        error: updateError.message,
        timestamp: formatForUser()
      });
    }

    return res.json({
      success: true,
      data: {
        valid: true,
        agent: {
          _id: agent._id,
          protocol: {
            agentName: agent.protocol.agentName,
            customName: agent.protocol.customName || undefined,
            species: agent.protocol.species,
            role: agent.protocol.role,
            clearanceLevel: agent.protocol.clearanceLevel || 1,
            hasSeenRecruitment: agent.protocol.hasSeenRecruitment || false,
            protocolJoinedAt: agent.protocol.protocolJoinedAt,
            group: agent.protocol.group,
            settings: agent.protocol.settings
          },
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt
        } as IAgent
      },
      message: 'Token valide'
    });

  } catch (error: any) {
    console.error('Erreur lors de la vérification du token:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      timestamp: formatForUser()
    });

    return res.json({
      success: false,
      data: { valid: false },
      message: 'Token invalide ou expiré'
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    // Validation stricte du token
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Token requis pour le renouvellement',
        error: 'missing_token'
      });
    }

    // Limitation de la longueur du token
    if (token.length > 2000) {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Token trop long',
        error: 'invalid_token_length'
      });
    }

    if (!token.includes('.') || token.split('.').length !== 3) {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Format de token invalide',
        error: 'invalid_token_format'
      });
    }

    console.log('Token refresh attempt:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: formatForUser()
    });

    let decoded;
    try {
      decoded = verifyJWT(token);
    } catch (jwtError: any) {
      console.log('Token refresh failed - invalid token:', {
        error: jwtError.message,
        ip: req.ip,
        timestamp: formatForUser()
      });

      return ApiResponseBuilder.error(res, 401, {
        message: 'Token invalide ou expiré, veuillez vous reconnecter',
        error: 'invalid_token'
      });
    }

    if (!decoded || !decoded.agentId || typeof decoded.agentId !== 'string') {
      return ApiResponseBuilder.error(res, 401, {
        message: 'Payload de token invalide',
        error: 'invalid_payload'
      });
    }

    const agent = await agentService.getAgentById(decoded.agentId);

    if (!agent) {
      console.warn('Token refresh failed - agent not found:', {
        agentId: decoded.agentId,
        ip: req.ip,
        timestamp: formatForUser()
      });

      return ApiResponseBuilder.error(res, 404, {
        message: 'Agent non trouvé, veuillez vous reconnecter',
        error: 'agent_not_found'
      });
    }

    if (!agent.protocol || !agent.protocol.agentName || !agent.protocol.role) {
      console.error('Agent incomplete for token refresh:', {
        agentId: agent._id?.toString(),
        hasProtocol: !!agent.protocol,
        hasAgentName: !!(agent.protocol?.agentName),
        hasRole: !!(agent.protocol?.role),
        timestamp: formatForUser()
      });

      return ApiResponseBuilder.error(res, 500, {
        message: 'Profil d\'agent incomplet',
        error: 'incomplete_profile'
      });
    }

    // Génération du nouveau token
    const jwtPayload = {
      agentId: agent._id!.toString(),
      bungieId: agent.bungieId,
      protocol: {
        agentName: agent.protocol.agentName,
        role: agent.protocol.role
      }
    };

    const newToken = generateJWT(jwtPayload);

    if (!newToken) {
      return ApiResponseBuilder.error(res, 500, {
        message: 'Échec de la génération du nouveau token',
        error: 'token_generation_failed'
      });
    }

    try {
      await agentService.updateLastActivity(agent._id!.toString());
    } catch (updateError: any) {
      console.error('Failed to update last activity during refresh:', {
        agentId: agent._id?.toString(),
        error: updateError.message,
        timestamp: formatForUser()
      });
    }

    console.log('Token refreshed successfully:', {
      agentId: agent._id?.toString(),
      agentName: agent.protocol.agentName,
      ip: req.ip,
      timestamp: formatForUser()
    });

    // Réponse sécurisée
    return res.json({
      success: true,
      data: {
        token: newToken,
        agent: {
          _id: agent._id,
          protocol: {
            agentName: agent.protocol.agentName,
            customName: agent.protocol.customName || undefined,
            species: agent.protocol.species,
            role: agent.protocol.role,
            clearanceLevel: agent.protocol.clearanceLevel || 1,
            hasSeenRecruitment: agent.protocol.hasSeenRecruitment || false,
            protocolJoinedAt: agent.protocol.protocolJoinedAt,
            group: agent.protocol.group,
            settings: agent.protocol.settings
          },
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt
        } as IAgent
      },
      message: 'Token renouvelé avec succès'
    });

  } catch (error: any) {
    console.error('Erreur lors du renouvellement du token:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      timestamp: formatForUser()
    });

    return ApiResponseBuilder.error(res, 500, {
      message: 'Erreur interne lors du renouvellement',
      error: 'internal_server_error'
    });
  }
};
