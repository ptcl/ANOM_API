import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/auth';
import { agentService } from '../services/agentService';

// Étendre l'interface Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        playerId: string;
        bungieId: string;
        displayName: string;
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
      
      // Stocke l'ID du joueur dans l'objet req pour un usage ultérieur
      req.user = {
        playerId: decoded.playerId,
        bungieId: decoded.bungieId,
        displayName: decoded.displayName,
        role: decoded.role
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
