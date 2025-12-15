import { Request, Response } from 'express';
import { generateState, generateJWT, verifyJWT, createJWTPayload, validateJWTFormat } from '../utils/auth';
import { bungieService } from '../services/index';
import { agentService } from '../services/index';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { isDev, getServerConfig } from '../utils/environment';
import { logger } from '../utils';
import { formatAgentResponse } from '../utils/formatters';

export const initiateLogin = async (req: Request, res: Response) => {
  try {
    const state = generateState();
    const authUrl = bungieService.generateAuthUrl(state);

    const { direct } = req.query;
    if (direct !== undefined && typeof direct !== 'string') {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Invalid direct parameter',
        error: 'validation_error'
      });
    }

    logger.info('Login initiation request:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      direct: direct === 'true'
    });

    if (direct === 'true') {
      if (!authUrl || !authUrl.startsWith('https://www.bungie.net')) {
        return ApiResponseBuilder.error(res, 500, {
          message: 'Invalid authorization URL generated',
          error: 'invalid_auth_url'
        });
      }
      return res.redirect(authUrl);
    }

    return ApiResponseBuilder.success(res, {
      message: 'Bungie authorization URL generated successfully',
      data: {
        authUrl,
        state
      }
    });

  } catch (error: any) {
    logger.error('Error while initiating the Bungie connection:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    return ApiResponseBuilder.error(res, 500, {
      message: 'Error during login initialization',
      error: 'login_initialization_failed'
    });
  }
};

export const handleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string' || !state || typeof state !== 'string') {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Missing code or state in OAuth callback',
        error: 'invalid_oauth_params'
      });
    }

    logger.info('OAuth callback received:', { code, ip: req.ip });

    const tokens = await bungieService.exchangeCodeForTokens(code);
    if (!tokens?.access_token) {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Failed to exchange Bungie tokens',
        error: 'token_exchange_failed'
      });
    }

    const userProfile = await bungieService.getCurrentUser(tokens.access_token);
    if (!userProfile?.bungieId) {
      return ApiResponseBuilder.error(res, 400, {
        message: 'Invalid Bungie profile',
        error: 'invalid_bungie_profile'
      });
    }

    const agent = await agentService.createOrUpdateAgent(userProfile, tokens);
    if (!agent?._id) {
      return ApiResponseBuilder.error(res, 500, {
        message: 'Unable to create or update agent',
        error: 'agent_creation_failed'
      });
    }

    const jwtToken = generateJWT(createJWTPayload(agent));

    logger.info('Auth successful:', {
      agentId: agent._id.toString(),
      agentName: agent.protocol.agentName,
      bungieId: agent.bungieId,
    });

    const serverConfig = getServerConfig();
    const redirectUrl = `${serverConfig.frontendUrl}/identity/bungie/callback?token=${jwtToken}&success=true`;

    logger.info('Redirecting to frontend:', redirectUrl);
    return res.redirect(redirectUrl);

  } catch (error: any) {
    logger.error('Error in Bungie callback:', error);
    return ApiResponseBuilder.error(res, 500, {
      message: 'Internal error during Bungie authentication callback',
      error: 'callback_failed'
    });
  }
};

export const verifyAuth = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.json({
        success: false,
        data: { authenticated: false },
        message: 'Not authenticated'
      });
    }

    const validation = validateJWTFormat(token);
    if (!validation.valid) {
      return res.json({
        success: false,
        data: { authenticated: false },
        message: 'Invalid token'
      });
    }

    let decoded;
    try {
      decoded = verifyJWT(token);
    } catch (jwtError) {
      return res.json({
        success: false,
        data: { authenticated: false },
        message: 'Token expired'
      });
    }

    if (!decoded || !decoded.agentId) {
      return res.json({
        success: false,
        data: { authenticated: false },
        message: 'Invalid token'
      });
    }

    const agent = await agentService.getAgentById(decoded.agentId);

    if (!agent) {
      return res.json({
        success: false,
        data: { authenticated: false },
        message: 'Agent not found'
      });
    }

    try {
      await agentService.updateLastActivity(agent._id!.toString());
    } catch (updateError) {
      logger.error('Failed to update last activity:', updateError);
    }

    return res.json({
      success: true,
      data: {
        authenticated: true,
        agent: formatAgentResponse(agent)
      },
      message: 'Authenticated successfully'
    });

  } catch (error: any) {
    logger.error('Error during auth verification:', error);
    return res.json({
      success: false,
      data: { authenticated: false },
      message: 'Server error during authentication verification'
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('auth_token', { path: '/' });
    res.clearCookie('bungie_token', { path: '/' });
    res.clearCookie('bungie_refresh_token', { path: '/' });

    logger.info('User logged out:', {
      ip: req.ip
    });

    return res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error: any) {
    logger.error('Error during logout:', error);
    return ApiResponseBuilder.error(res, 500, {
      message: 'Error during logout',
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
        message: validation.message || 'Invalid token',
        error: validation.error!
      });
    }

    let decoded;
    try {
      decoded = verifyJWT(token);
    } catch (jwtError: any) {
      logger.info('Token verification failed:', {
        error: jwtError.message,
        ip: req.ip
      });

      return res.json({
        success: false,
        data: { valid: false },
        message: 'Invalid or expired token'
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
      logger.info('Agent not found for token:', {
        agentId: decoded.agentId,
        ip: req.ip
      });

      return res.json({
        success: false,
        data: { valid: false },
        message: 'Agent not found'
      });
    }

    try {
      await agentService.updateLastActivity(agent._id!.toString());
    } catch (updateError: any) {
      logger.error('Failed to update last activity:', {
        agentId: agent._id?.toString(),
        error: updateError.message,
      });
    }

    return res.json({
      success: true,
      data: {
        valid: true,
        agent: formatAgentResponse(agent)
      },
      message: 'Valid token'
    });

  } catch (error: any) {
    logger.error('Error during token verification:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    return res.json({
      success: false,
      data: { valid: false },
      message: 'Invalid or expired token'
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return ApiResponseBuilder.error(res, 401, {
        message: 'No token provided',
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

    logger.info('Token refresh attempt:', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    let decoded;
    try {
      decoded = verifyJWT(token);
    } catch (jwtError: any) {
      logger.info('Token refresh failed - invalid token:', {
        error: jwtError.message,
        ip: req.ip
      });

      return ApiResponseBuilder.error(res, 401, {
        message: 'Invalid or expired token, please log in again',
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
      logger.warn('Token refresh failed - agent not found:', {
        agentId: decoded.agentId,
        ip: req.ip
      });

      return ApiResponseBuilder.error(res, 404, {
        message: 'Agent not found, please log in again',
        error: 'agent_not_found'
      });
    }

    if (!agent.protocol || !agent.protocol.agentName || !agent.protocol.roles) {
      logger.error('Agent incomplete for token refresh:', {
        agentId: agent._id?.toString(),
        hasProtocol: !!agent.protocol,
        hasAgentName: !!(agent.protocol?.agentName),
        hasRoles: !!(agent.protocol?.roles),
      });

      return ApiResponseBuilder.error(res, 500, {
        message: 'Incomplete agent profile',
        error: 'incomplete_profile'
      });
    }

    const newToken = generateJWT(createJWTPayload(agent));

    if (!newToken) {
      return ApiResponseBuilder.error(res, 500, {
        message: 'Failed to generate new token',
        error: 'token_generation_failed'
      });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: !isDev(),
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      domain: isDev() ? undefined : getServerConfig().cookieDomain
    };

    res.cookie('auth_token', newToken, cookieOptions);

    try {
      await agentService.updateLastActivity(agent._id!.toString());
    } catch (updateError: any) {
      logger.error('Failed to update last activity during refresh:', {
        agentId: agent._id?.toString(),
        error: updateError.message
      });
    }

    logger.info('Token refreshed successfully:', {
      agentId: agent._id?.toString(),
      agentName: agent.protocol.agentName,
      ip: req.ip
    });

    return res.json({
      success: true,
      data: {
        agent: formatAgentResponse(agent)
      },
      message: 'Token refreshed successfully'
    });

  } catch (error: any) {
    logger.error('Error during token refresh:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    return ApiResponseBuilder.error(res, 500, {
      message: 'Internal error during token refresh',
      error: 'internal_server_error'
    });
  }
};