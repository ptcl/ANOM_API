/**
 * @swagger
 * /founder/role:
 *   post:
 *     tags: [Rôles]
 *     summary: Créer un rôle
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleId, name]
 *             properties:
 *               roleId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *               icon:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               assignable:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Rôle créé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/roles:
 *   get:
 *     tags: [Rôles]
 *     summary: Obtenir tous les rôles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rôles récupérés
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/roles/reorder:
 *   put:
 *     tags: [Rôles]
 *     summary: Réorganiser les rôles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleIds]
 *             properties:
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Rôles réorganisés
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/role/{roleId}:
 *   get:
 *     tags: [Rôles]
 *     summary: Obtenir un rôle par ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roleId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rôle trouvé
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     tags: [Rôles]
 *     summary: Modifier un rôle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roleId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rôle modifié
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     tags: [Rôles]
 *     summary: Supprimer un rôle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roleId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rôle supprimé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/role/{roleId}/agents:
 *   get:
 *     tags: [Rôles]
 *     summary: Obtenir les agents avec ce rôle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roleId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agents récupérés
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/roles/assignments:
 *   get:
 *     tags: [Rôles]
 *     summary: Obtenir les pré-attributions de rôles
 *     description: Récupère les attributions en attente pour les utilisateurs non inscrits
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attributions récupérées
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/roles/assignment:
 *   post:
 *     tags: [Rôles]
 *     summary: Créer une pré-attribution
 *     description: Pré-attribue un rôle à un Bungie ID avant son inscription
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bungieId, roleId]
 *             properties:
 *               bungieId:
 *                 type: string
 *               roleId:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Attribution créée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/roles/assignment/{bungieId}:
 *   delete:
 *     tags: [Rôles]
 *     summary: Supprimer une pré-attribution
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: bungieId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attribution supprimée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
