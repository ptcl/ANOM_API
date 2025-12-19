import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/auth';
import { agentService } from '../services/agent.service';
import logger from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        agentId: string;
        bungieId: string;
        protocol?: {
          agentName: string;
          roles: string[];
          clearanceLevel: number;
        };
      };
    }
  }
}

export const IdentityMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    const token = authHeader.split(' ')[1];

    if (!token || token.length > 2048) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    try {
      const decoded = verifyJWT(token);

      if (!decoded ||
        typeof decoded.agentId !== 'string' ||
        typeof decoded.bungieId !== 'string') {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      const agent = await agentService.getAgentById(decoded.agentId);

      if (!agent) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      if (!agent.protocol ||
        typeof agent.protocol.agentName !== 'string' ||
        !Array.isArray(agent.protocol.roles) ||
        typeof agent.protocol.clearanceLevel !== 'number') {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      req.user = {
        agentId: agent._id.toString(),
        bungieId: agent.bungieId,
        protocol: {
          agentName: agent.protocol.agentName,
          roles: agent.protocol.roles,
          clearanceLevel: agent.protocol.clearanceLevel
        }
      };

      agentService.updateLastActivity(decoded.agentId).catch((error) => {
        logger.warn('Failed to update last activity', { agentId: decoded.agentId });
      });

      return next();

    } catch (error) {
      logger.debug('JWT verification failed', { ip: req.ip });
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
  } catch (error: any) {
    logger.error('Auth middleware system error', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      error: error.message
    });
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
