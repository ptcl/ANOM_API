/**
 * @swagger
 * /emblems:
 *   get:
 *     tags: [Emblèmes]
 *     summary: Obtenir tous les emblèmes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Emblèmes récupérés
 *
 * /emblem/{emblemId}:
 *   get:
 *     tags: [Emblèmes]
 *     summary: Obtenir un emblème par ID
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
 *         description: Emblème trouvé
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /founder/emblem:
 *   post:
 *     tags: [Fondateur]
 *     summary: Créer un emblème
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
 *       201:
 *         description: Emblème créé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/emblems:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir tous les emblèmes (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Emblèmes récupérés
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/emblem/{emblemId}:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir un emblème par ID (admin)
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
 *         description: Emblème trouvé
 *
 *   patch:
 *     tags: [Fondateur]
 *     summary: Modifier un emblème
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
 *         description: Emblème modifié
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     tags: [Fondateur]
 *     summary: Supprimer un emblème
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
 *         description: Emblème supprimé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
