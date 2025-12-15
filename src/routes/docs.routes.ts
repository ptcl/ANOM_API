import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, swaggerSpecFr } from '../config/swagger';

const router = Router();

const swaggerUiOptions = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
};

// French documentation
router.use('/fr', swaggerUi.serveFiles(swaggerSpecFr, swaggerUiOptions) as any);
router.get('/fr', (req: Request, res: Response) => {
    res.send(swaggerUi.generateHTML(swaggerSpecFr, {
        ...swaggerUiOptions,
        customSiteTitle: 'Documentation API Protocol',
    }));
});

// English documentation (default)
router.use('/', swaggerUi.serveFiles(swaggerSpec, swaggerUiOptions) as any);
router.get('/', (req: Request, res: Response) => {
    res.send(swaggerUi.generateHTML(swaggerSpec, {
        ...swaggerUiOptions,
        customSiteTitle: 'Protocol API Documentation',
    }));
});

export default router;
