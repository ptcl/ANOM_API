/**
 * @swagger
 * components:
 *   schemas:
 *     Agent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Identifiant unique de l'agent
 *         bungieId:
 *           type: string
 *           description: Identifiant Bungie de l'agent
 *         destinyMemberships:
 *           type: array
 *           description: Liste des memberships Destiny de l'agent
 *           items:
 *             type: object
 *             properties:
 *               crossSaveOverride:
 *                 type: number
 *               applicableMembershipTypes:
 *                 type: array
 *                 items:
 *                   type: number
 *               isPublic:
 *                 type: boolean
 *               membershipType:
 *                 type: number
 *               membershipId:
 *                 type: string
 *               displayName:
 *                 type: string
 *               bungieGlobalDisplayName:
 *                 type: string
 *               bungieGlobalDisplayNameCode:
 *                 type: number
 *         bungieUser:
 *           type: object
 *           properties:
 *             membershipId:
 *               type: number
 *             uniqueName:
 *               type: string
 *             displayName:
 *               type: string
 *             profilePicture:
 *               type: number
 *             profilePicturePath:
 *               type: string
 *         protocol:
 *           type: object
 *           properties:
 *             agentName:
 *               type: string
 *               description: Nom de l'agent dans le Protocol
 *             customName:
 *               type: string
 *               description: Nom personnalisé de l'agent
 *             species:
 *               type: string
 *               enum: [HUMAN, EXO, AWOKEN]
 *               description: Espèce de l'agent
 *             role:
 *               type: string
 *               enum: [AGENT, SPECIALIST, FOUNDER]
 *               description: Rôle de l'agent dans le Protocol
 *             clearanceLevel:
 *               type: number
 *               enum: [1, 2, 3]
 *               description: Niveau d'habilitation de l'agent
 *             hasSeenRecruitment:
 *               type: boolean
 *               description: Si l'agent a terminé le processus de recrutement
 *             protocolJoinedAt:
 *               type: string
 *               format: date-time
 *               description: Date d'intégration au Protocol
 *             group:
 *               type: string
 *               enum: [PROTOCOL, AURORA, ZENITH]
 *               description: Groupe d'affectation de l'agent
 *             settings:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: boolean
 *                 publicProfile:
 *                   type: boolean
 *                 protocolOSTheme:
 *                   type: string
 *                   enum: [DEFAULT, DARKNESS]
 *                 protocolSounds:
 *                   type: boolean
 *         lastActivity:
 *           type: string
 *           format: date-time
 *           description: Date de dernière activité de l'agent
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du compte
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour du compte
 *       required:
 *         - bungieId
 *         - protocol
 */
