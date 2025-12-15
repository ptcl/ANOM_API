/**
 * @swagger
 * components:
 *   schemas:
 *     Lore:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         loreId:
 *           type: string
 *           example: "LORE-001"
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         category:
 *           type: string
 *         order:
 *           type: integer
 *         isPublic:
 *           type: boolean
 *         unlockedBy:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               agentId:
 *                 type: string
 *               unlockedAt:
 *                 type: string
 *                 format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * /lores:
 *   get:
 *     tags: [Lore]
 *     summary: Get unlocked lores
 *     description: Get all lores unlocked by the authenticated agent
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lores retrieved
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /lore/{loreId}:
 *   get:
 *     tags: [Lore]
 *     summary: Read lore
 *     description: Read a specific lore entry
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: loreId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lore found
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /founder/lores:
 *   get:
 *     tags: [Founder]
 *     summary: Get all lores
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lores retrieved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/lore:
 *   post:
 *     tags: [Founder]
 *     summary: Create lore
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [loreId, title, content]
 *             properties:
 *               loreId:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               content:
 *                 type: string
 *                 minLength: 1
 *               category:
 *                 type: string
 *               order:
 *                 type: integer
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Lore created
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/lore/{loreId}:
 *   get:
 *     tags: [Founder]
 *     summary: Get lore by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: loreId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lore found
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     tags: [Founder]
 *     summary: Update lore
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: loreId
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               order:
 *                 type: integer
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Lore updated
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     tags: [Founder]
 *     summary: Delete lore
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: loreId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lore deleted
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/lore/{loreId}/unlock:
 *   post:
 *     tags: [Founder]
 *     summary: Unlock lore for agent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: loreId
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
 *             required: [identifier]
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Agent ID, Bungie ID, or unique name
 *     responses:
 *       200:
 *         description: Lore unlocked
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
