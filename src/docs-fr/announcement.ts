/**
 * @swagger
 * /announcements:
 *   get:
 *     tags: [Annonces]
 *     summary: Obtenir toutes les annonces actives
 *     description: Récupère toutes les annonces publiques et actives
 *     responses:
 *       200:
 *         description: Annonces récupérées
 *
 * /announcement/{id}/read:
 *   post:
 *     tags: [Annonces]
 *     summary: Marquer une annonce comme lue
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Marquée comme lue
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /founder/announcements:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir toutes les annonces
 *     description: Récupère toutes les annonces, y compris inactives
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Annonces récupérées
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/announcement:
 *   post:
 *     tags: [Fondateur]
 *     summary: Créer une annonce
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [INFO, WARNING, ALERT, UPDATE]
 *               isActive:
 *                 type: boolean
 *               isPinned:
 *                 type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Annonce créée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/announcement/{id}:
 *   patch:
 *     tags: [Fondateur]
 *     summary: Modifier une annonce
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Annonce modifiée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     tags: [Fondateur]
 *     summary: Supprimer une annonce
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Annonce supprimée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
