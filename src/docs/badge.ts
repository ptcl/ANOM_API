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
 *           example: "Raid Champion"
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
 *         linkedTier:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         linkedTimeline:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     CreateBadge:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description:
 *           type: string
 *           maxLength: 500
 *         icon:
 *           type: string
 *           format: uri
 *         rarity:
 *           type: string
 *           enum: [COMMON, UNCOMMON, RARE, LEGENDARY, EXOTIC]
 *           default: COMMON
 *         obtainable:
 *           type: boolean
 *           default: true
 *         linkedTier:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         linkedTimeline:
 *           type: string
 *
 * /badges:
 *   get:
 *     tags: [Badges]
 *     summary: Get all badges
 *     description: Retrieve all available badges
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - name: rarity
 *         in: query
 *         schema:
 *           type: string
 *           enum: [COMMON, UNCOMMON, RARE, LEGENDARY, EXOTIC]
 *       - name: obtainable
 *         in: query
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Badges retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *
 * /badge/stats:
 *   get:
 *     tags: [Badges]
 *     summary: Get badge statistics
 *     responses:
 *       200:
 *         description: Statistics retrieved
 *
 * /badge/{badgeId}:
 *   get:
 *     tags: [Badges]
 *     summary: Get badge by ID
 *     parameters:
 *       - name: badgeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Badge found
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /founder/badge:
 *   post:
 *     tags: [Founder]
 *     summary: Create badge
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBadge'
 *     responses:
 *       201:
 *         description: Badge created
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/badge/{badgeId}:
 *   put:
 *     tags: [Founder]
 *     summary: Update badge
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: badgeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBadge'
 *     responses:
 *       200:
 *         description: Badge updated
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     tags: [Founder]
 *     summary: Delete badge
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
 *         description: Badge deleted
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/badge/{badgeId}/gift:
 *   post:
 *     tags: [Founder]
 *     summary: Gift badge to agents
 *     description: Gift a badge to multiple agents
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
 *                 minItems: 1
 *                 maxItems: 100
 *     responses:
 *       200:
 *         description: Badge gifted
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/badge/{badgeId}/revoke:
 *   post:
 *     tags: [Founder]
 *     summary: Revoke badge from agents
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
 *         description: Badge revoked
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/badges/gift:
 *   post:
 *     tags: [Founder]
 *     summary: Gift badges to agent
 *     description: Gift multiple badges to a single agent
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
 *                 minItems: 1
 *                 maxItems: 50
 *     responses:
 *       200:
 *         description: Badges gifted
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/badges/revoke:
 *   post:
 *     tags: [Founder]
 *     summary: Revoke badges from agent
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
 *         description: Badges revoked
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
