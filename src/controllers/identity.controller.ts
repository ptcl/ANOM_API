import { Request, Response } from 'express';
import { generateState, generateJWT, verifyJWT, createJWTPayload, validateJWTFormat } from '../utils/auth';
import { bungieService } from '../services';
import { agentService } from '../services/agentservice';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { isDev, getServerConfig, isSandbox } from '../utils/environment';
import { formatForUser } from '../utils';
import { formatAgentResponse } from '../utils/formatters';
import { AUTH_CONSTANTS } from '../utils/constants';

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
      const frontendUrl = serverConfig.frontendUrl || 'http://localhost:3001';
      return res.redirect(`${frontendUrl}/login?error=missing_code`);
    }

    if (!state || typeof state !== 'string') {
      console.warn('Tentative de callback sans state valide:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: formatForUser()
      });

      const serverConfig = getServerConfig();
      const frontendUrl = serverConfig.frontendUrl || 'http://localhost:3001';
      return res.redirect(`${frontendUrl}/login?error=invalid_state`);
    }

    if (code.length > AUTH_CONSTANTS.MAX_CODE_LENGTH) {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Mauvais code de validation',
        error: 'validation_error'
      });
    }

    console.log('OAuth callback received:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      hasCode: !!code,
      hasState: !!state,
      timestamp: formatForUser()
    });

    const tokens = await bungieService.exchangeCodeForTokens(code);

    if (!tokens || !tokens.access_token) {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Échec de l\'échange de tokens',
        error: 'token_exchange_failed'
      });
    }

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

    if (!agent.protocol || !agent.protocol.agentName || !agent.protocol.roles) {
      console.error('Données d\'agent incomplètes:', {
        agentId: agent._id,
        hasProtocol: !!agent.protocol,
        hasAgentName: !!(agent.protocol?.agentName),
        hasRoles: !!(agent.protocol?.roles),
        timestamp: formatForUser()
      });

      return ApiResponseBuilder.error(res, 500, {
        message: 'Profil d\'agent incomplet',
        error: 'incomplete_agent_profile'
      });
    }

    const jwtToken = generateJWT(createJWTPayload(agent));

    if (!jwtToken) {
      return ApiResponseBuilder.error(res, 500, {
        message: 'Échec de la génération du token',
        error: 'token_generation_failed'
      });
    }

    console.log('Authentication successful:', {
      agentId: agent._id.toString(),
      bungieId: agent.bungieId,
      agentName: agent.protocol.agentName,
      ip: req.ip,
      timestamp: formatForUser()
    });

    const cookieOptions = {
      httpOnly: true,
      secure: true,          // ⚠️ en local => toujours false
      sameSite: 'none' as const, // ⚠️ cross-port => obligatoire
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      domain: getServerConfig().cookieDomain
    }

    // ✅ Pose les cookies
    res.cookie('auth_token', jwtToken, cookieOptions)

    if (tokens.access_token) {
      res.cookie('bungie_token', tokens.access_token, {
        ...cookieOptions,
        maxAge: 60 * 60 * 1000
      })
    }

    if (tokens.refresh_token) {
      res.cookie('bungie_refresh_token', tokens.refresh_token, {
        ...cookieOptions,
        maxAge: 90 * 24 * 60 * 60 * 1000
      })
    }

    console.log('✅ Cookies envoyés au navigateur')

    // 🔥 MODE SANDBOX : Retourne JSON (pour tests)
    if (isSandbox()) {
      return res.json({
        success: true,
        data: {
          agent: formatAgentResponse(agent, true)
        },
        message: 'Authentification réussie'
      });
    }

    // 🔥 MODE PRODUCTION : Redirige vers le frontend (sans token dans l'URL)
    const serverConfig = getServerConfig();
    const frontendUrl = serverConfig.frontendUrl;

    if (!frontendUrl || (!frontendUrl.startsWith('https://') && !frontendUrl.startsWith('http://localhost'))) {
      console.error('URL frontend invalide configurée:', frontendUrl);
      return ApiResponseBuilder.error(res, 500, {
        message: 'Configuration serveur invalide',
        error: 'invalid_frontend_url'
      });
    }

    // ✅ NOUVEAU : Redirige SANS le token dans l'URL
    return res.redirect(`${frontendUrl}/identity/bungie/callback?success=true`);

  } catch (error: any) {
    console.error('Échec du callback Bungie:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: formatForUser()
    });

    if (error.response) {
      console.error('Détails de la réponse d\'erreur:', {
        status: error.response.status,
        statusText: error.response.statusText,
        timestamp: formatForUser()
      });
    }

    const serverConfig = getServerConfig();
    const frontendUrl = serverConfig.frontendUrl || 'http://localhost:3001';

    if (isDev()) {
      return ApiResponseBuilder.error(res, 500, {
        message: 'Échec du traitement du callback Bungie',
        error: 'callback_processing_failed'
      });
    } else {
      return res.redirect(`${frontendUrl}/login?error=authentication_failed`);
    }
  }
};

// ✅ NOUVEAU : Endpoint pour vérifier l'auth depuis Next.js
export const verifyAuth = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.json({
        success: false,
        data: { authenticated: false },
        message: 'Non authentifié'
      });
    }

    const validation = validateJWTFormat(token);
    if (!validation.valid) {
      return res.json({
        success: false,
        data: { authenticated: false },
        message: 'Token invalide'
      });
    }

    let decoded;
    try {
      decoded = verifyJWT(token);
    } catch (jwtError) {
      return res.json({
        success: false,
        data: { authenticated: false },
        message: 'Token expiré'
      });
    }

    if (!decoded || !decoded.agentId) {
      return res.json({
        success: false,
        data: { authenticated: false },
        message: 'Token invalide'
      });
    }

    const agent = await agentService.getAgentById(decoded.agentId);

    if (!agent) {
      return res.json({
        success: false,
        data: { authenticated: false },
        message: 'Agent non trouvé'
      });
    }

    // Mise à jour de la dernière activité
    try {
      await agentService.updateLastActivity(agent._id!.toString());
    } catch (updateError) {
      console.error('Failed to update last activity:', updateError);
    }

    return res.json({
      success: true,
      data: {
        authenticated: true,
        agent: formatAgentResponse(agent)
      },
      message: 'Authentifié'
    });

  } catch (error: any) {
    console.error('Erreur lors de la vérification auth:', error);
    return res.json({
      success: false,
      data: { authenticated: false },
      message: 'Erreur serveur'
    });
  }
};

// ✅ NOUVEAU : Endpoint de logout
export const logout = async (req: Request, res: Response) => {
  try {
    // Supprime tous les cookies d'auth
    res.clearCookie('auth_token', { path: '/' });
    res.clearCookie('bungie_token', { path: '/' });
    res.clearCookie('bungie_refresh_token', { path: '/' });

    console.log('User logged out:', {
      ip: req.ip,
      timestamp: formatForUser()
    });

    return res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error: any) {
    console.error('Erreur lors de la déconnexion:', error);
    return ApiResponseBuilder.error(res, 500, {
      message: 'Erreur lors de la déconnexion',
      error: 'logout_failed'
    });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const validation = validateJWTFormat(token);
    if (!validation.valid) {
      return ApiResponseBuilder.error(res, 400, {
        message: validation.message || 'Token invalide',
        error: validation.error!
      });
    }

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

    if (!decoded || !decoded.agentId || typeof decoded.agentId !== 'string') {
      return res.json({
        success: false,
        data: { valid: false },
        message: 'Payload de token invalide'
      });
    }

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
        agent: formatAgentResponse(agent)
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
    // ✅ MODIFIÉ : Lit le token depuis les cookies
    const token = req.cookies.auth_token;

    if (!token) {
      return ApiResponseBuilder.error(res, 401, {
        message: 'Aucun token fourni',
        error: 'missing_token'
      });
    }

    const validation = validateJWTFormat(token);
    if (!validation.valid) {
      return ApiResponseBuilder.error(res, 400, {
        message: validation.message || 'Token invalide',
        error: validation.error!
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

    if (!agent.protocol || !agent.protocol.agentName || !agent.protocol.roles) {
      console.error('Agent incomplete for token refresh:', {
        agentId: agent._id?.toString(),
        hasProtocol: !!agent.protocol,
        hasAgentName: !!(agent.protocol?.agentName),
        hasRoles: !!(agent.protocol?.roles),
        timestamp: formatForUser()
      });

      return ApiResponseBuilder.error(res, 500, {
        message: 'Profil d\'agent incomplet',
        error: 'incomplete_profile'
      });
    }

    const newToken = generateJWT(createJWTPayload(agent));

    if (!newToken) {
      return ApiResponseBuilder.error(res, 500, {
        message: 'Échec de la génération du nouveau token',
        error: 'token_generation_failed'
      });
    }

    // ✅ NOUVEAU : Stocke le nouveau token dans le cookie
    const cookieOptions = {
      httpOnly: true,
      secure: !isDev(),
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      path: '/',
      domain: isDev() ? undefined : getServerConfig().cookieDomain
    };

    res.cookie('auth_token', newToken, cookieOptions);

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

    return res.json({
      success: true,
      data: {
        agent: formatAgentResponse(agent)
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