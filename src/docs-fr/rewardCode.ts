/**
 * @swagger
 * /agent/code/redeem:
 *   post:
 *     tags: [Codes Promo]
 *     summary: Utiliser un code
 *     description: Utilise un code promo pour obtenir des badges/emblèmes
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
 *     responses:
 *       200:
 *         description: Code utilisé avec succès
 *       400:
 *         description: Code invalide ou expiré
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /founder/codes:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir tous les codes promo
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Codes récupérés
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/code/generate:
 *   post:
 *     tags: [Fondateur]
 *     summary: Générer un code promo
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
 *                 description: Code personnalisé (généré automatiquement si non fourni)
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
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Code généré
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/code/{codeId}:
 *   delete:
 *     tags: [Fondateur]
 *     summary: Supprimer un code
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
 *         description: Code supprimé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
