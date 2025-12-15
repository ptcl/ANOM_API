import swaggerJSDoc from 'swagger-jsdoc';

// English documentation
const swaggerOptionsEn = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AN0M Protocol API',
      version: '3.0.0',
      description: 'REST API for the AN0M Protocol management system. Handles agents, contracts, badges, divisions, timelines, and more.',
      contact: {
        name: 'Protocol Support',
        url: 'https://protocol.anom.com/support',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token obtained from Bungie OAuth flow',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Authentication', description: 'Bungie OAuth authentication endpoints' },
      { name: 'Agents', description: 'Agent profile management' },
      { name: 'Contracts', description: 'Agent contract management' },
      { name: 'Badges', description: 'Badge system management' },
      { name: 'Emblems', description: 'Destiny emblem management' },
      { name: 'Divisions', description: 'Division/team management' },
      { name: 'Roles', description: 'Dynamic role management' },
      { name: 'Timelines', description: 'Interactive timeline system' },
      { name: 'Lore', description: 'Lore/story management' },
      { name: 'Announcements', description: 'System announcements' },
      { name: 'Reward Codes', description: 'Promotional code system' },
      { name: 'Founder', description: 'Admin-only endpoints (FOUNDER role required)' },
      { name: 'System', description: 'System status and utilities' },
    ],
  },
  apis: [
    './src/docs/*.ts',
  ],
};

// French documentation
const swaggerOptionsFr = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API AN0M Protocol',
      version: '3.0.0',
      description: 'API REST pour le système de gestion du Protocol AN0M. Gère les agents, contrats, badges, divisions, timelines, et plus.',
      contact: {
        name: 'Support Protocol',
        url: 'https://protocol.anom.com/support',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'Serveur API',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT Bearer obtenu via le flux OAuth Bungie',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Authentification', description: 'Endpoints d\'authentification OAuth Bungie' },
      { name: 'Agents', description: 'Gestion des profils agents' },
      { name: 'Contrats', description: 'Gestion des contrats agents' },
      { name: 'Badges', description: 'Système de badges' },
      { name: 'Emblèmes', description: 'Gestion des emblèmes Destiny' },
      { name: 'Divisions', description: 'Gestion des divisions/équipes' },
      { name: 'Rôles', description: 'Gestion des rôles dynamiques' },
      { name: 'Timelines', description: 'Système de timelines interactives' },
      { name: 'Lore', description: 'Gestion des lores/histoires' },
      { name: 'Annonces', description: 'Annonces système' },
      { name: 'Codes Promo', description: 'Système de codes promotionnels' },
      { name: 'Fondateur', description: 'Endpoints admin (rôle FOUNDER requis)' },
      { name: 'Système', description: 'Statut système et utilitaires' },
    ],
  },
  apis: [
    './src/docs-fr/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptionsEn);
export const swaggerSpecFr = swaggerJSDoc(swaggerOptionsFr);
