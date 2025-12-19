/**
 * @swagger
 * components:
 *   schemas:
 *     RewardCode:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         code:
 *           type: string
 *           example: "REWARDABC123"
 *         type:
 *           type: string
 *           enum: [SINGLE, MULTI, UNLIMITED]
 *         rewards:
 *           type: object
 *           properties:
 *             badges:
 *               type: array
 *               items:
 *                 type: string
 *             emblems:
 *               type: array
 *               items:
 *                 type: string
 *         maxRedemptions:
 *           type: integer
 *           nullable: true
 *         redemptionCount:
 *           type: integer
 *         redeemedBy:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               agentId:
 *                 type: string
 *               redeemedAt:
 *                 type: string
 *                 format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * /agent/reward-code/redeem:
 *   post:
 *     tags: [Reward Codes]
 *     summary: Redeem a code
 *     description: Redeem a reward code for badges/emblems
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *     responses:
 *       200:
 *         description: Code redeemed successfully
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
 *                     rewards:
 *                       type: object
 *       400:
 *         description: Invalid or expired code
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /founder/codes:
 *   get:
 *     tags: [Founder]
 *     summary: Get all reward codes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [SINGLE, MULTI, UNLIMITED]
 *       - name: isActive
 *         in: query
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Codes retrieved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/code/generate:
 *   post:
 *     tags: [Founder]
 *     summary: Generate reward code
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               code:
 *                 type: string
 *                 description: Custom code (auto-generated if not provided)
 *               type:
 *                 type: string
 *                 enum: [SINGLE, MULTI, UNLIMITED]
 *               rewards:
 *                 type: object
 *                 properties:
 *                   badges:
 *                     type: array
 *                     items:
 *                       type: string
 *                   emblems:
 *                     type: array
 *                     items:
 *                       type: string
 *               maxRedemptions:
 *                 type: integer
 *                 minimum: 1
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Code generated
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/code/{codeId}:
 *   delete:
 *     tags: [Founder]
 *     summary: Delete reward code
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: codeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Code deleted
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
