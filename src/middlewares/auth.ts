import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/auth';
import { agentService } from '../services/agentService';

// Étendre l'interface Request pour inclure l'utilisateur
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

/**
 * Middleware qui vérifie si l'utilisateur est authentifié via JWT
 */
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
      // Vérifie le token JWT
      const decoded = verifyJWT(token);

      // Stocke les informations de l'utilisateur dans l'objet req pour un usage ultérieur
      req.user = {
        agentId: decoded.agentId,
        bungieId: decoded.bungieId,
        agentName: decoded.agentName,
        role: decoded.role  // Rôle provenant directement du token JWT (agent.protocol.role)
      };

      // Vérifie que l'agent existe toujours en base
      const agent = await agentService.getAgentById(decoded.agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      // Met à jour la dernière activité
      await agentService.updateLastActivity(decoded.agentId);

      // Continue vers la route protégée
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

/**
 * Middleware qui vérifie si l'utilisateur est un administrateur
 * Doit être utilisé après le middleware authMiddleware
 */
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Vérifie que l'utilisateur est authentifié
    if (!req.user || !req.user.agentId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Vérifie le rôle de l'utilisateur (le rôle est stocké directement dans req.user.role depuis le token JWT)
    if (req.user.role !== 'FOUNDER') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Admin privileges required'
      });
    }

    // L'utilisateur est un administrateur, continue vers la route protégée
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
