/**
 * @swagger
 * components:
 *   schemas:
 *     AgentSettings:
 *       type: object
 *       properties:
 *         notifications:
 *           type: boolean
 *           example: true
 *         publicProfile:
 *           type: boolean
 *           example: true
 *         themes:
 *           type: object
 *           properties:
 *             protocol:
 *               type: boolean
 *             clovisBray:
 *               type: boolean
 *             vanguard:
 *               type: boolean
 *             blackArmory:
 *               type: boolean
 *             opulence:
 *               type: boolean
 *           example: { protocol: true, clovisBray: false, vanguard: false, blackArmory: false, opulence: false }
 *         soundEffects:
 *           type: boolean
 *           example: true
 *         language:
 *           type: string
 *           example: "fr"
 *
 *     RoleDetail:
 *       type: object
 *       properties:
 *         roleId:
 *           type: string
 *           example: "AGENT"
 *         name:
 *           type: string
 *           example: "Agent"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "Membre du protocole"
 *         color:
 *           type: string
 *           example: "#C0C0C0"
 *
 *     AgentProtocol:
 *       type: object
 *       properties:
 *         agentName:
 *           type: string
 *           example: "Shadow-7"
 *         customName:
 *           type: string
 *           nullable: true
 *           example: "Le Vagabond"
 *         bio:
 *           type: string
 *           nullable: true
 *           maxLength: 500
 *           example: "Guardian depuis 2017, passionné par les raids"
 *         species:
 *           type: string
 *           enum: [HUMAN, EXO, AWOKEN]
 *           example: HUMAN
 *         roles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RoleDetail'
 *         clearanceLevel:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *           example: 3
 *         division:
 *           type: string
 *           nullable: true
 *           example: "PROTOCOL"
 *         hasSeenRecruitment:
 *           type: boolean
 *           example: true
 *         protocolJoinedAt:
 *           type: string
 *           format: date-time
 *         settings:
 *           $ref: '#/components/schemas/AgentSettings'
 *
 *     Agent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         bungieId:
 *           type: string
 *           example: "4611686018467431789"
 *         bungieUser:
 *           type: object
 *           properties:
 *             displayName:
 *               type: string
 *               example: "Guardian#1234"
 *             membershipId:
 *               type: string
 *         protocol:
 *           $ref: '#/components/schemas/AgentProtocol'
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /agent/profile:
 *   get:
 *     tags: [Agents]
 *     summary: Obtenir mon profil
 *     description: Retourne le profil complet de l'agent authentifié
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     agent:
 *                       $ref: '#/components/schemas/Agent'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   patch:
 *     tags: [Agents]
 *     summary: Modifier mon profil
 *     description: Modifier les paramètres et préférences de l'agent authentifié
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
 *                     maxLength: 50
 *                     nullable: true
 *                   species:
 *                     type: string
 *                     enum: [HUMAN, EXO, AWOKEN]
 *                   hasSeenRecruitment:
 *                     type: boolean
 *                   settings:
 *                     $ref: '#/components/schemas/AgentSettings'
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /agent/sync-stats:
 *   post:
 *     tags: [Agents]
 *     summary: Synchroniser les statistiques
 *     description: Synchronise les stats de l'agent avec l'API Bungie
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats synchronisées
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /agent/deactivate:
 *   get:
 *     tags: [Agents]
 *     summary: Désactiver mon compte
 *     description: Désactive le compte de l'agent authentifié
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compte désactivé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /founder/agents/deactivated:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir les agents désactivés
 *     description: Récupère la liste de tous les agents désactivés
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des agents désactivés
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agents/statistics:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir les statistiques des agents
 *     description: Récupère les statistiques globales des agents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}:
 *   patch:
 *     tags: [Fondateur]
 *     summary: Modifier un agent
 *     description: Modifier le profil de n'importe quel agent (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: agentId
 *         in: path
 *         required: true
 *         description: ID de l'agent (MongoDB, Bungie ID, ou nom unique)
 *         schema:
 *           type: string
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
 *                   agentName:
 *                     type: string
 *                   customName:
 *                     type: string
 *                     nullable: true
 *                   species:
 *                     type: string
 *                     enum: [HUMAN, EXO, AWOKEN]
 *                   clearanceLevel:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 10
 *     responses:
 *       200:
 *         description: Agent mis à jour
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     tags: [Fondateur]
 *     summary: Supprimer un agent
 *     description: Supprime définitivement un agent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: agentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirm:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Agent supprimé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/repair:
 *   post:
 *     tags: [Fondateur]
 *     summary: Réparer le profil d'un agent
 *     description: Répare/synchronise le profil d'un agent avec Bungie
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: agentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profil réparé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/deactivate:
 *   patch:
 *     tags: [Fondateur]
 *     summary: Désactiver un agent
 *     description: Désactive le compte d'un agent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: agentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Agent désactivé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/reactivate:
 *   patch:
 *     tags: [Fondateur]
 *     summary: Réactiver un agent
 *     description: Réactive un agent désactivé
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: agentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent réactivé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/promote:
 *   post:
 *     tags: [Fondateur]
 *     summary: Promouvoir un agent
 *     description: Ajoute un rôle à un agent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: agentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleId]
 *             properties:
 *               roleId:
 *                 type: string
 *                 example: "ECHO"
 *     responses:
 *       200:
 *         description: Agent promu
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/demote:
 *   post:
 *     tags: [Fondateur]
 *     summary: Rétrograder un agent
 *     description: Retire un rôle à un agent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: agentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleId]
 *             properties:
 *               roleId:
 *                 type: string
 *                 example: "ECHO"
 *     responses:
 *       200:
 *         description: Agent rétrogradé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
