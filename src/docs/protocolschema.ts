/**
 * @swagger
 * /protocol/status:
 *   get:
 *     summary: Récupère le statut actuel du Protocol
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Statut du Protocol récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "operational"
 *                     activeAgents:
 *                       type: number
 *                       example: 42
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     timestamp:
 *                       type: string
 *                       example: "2025-08-05T12:00:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Protocol status retrieved successfully"
 *       500:
 *         description: Erreur serveur lors de la récupération du statut
 */
/**
 * @swagger
 * /protocol/agents:
 *   get:
 *     summary: Récupère la liste de tous les agents
 *     tags: [Agents]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre maximum d'agents à retourner
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page pour la pagination
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [AGENT, SPECIALIST, FOUNDER]
 *         description: Filtrer par rôle d'agent
 *     responses:
 *       200:
 *         description: Liste des agents récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     agents:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: number
 *                       example: 42
 *                     page:
 *                       type: number
 *                       example: 1
 *                     limit:
 *                       type: number
 *                       example: 20
 *                 message:
 *                   type: string
 *                   example: "Agents retrieved successfully"
 *       500:
 *         description: Erreur serveur lors de la récupération des agents
 */
/**
 * @swagger
 * /protocol/agents/{membershipType}/{membershipId}:
 *   get:
 *     summary: Récupère un agent par son type et ID de membership Bungie
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: membershipType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type de membership Bungie
 *       - in: path
 *         name: membershipId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de membership Bungie
 *     responses:
 *       200:
 *         description: Agent récupéré avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Agent non trouvé
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /protocol/agents/{membershipType}/{membershipId}:
 *   patch:
 *     summary: Met à jour un agent par son type et ID de membership Bungie
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: membershipType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type de membership Bungie
 *       - in: path
 *         name: membershipId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de membership Bungie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               protocol:
 *                 type: object
 *     responses:
 *       200:
 *         description: Agent mis à jour avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé à modifier cet agent
 *       404:
 *         description: Agent non trouvé
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /protocol/agent/profile:
 *   get:
 *     summary: Récupère le profil de l'agent authentifié
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Profil non trouvé
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /protocol/agent/profile:
 *   patch:
 *     summary: Met à jour le profil de l'agent authentifié
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               protocol:
 *                 type: object
 *                 properties:
 *                   customName:
 *                     type: string
 *                   settings:
 *                     type: object
 *                     properties:
 *                       notifications:
 *                         type: boolean
 *                       publicProfile:
 *                         type: boolean
 *                       protocolOSTheme:
 *                         type: string
 *                         enum: [DEFAULT, DARKNESS]
 *                       protocolSounds:
 *                         type: boolean
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /protocol/founder/agents/{agentId}:
 *   patch:
 *     summary: Met à jour un agent (accès administrateur)
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agent à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Agent mis à jour avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Privilèges d'administrateur requis
 *       404:
 *         description: Agent non trouvé
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /protocol/founder/stats/agents:
 *   get:
 *     summary: Récupère les statistiques sur les agents (accès administrateur)
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Privilèges d'administrateur requis
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /protocol/founder/announcements:
 *   post:
 *     summary: Crée une nouvelle annonce (accès administrateur)
 *     tags: [Announcements, Administration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               visibility:
 *                 type: string
 *                 enum: [ALL, FOUNDERS, SPECIALISTS, GROUP]
 *               targetGroup:
 *                 type: string
 *                 enum: [PROTOCOL, AURORA, ZENITH]
 *     responses:
 *       201:
 *         description: Annonce créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Privilèges d'administrateur requis
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /protocol/founder/logs/activity:
 *   get:
 *     summary: Récupère les logs d'activité (accès administrateur)
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre maximum de logs à retourner
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page pour la pagination
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de début pour le filtrage
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de fin pour le filtrage
 *     responses:
 *       200:
 *         description: Logs récupérés avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Privilèges d'administrateur requis
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /protocol/founder/logs/auth:
 *   get:
 *     summary: Récupère les logs d'authentification (accès administrateur)
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre maximum de logs à retourner
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page pour la pagination
 *     responses:
 *       200:
 *         description: Logs récupérés avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Privilèges d'administrateur requis
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /protocol/founder/system/status:
 *   get:
 *     summary: Récupère le statut système détaillé (accès administrateur)
 *     tags: [Administration, System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statut système récupéré avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Privilèges d'administrateur requis
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /protocol/founder/system/maintenance:
 *   post:
 *     summary: Met à jour l'état de maintenance du système (accès administrateur)
 *     tags: [Administration, System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - maintenance
 *             properties:
 *               maintenance:
 *                 type: boolean
 *               message:
 *                 type: string
 *               estimatedEndTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: État de maintenance mis à jour avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Privilèges d'administrateur requis
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /protocol/founder/agents/{agentId}/promote:
 *   post:
 *     summary: Promeut un agent à un rôle supérieur (accès administrateur)
 *     tags: [Administration, Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agent à promouvoir
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [AGENT, SPECIALIST, FOUNDER]
 *               clearanceLevel:
 *                 type: number
 *                 enum: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Agent promu avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Privilèges d'administrateur requis
 *       404:
 *         description: Agent non trouvé
 *       500:
 *         description: Erreur serveur
 */