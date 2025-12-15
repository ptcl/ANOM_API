/**
 * @swagger
 * /status:
 *   get:
 *     tags: [Système]
 *     summary: Statut de l'API
 *     description: Retourne le statut actuel de l'API
 *     responses:
 *       200:
 *         description: API en ligne
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
 *                       example: "en ligne"
 *                     version:
 *                       type: string
 *                       example: "3.0.0"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *
 * /sync-all:
 *   post:
 *     tags: [Système]
 *     summary: Synchroniser tous les agents
 *     description: Déclenche une synchronisation complète de toutes les données agents avec l'API Bungie
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Synchronisation démarrée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Synchronisation démarrée"
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
