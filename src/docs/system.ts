/**
 * @swagger
 * /status:
 *   get:
 *     tags: [System]
 *     summary: Get API status
 *     description: Returns the current status of the API
 *     responses:
 *       200:
 *         description: API is online
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
 *                       example: "online"
 *                     version:
 *                       type: string
 *                       example: "3.0.0"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *
 * /sync-all:
 *   post:
 *     tags: [System]
 *     summary: Sync all agents
 *     description: Trigger a full sync of all agent data with Bungie API
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sync started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Sync started"
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
