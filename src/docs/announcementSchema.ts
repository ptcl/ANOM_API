/**
 * @swagger
 * components:
 *   schemas:
 *     Announcement:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Identifiant unique de l'annonce
 *         title:
 *           type: string
 *           description: Titre de l'annonce
 *         content:
 *           type: string
 *           description: Contenu de l'annonce (supporte le Markdown)
 *         createdBy:
 *           type: string
 *           description: ID de l'agent qui a créé l'annonce (FOUNDER)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de l'annonce
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour de l'annonce
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Date d'expiration de l'annonce
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *           description: Niveau de priorité de l'annonce
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *           description: Statut de l'annonce
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags associés à l'annonce
 *         readBy:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               agentId:
 *                 type: string
 *                 description: ID de l'agent qui a lu l'annonce
 *               readAt:
 *                 type: string
 *                 format: date-time
 *                 description: Date à laquelle l'annonce a été lue
 *           description: Liste des agents qui ont lu l'annonce
 *         visibility:
 *           type: string
 *           enum: [ALL, FOUNDERS, SPECIALISTS, GROUP]
 *           description: Contrôle de visibilité de l'annonce
 *         targetGroup:
 *           type: string
 *           enum: [PROTOCOL, AURORA, ZENITH]
 *           description: Groupe cible si visibility est GROUP
 *       required:
 *         - title
 *         - content
 *         - createdBy
 *         - priority
 *         - status
 *         - visibility
 */
