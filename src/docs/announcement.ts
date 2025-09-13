/**
 * @swagger
 * components:
 *   schemas:
 *     Announcement:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Identifiant unique MongoDB de l'annonce
 *           example: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         announcementId:
 *           type: string
 *           description: Identifiant unique personnalisé de l'annonce
 *           example: "ANN-2024-001"
 *         title:
 *           type: string
 *           description: Titre de l'annonce (avec trim automatique)
 *           example: "Maintenance programmée du système Protocol"
 *         content:
 *           type: string
 *           description: Contenu de l'annonce (supporte le Markdown)
 *           example: "Le système Protocol sera en maintenance demain de 02h00 à 04h00 UTC. Toutes les opérations seront temporairement suspendues."
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *           description: Niveau de priorité de l'annonce
 *           default: "LOW"
 *           example: "HIGH"
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *           description: Statut de publication de l'annonce
 *           default: "PUBLISHED"
 *           example: "PUBLISHED"
 *         visibility:
 *           type: string
 *           enum: [ALL, FOUNDERS, SPECIALISTS]
 *           description: Contrôle de visibilité de l'annonce
 *           default: "ALL"
 *           example: "ALL"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de l'annonce (générée automatiquement)
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour de l'annonce (mise à jour automatique)
 *           example: "2024-01-15T12:45:00Z"
 *         createdBy:
 *           type: string
 *           description: Identifiant de l'agent qui a créé l'annonce
 *           example: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Date d'expiration de l'annonce
 *           example: "2024-02-15T10:30:00Z"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags associés à l'annonce
 *           example: ["maintenance", "système", "protocole"]
 *         readBy:
 *           type: array
 *           description: Liste des agents ayant lu l'annonce
 *           items:
 *             type: object
 *             properties:
 *               agentId:
 *                 type: string
 *                 description: Identifiant de l'agent
 *                 example: "64f5a7b2c8d4e1f2a3b4c5d6"
 *               readAt:
 *                 type: string
 *                 format: date-time
 *                 description: Date de lecture
 *                 example: "2024-01-15T14:30:00Z"
 *         targetGroup:
 *           type: string
 *           enum: [PROTOCOL, AURORA, ZENITH]
 *           description: Groupe cible spécifique (optionnel)
 *           example: "AURORA"
 *       required:
 *         - announcementId
 *         - title
 *         - content
 *       example:
 *         _id: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         announcementId: "ANN-2024-001"
 *         title: "Maintenance programmée du système Protocol"
 *         content: "Le système Protocol sera en maintenance demain de 02h00 à 04h00 UTC.\n\n**Services affectés:**\n- Authentification Bungie\n- Synchronisation des données\n- Interface Protocol OS\n\nToutes les opérations seront temporairement suspendues pendant cette période."
 *         priority: "HIGH"
 *         status: "PUBLISHED"
 *         visibility: "ALL"
 *         createdAt: "2024-01-15T10:30:00Z"
 *         updatedAt: "2024-01-15T10:30:00Z"
 *
 *     AnnouncementCreate:
 *       type: object
 *       description: Schéma pour créer une nouvelle annonce
 *       properties:
 *         announcementId:
 *           type: string
 *           description: Identifiant unique personnalisé de l'annonce
 *           example: "ANN-2024-001"
 *         title:
 *           type: string
 *           description: Titre de l'annonce
 *           example: "Maintenance programmée du système Protocol"
 *         content:
 *           type: string
 *           description: Contenu de l'annonce (supporte le Markdown)
 *           example: "Le système Protocol sera en maintenance demain de 02h00 à 04h00 UTC."
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *           description: Niveau de priorité de l'annonce
 *           default: "LOW"
 *           example: "HIGH"
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *           description: Statut de publication de l'annonce
 *           default: "PUBLISHED"
 *           example: "PUBLISHED"
 *         visibility:
 *           type: string
 *           enum: [ALL, FOUNDERS, SPECIALISTS]
 *           description: Contrôle de visibilité de l'annonce
 *           default: "ALL"
 *           example: "ALL"
 *       required:
 *         - announcementId
 *         - title
 *         - content
 *       example:
 *         announcementId: "ANN-2024-001"
 *         title: "Maintenance programmée du système Protocol"
 *         content: "Le système Protocol sera en maintenance demain de 02h00 à 04h00 UTC."
 *         priority: "HIGH"
 *         status: "PUBLISHED"
 *         visibility: "ALL"
 *
 *     AnnouncementUpdate:
 *       type: object
 *       description: Schéma pour mettre à jour une annonce existante
 *       properties:
 *         title:
 *           type: string
 *           description: Titre de l'annonce
 *           example: "Maintenance programmée du système Protocol - REPORTÉE"
 *         content:
 *           type: string
 *           description: Contenu de l'annonce (supporte le Markdown)
 *           example: "La maintenance initialement prévue a été reportée à une date ultérieure."
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *           description: Niveau de priorité de l'annonce
 *           example: "MEDIUM"
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *           description: Statut de publication de l'annonce
 *           example: "ARCHIVED"
 *         visibility:
 *           type: string
 *           enum: [ALL, FOUNDERS, SPECIALISTS]
 *           description: Contrôle de visibilité de l'annonce
 *           example: "FOUNDERS"
 *       example:
 *         title: "Maintenance programmée du système Protocol - REPORTÉE"
 *         content: "La maintenance initialement prévue a été reportée à une date ultérieure."
 *         priority: "MEDIUM"
 *         status: "ARCHIVED"
 *
 *     AnnouncementList:
 *       type: object
 *       description: Réponse pour une liste d'annonces avec pagination
 *       properties:
 *         announcements:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Announcement'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *               description: Page actuelle
 *               example: 1
 *             limit:
 *               type: number
 *               description: Nombre d'éléments par page
 *               example: 10
 *             total:
 *               type: number
 *               description: Nombre total d'annonces
 *               example: 25
 *             pages:
 *               type: number
 *               description: Nombre total de pages
 *               example: 3
 *       example:
 *         announcements:
 *           - _id: "64f5a7b2c8d4e1f2a3b4c5d6"
 *             announcementId: "ANN-2024-001"
 *             title: "Maintenance programmée du système Protocol"
 *             content: "Le système Protocol sera en maintenance demain de 02h00 à 04h00 UTC."
 *             priority: "HIGH"
 *             status: "PUBLISHED"
 *             visibility: "ALL"
 *             createdAt: "2024-01-15T10:30:00Z"
 *             updatedAt: "2024-01-15T10:30:00Z"
 *         pagination:
 *           page: 1
 *           limit: 10
 *           total: 25
 *           pages: 3
 */