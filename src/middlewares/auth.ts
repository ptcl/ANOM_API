import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/auth';
import { agentService } from '../services/agentService';

declare global {
  namespace Express {
    interface Request {
      user?: {
        agentId: string;
        bungieId: string;
        agentName: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
        agentName: decoded.agentName,
        role: decoded.role
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

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (req.user.role?.toUpperCase() !== 'FOUNDER') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Founder privileges required'
      });
    }

    return next();
  } catch (error: any) {
    console.error('❌ Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization failed',
      message: error.message
    });
  }
};
