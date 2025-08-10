import { Request, Response } from 'express';
import { generateState, generateJWT, verifyJWT } from '../utils/auth';
import { bungieService } from '../services';
import { IAgent } from '../types/agent';
import { agentService } from '../services/agentService';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { isDev, getServerConfig } from '../utils/environment';

export const initiateLogin = async (req: Request, res: Response) => {
  try {
    const state = generateState();
    const authUrl = bungieService.generateAuthUrl(state);

    const { direct } = req.query;
    if (direct === 'true') {
      console.log('🔄 Redirecting directly to Bungie auth URL');
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
    console.error('❌ Failed to initiate Bungie login:', error);
    return ApiResponseBuilder.error(res, 500, {
      message: 'Échec de l\'initialisation du processus de connexion',
      error: 'login_initialization_failed',
      details: error.message
    });
  }
};

export const handleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.redirect('http://localhost:3000/?error=missing_code');
    }

    console.log('📝 Processing Bungie callback...');

    const tokens = await bungieService.exchangeCodeForTokens(code as string);

    const userProfile = await bungieService.getCurrentUser(tokens.access_token);

    if (!userProfile || !userProfile.bungieId) {
      console.error('❌ Profil Bungie invalide:', userProfile);
      return res.status(400).json({
        success: false,
        error: 'Profil Bungie invalide ou incomplet',
        message: 'Les données du profil Bungie sont incomplètes ou invalides'
      });
    }

    console.log('👤 Profil utilisateur récupéré:');
    console.log('   bungieId:', userProfile.bungieId);
    console.log('   agentName:', userProfile.protocol.agentName);

    const agent = await agentService.createOrUpdateAgent(userProfile, tokens);

    const jwtPayload = {
      agentId: agent._id!.toString(),
      bungieId: agent.bungieId,
      protocol: {
        agentName: agent.protocol.agentName,
        role: agent.protocol.role
      }
    };

    const jwtToken = generateJWT(jwtPayload);

    console.log(`✅ Authentication successful for: ${agent.protocol.agentName} (ID: ${agent._id})`);

    if (isDev()) {
      return res.json({
        success: true,
        data: {
          token: jwtToken,
          agent: {
            _id: agent._id,
            destinyMemberships: agent.destinyMemberships || [],
            bungieUser: agent.bungieUser || {
              membershipId: parseInt(agent.bungieId),
              uniqueName: agent.protocol.agentName,
              displayName: agent.protocol.agentName,
              profilePicture: 0
            },
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
          } as IAgent
        },
        message: 'Authentication successful'
      });
    }
    // Sinon, on redirige vers le frontend avec le token
    else {
      const serverConfig = getServerConfig();
      const frontendUrl = serverConfig.frontendUrl;
      return res.redirect(`${frontendUrl}/auth/callback?token=${jwtToken}`);
    }
  } catch (error: any) {
    console.error('❌ Bungie callback failed:', error);

    if (error.response) {
      console.error('   Réponse d\'erreur:', error.response.data);
      console.error('   Status:', error.response.status);
    }

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

    const agent = await agentService.getAgentById(decoded.agentId);

    if (!agent) {
      return res.json({
        success: false,
        data: { valid: false },
        message: 'Agent not found'
      });
    }

    await agentService.updateLastActivity(agent._id!.toString());

    return res.json({
      success: true,
      data: {
        valid: true,
        agent: {
          _id: agent._id,
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

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token required'
      });
    }

    let decoded;
    try {
      decoded = verifyJWT(token);
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        message: 'Please log in again'
      });
    }

    const agent = await agentService.getAgentById(decoded.agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    const jwtPayload = {
      agentId: agent._id!.toString(),
      bungieId: agent.bungieId,
      protocol: {
        agentName: agent.protocol.agentName,
        role: agent.protocol.role
      }
    };

    const newToken = generateJWT(jwtPayload);

    await agentService.updateLastActivity(agent._id!.toString());

    return res.json({
      success: true,
      data: {
        token: newToken,
        agent: {
          _id: agent._id,
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
