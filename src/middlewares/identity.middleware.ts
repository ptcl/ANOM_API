import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/auth';
import { agentService } from '../services/agentservice';

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
        error: 'Unauthorized'
      });
    }

    const token = authHeader.split(' ')[1];

    // Validation de base du token
    if (!token || token.length > 2048) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    try {
      const decoded = verifyJWT(token);

      // Validation de la structure du payload JWT
      if (!decoded ||
        typeof decoded.agentId !== 'string' ||
        typeof decoded.bungieId !== 'string' ||
        !decoded.protocol ||
        typeof decoded.protocol.agentName !== 'string' ||
        typeof decoded.protocol.role !== 'string') {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      const agent = await agentService.getAgentById(decoded.agentId);
      if (!agent) {
        // Ne pas révéler si l'agent existe ou non
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      // Assigner les données utilisateur seulement après validation complète
      req.user = {
        agentId: decoded.agentId,
        bungieId: decoded.bungieId,
        protocol: {
          agentName: decoded.protocol.agentName,
          role: decoded.protocol.role
        }
      };

      // Mise à jour de l'activité en arrière-plan pour éviter les race conditions
      agentService.updateLastActivity(decoded.agentId).catch((error) => {
        console.error('Failed to update last activity:', { agentId: decoded.agentId });
      });

      return next();
    } catch (error) {
      // Log sécurisé sans exposer d'informations sensibles
      console.error('JWT verification failed:', {
        timestamp: new Date().toISOString(),
        ip: req.ip
      });

      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
  } catch (error: any) {
    // Log sécurisé pour les erreurs système
    console.error('Auth middleware system error:', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

