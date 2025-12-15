/**
 * @swagger
 * /timelines/available:
 *   get:
 *     tags: [Timelines]
 *     summary: Obtenir les timelines disponibles
 *     description: Récupère toutes les timelines publiques et actives
 *     responses:
 *       200:
 *         description: Timelines récupérées
 *
 * /agent/timeline/{timelineId}:
 *   get:
 *     tags: [Timelines]
 *     summary: Obtenir une timeline par ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: timelineId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timeline trouvée
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /agent/timeline/interact:
 *   post:
 *     tags: [Timelines]
 *     summary: Interagir avec une timeline
 *     description: Faire un choix dans une timeline
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [timelineId, choiceId]
 *             properties:
 *               timelineId:
 *                 type: string
 *               choiceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Choix effectué
 *
 * /agent/timeline/home:
 *   post:
 *     tags: [Timelines]
 *     summary: Retourner à l'accueil
 *     description: Réinitialise la timeline au début
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retour à l'accueil
 *
 * /agent/timeline/back:
 *   post:
 *     tags: [Timelines]
 *     summary: Revenir en arrière
 *     description: Revient en arrière dans la timeline
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [timelineId]
 *             properties:
 *               timelineId:
 *                 type: string
 *               steps:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *     responses:
 *       200:
 *         description: Retour effectué
 *
 * /founder/timelines:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir toutes les timelines
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Timelines récupérées
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/timeline:
 *   post:
 *     tags: [Fondateur]
 *     summary: Créer une timeline
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [timelineId, title]
 *             properties:
 *               timelineId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, COMPLETED, ARCHIVED]
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Timeline créée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/timeline/{timelineId}:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir une timeline par ID (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: timelineId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timeline trouvée
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     tags: [Fondateur]
 *     summary: Modifier une timeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: timelineId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timeline modifiée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     tags: [Fondateur]
 *     summary: Supprimer une timeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: timelineId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timeline supprimée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
