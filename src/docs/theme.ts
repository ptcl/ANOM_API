/**
 * @swagger
 * components:
 *   schemas:
 *     Theme:
 *       type: object
 *       properties:
 *         themeId:
 *           type: string
 *           example: "protocol"
 *         name:
 *           type: string
 *           example: "Protocol"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "theme.protocol.description"
 *         primary:
 *           type: string
 *           example: "#626FDA"
 *         secondary:
 *           type: string
 *           example: "#1a1a2e"
 *         accent:
 *           type: string
 *           example: "#00d4ff"
 *         isDefault:
 *           type: boolean
 *           example: true
 *         isActive:
 *           type: boolean
 *           description: Whether this theme is currently active for the authenticated agent
 *           example: true
 *
 * /themes:
 *   get:
 *     tags: [Themes]
 *     summary: Get all available themes
 *     description: Returns all system themes with the active theme marked for the authenticated agent
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Themes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Theme'
 *                 count:
 *                   type: integer
 *                   example: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
