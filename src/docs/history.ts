/**
 * @swagger
 * components:
 *   schemas:
 *     HistoryEntry:
 *       type: object
 *       properties:
 *         action:
 *           type: string
 *           enum: [PROFILE_UPDATE, THEME_CHANGE, SETTINGS_UPDATE, SYNC_STATS, BADGE_EARNED, BADGE_REMOVED, LORE_UNLOCKED, LORE_READ, TIMELINE_STARTED, TIMELINE_COMPLETED, FRAGMENT_COLLECTED, CONTRACT_CREATED, CONTRACT_VALIDATED, CONTRACT_CANCELLED, DIVISION_JOINED, DIVISION_LEFT, DIVISION_PROMOTED, ROLE_ADDED, ROLE_REMOVED, ACCOUNT_DEACTIVATED, ACCOUNT_REACTIVATED]
 *           example: "THEME_CHANGE"
 *         targetId:
 *           type: string
 *           nullable: true
 *           example: "BLACK_ARMORY"
 *         timestamp:
 *           type: string
 *           format: date-time
 *         success:
 *           type: boolean
 *           example: true
 *         meta:
 *           type: object
 *           additionalProperties: true
 *           example: { "fields": ["protocol.bio"] }
 *
 * /agent/history:
 *   get:
 *     tags: [Agents]
 *     summary: Get my history
 *     description: Returns the authenticated agent's action history (max 200 entries, paginated). Admin actions are hidden.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *       - name: skip
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: History retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/HistoryEntry'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     skip:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /founder/agent/{agentId}/history:
 *   get:
 *     tags: [Founder]
 *     summary: Get agent history (admin)
 *     description: Returns full action history for any agent, including admin actions.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: agentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 200
 *       - name: skip
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: History retrieved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
