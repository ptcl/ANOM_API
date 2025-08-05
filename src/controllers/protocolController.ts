import { Request, Response } from 'express';

export const getProtocolStatus = (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Protocol system status',
        data: {
            status: 'active',
            activeAgents: 42,
            systemVersion: '1.0.0',
            timestamp: new Date().toISOString()
        }
    });
};