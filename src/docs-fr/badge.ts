/**
 * @swagger
 * components:
 *   schemas:
 *     Badge:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         badgeId:
 *           type: string
 *           example: "BADGE-001"
 *         name:
 *           type: string
 *           example: "Champion du Raid"
 *         description:
 *           type: string
 *         icon:
 *           type: string
 *           format: uri
 *         rarity:
 *           type: string
 *           enum: [COMMON, UNCOMMON, RARE, LEGENDARY, EXOTIC]
 *           example: LEGENDARY
 *         obtainable:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * /badges:
 *   get:
 *     tags: [Badges]
 *     summary: Obtenir tous les badges
 *     description: Récupère tous les badges disponibles
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - name: rarity
 *         in: query
 *         description: Filtrer par rareté
 *         schema:
 *           type: string
 *           enum: [COMMON, UNCOMMON, RARE, LEGENDARY, EXOTIC]
 *       - name: obtainable
 *         in: query
 *         description: Filtrer par disponibilité
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Badges récupérés
 *
 * /badge/stats:
 *   get:
 *     tags: [Badges]
 *     summary: Statistiques des badges
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 *
 * /badge/{badgeId}:
 *   get:
 *     tags: [Badges]
 *     summary: Obtenir un badge par ID
 *     parameters:
 *       - name: badgeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Badge trouvé
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /founder/badge:
 *   post:
 *     tags: [Fondateur]
 *     summary: Créer un badge
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               rarity:
 *                 type: string
 *                 enum: [COMMON, UNCOMMON, RARE, LEGENDARY, EXOTIC]
 *               obtainable:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Badge créé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/badge/{badgeId}:
 *   put:
 *     tags: [Fondateur]
 *     summary: Modifier un badge
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: badgeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Badge modifié
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     tags: [Fondateur]
 *     summary: Supprimer un badge
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: badgeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Badge supprimé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/badge/{badgeId}/gift:
 *   post:
 *     tags: [Fondateur]
 *     summary: Offrir un badge à des agents
 *     description: Offre un badge à plusieurs agents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: badgeId
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
 *             required: [agentIds]
 *             properties:
 *               agentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Badge offert
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/badge/{badgeId}/revoke:
 *   post:
 *     tags: [Fondateur]
 *     summary: Retirer un badge
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: badgeId
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
 *             required: [agentIds]
 *             properties:
 *               agentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Badge retiré
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/badges/gift:
 *   post:
 *     tags: [Fondateur]
 *     summary: Offrir des badges à un agent
 *     description: Offre plusieurs badges à un seul agent
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
 *             required: [badgeIds]
 *             properties:
 *               badgeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Badges offerts
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/badges/revoke:
 *   post:
 *     tags: [Fondateur]
 *     summary: Retirer des badges à un agent
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
 *             required: [badgeIds]
 *             properties:
 *               badgeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Badges retirés
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
