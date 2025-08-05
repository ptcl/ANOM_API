import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AN0M Protocol API',
      version: '1.0.0',
      description: 'API pour le système de gestion du Protocol AN0M',
      contact: {
        name: 'Protocol Support',
        url: 'https://protocol.anom.com/support',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'Serveur API Protocol',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints d\'authentification via Bungie',
      },
      {
        name: 'Agents',
        description: 'Opérations sur les agents du Protocol',
      },
      {
        name: 'Administration',
        description: 'Endpoints réservés aux administrateurs (FOUNDER)',
      },
      {
        name: 'Announcements',
        description: 'Gestion des annonces du Protocol',
      },
      {
        name: 'System',
        description: 'Endpoints liés au statut du système',
      },
    ],
  },
  apis: [
    './src/routes/*.ts', 
    './src/models/*.ts',
    './src/types/*.ts',
    './src/middlewares/*.ts',
    './src/docs/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
