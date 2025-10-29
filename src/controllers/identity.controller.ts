import { Request, Response } from 'express';
import { generateState, generateJWT, verifyJWT, createJWTPayload, validateJWTFormat } from '../utils/auth';
import { bungieService } from '../services';
import { agentService } from '../services/agentservice';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { isDev, getServerConfig } from '../utils/environment';
import { formatForUser } from '../utils';
import { formatAgentResponse } from '../utils/formatters';

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

    if (!code || typeof code !== 'string' || !state || typeof state !== 'string') {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Code ou state manquant',
        error: 'invalid_oauth_params'
      });
    }

    console.log('🔁 OAuth callback reçu:', { code, ip: req.ip });

    const tokens = await bungieService.exchangeCodeForTokens(code);
    if (!tokens?.access_token) {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Échec de l\'échange de tokens Bungie',
        error: 'token_exchange_failed'
      });
    }

    const userProfile = await bungieService.getCurrentUser(tokens.access_token);
    if (!userProfile?.bungieId) {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Profil Bungie invalide',
        error: 'invalid_bungie_profile'
      });
    }

    const agent = await agentService.createOrUpdateAgent(userProfile, tokens);
    if (!agent?._id) {
      return ApiResponseBuilder.error(res, 500, {
        message: 'Impossible de créer ou mettre à jour l\'agent',
        error: 'agent_creation_failed'
      });
    }

    const jwtToken = generateJWT(createJWTPayload(agent));

    console.log('✅ Auth réussie:', {
      agentId: agent._id.toString(),
      agentName: agent.protocol.agentName,
      bungieId: agent.bungieId,
    });

    const serverConfig = getServerConfig();
    const redirectUrl = `${serverConfig.frontendUrl}/identity/bungie/callback?token=${jwtToken}&success=true`;

    console.log('✅ Redirecting to frontend:', redirectUrl);
    return res.redirect(redirectUrl);

  } catch (error: any) {
    console.error('❌ Erreur callback Bungie:', error);
    return ApiResponseBuilder.error(res, 500, {
      message: 'Erreur interne lors de l\'authentification Bungie',
      error: 'callback_failed'
    });
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