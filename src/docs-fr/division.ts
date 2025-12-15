/**
 * @swagger
 * /agent/division:
 *   get:
 *     tags: [Divisions]
 *     summary: Obtenir ma division
 *     description: Récupère la division de l'agent authentifié
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Division trouvée
 *       404:
 *         description: Agent pas dans une division
 *
 * /agent/division/request:
 *   post:
 *     tags: [Divisions]
 *     summary: Demander la création d'une division
 *     description: Soumet une demande de création de division
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
 *     responses:
 *       201:
 *         description: Demande soumise
 *
 * /agent/division/requests:
 *   get:
 *     tags: [Divisions]
 *     summary: Obtenir mes demandes de division
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Demandes récupérées
 *
 * /agent/division/request/{requestId}:
 *   delete:
 *     tags: [Divisions]
 *     summary: Annuler une demande
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Demande annulée
 *
 * /leader/division/{divisionId}/members:
 *   post:
 *     tags: [Divisions]
 *     summary: Ajouter un membre
 *     description: Ajoute un agent à la division (chef uniquement)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: divisionId
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
 *         description: Membre ajouté
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /leader/division/{divisionId}/members/{identifier}:
 *   delete:
 *     tags: [Divisions]
 *     summary: Retirer un membre
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: divisionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: identifier
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Membre retiré
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /leader/division/{divisionId}/leave:
 *   post:
 *     tags: [Divisions]
 *     summary: Chef quitte la division
 *     description: Le chef quitte et transfère le leadership
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: divisionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Division quittée
 *
 * /founder/division/requests:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir toutes les demandes de division
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Demandes récupérées
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/division/request/{requestId}/approve:
 *   post:
 *     tags: [Fondateur]
 *     summary: Approuver une demande
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Demande approuvée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/division/request/{requestId}/reject:
 *   post:
 *     tags: [Fondateur]
 *     summary: Rejeter une demande
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Demande rejetée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/division:
 *   post:
 *     tags: [Fondateur]
 *     summary: Créer une division
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
 *               icon:
 *                 type: string
 *               maxMembers:
 *                 type: integer
 *               isRecruiting:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Division créée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/divisions:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir toutes les divisions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Divisions récupérées
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/division/{divisionId}:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir une division par ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: divisionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Division trouvée
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     tags: [Fondateur]
 *     summary: Modifier une division
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: divisionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Division modifiée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     tags: [Fondateur]
 *     summary: Supprimer une division
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: divisionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Division supprimée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/division/{divisionId}/agents:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir les membres d'une division
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: divisionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Membres récupérés
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/division/{divisionId}/leader:
 *   put:
 *     tags: [Fondateur]
 *     summary: Définir le chef de division
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: divisionId
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
 *             required: [leaderId]
 *             properties:
 *               leaderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chef défini
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
