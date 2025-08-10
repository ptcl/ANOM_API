import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/auth';
import { agentService } from '../services/agentService';

declare global {
  namespace Express {
    interface Request {
      user?: {
        agentId: string;
        bungieId: string;
        protocol?: {
          agentName: string;
          role: string;
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
        error: 'Unauthorized - Valid token required'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyJWT(token);

      req.user = {
        agentId: decoded.agentId,
        bungieId: decoded.bungieId,
        protocol: {
          agentName: decoded.protocol.agentName,
          role: decoded.protocol.role
        }
      };

      const agent = await agentService.getAgentById(decoded.agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      await agentService.updateLastActivity(decoded.agentId);

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  } catch (error: any) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: error.message
    });
  }
};

