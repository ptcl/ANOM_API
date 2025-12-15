/**
 * @swagger
 * components:
 *   schemas:
 *     Emblem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         emblemId:
 *           type: string
 *           example: "EMB-RAID-001"
 *         name:
 *           type: string
 *           example: "Raid Master"
 *         description:
 *           type: string
 *         iconUrl:
 *           type: string
 *           format: uri
 *         rarity:
 *           type: string
 *           enum: [COMMON, UNCOMMON, RARE, LEGENDARY, EXOTIC]
 *         obtainable:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * /emblems:
 *   get:
 *     tags: [Emblems]
 *     summary: Get all emblems
 *     security:
 *       - bearerAuth: []
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
 *         description: Emblems retrieved
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /emblem/{emblemId}:
 *   get:
 *     tags: [Emblems]
 *     summary: Get emblem by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: emblemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Emblem found
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /founder/emblem:
 *   post:
 *     tags: [Founder]
 *     summary: Create emblem
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
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               iconUrl:
 *                 type: string
 *                 format: uri
 *               rarity:
 *                 type: string
 *                 enum: [COMMON, UNCOMMON, RARE, LEGENDARY, EXOTIC]
 *               obtainable:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Emblem created
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/emblems:
 *   get:
 *     tags: [Founder]
 *     summary: Get all emblems (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Emblems retrieved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/emblem/{emblemId}:
 *   get:
 *     tags: [Founder]
 *     summary: Get emblem by ID (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: emblemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Emblem found
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     tags: [Founder]
 *     summary: Update emblem
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: emblemId
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               iconUrl:
 *                 type: string
 *               rarity:
 *                 type: string
 *                 enum: [COMMON, UNCOMMON, RARE, LEGENDARY, EXOTIC]
 *               obtainable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Emblem updated
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     tags: [Founder]
 *     summary: Delete emblem
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: emblemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Emblem deleted
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
