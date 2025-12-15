/**
 * @swagger
 * /lores:
 *   get:
 *     tags: [Lore]
 *     summary: Obtenir mes lores débloqués
 *     description: Récupère tous les lores débloqués par l'agent authentifié
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lores récupérés
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /lore/{loreId}:
 *   get:
 *     tags: [Lore]
 *     summary: Lire un lore
 *     description: Lit une entrée de lore spécifique
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
 *         description: Lore trouvé
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /founder/lores:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir tous les lores
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lores récupérés
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/lore:
 *   post:
 *     tags: [Fondateur]
 *     summary: Créer un lore
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
 *       201:
 *         description: Lore créé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/lore/{loreId}:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir un lore par ID
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
 *         description: Lore trouvé
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     tags: [Fondateur]
 *     summary: Modifier un lore
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
 *         description: Lore modifié
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     tags: [Fondateur]
 *     summary: Supprimer un lore
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
 *         description: Lore supprimé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/lore/{loreId}/unlock:
 *   post:
 *     tags: [Fondateur]
 *     summary: Débloquer un lore pour un agent
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
 *                 description: ID agent, Bungie ID, ou nom unique
 *     responses:
 *       200:
 *         description: Lore débloqué
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
