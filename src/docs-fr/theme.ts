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
 *           description: Indique si ce thème est actuellement actif pour l'agent authentifié
 *           example: true
 *
 * /themes:
 *   get:
 *     tags: [Thèmes]
 *     summary: Récupérer tous les thèmes disponibles
 *     description: Retourne tous les thèmes système avec le thème actif marqué pour l'agent authentifié
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thèmes récupérés avec succès
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
