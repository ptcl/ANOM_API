/**
 * @swagger
 * components:
 *   schemas:
 *     Contract:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         contractId:
 *           type: string
 *           example: "CTR-2024-001"
 *         agentId:
 *           type: string
 *         title:
 *           type: string
 *           example: "Défi Raid Hebdomadaire"
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [MISSION, WEEKLY, DAILY, CHALLENGE, SPECIAL]
 *         status:
 *           type: string
 *           enum: [PENDING, ACTIVE, COMPLETED, VALIDATED, REVOKED]
 *         emblemReward:
 *           type: string
 *           nullable: true
 *         hasEmblemReward:
 *           type: boolean
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         validatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * /agent/contracts:
 *   get:
 *     tags: [Contrats]
 *     summary: Obtenir mes contrats
 *     description: Récupère tous les contrats de l'agent authentifié
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contrats récupérés
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /agent/contract:
 *   post:
 *     tags: [Contrats]
 *     summary: Créer un contrat
 *     description: Crée un nouveau contrat pour l'agent authentifié
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, type]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [MISSION, WEEKLY, DAILY, CHALLENGE, SPECIAL]
 *               emblemReward:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contrat créé
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *
 * /agent/contract/{contractId}:
 *   get:
 *     tags: [Contrats]
 *     summary: Obtenir un contrat par ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: contractId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contrat trouvé
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     tags: [Contrats]
 *     summary: Modifier un contrat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: contractId
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, ACTIVE, COMPLETED]
 *     responses:
 *       200:
 *         description: Contrat modifié
 *
 *   delete:
 *     tags: [Contrats]
 *     summary: Supprimer un contrat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: contractId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contrat supprimé
 *
 * /founder/contracts:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir tous les contrats
 *     description: Récupère tous les contrats de tous les agents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contrats récupérés
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/contracts:
 *   get:
 *     tags: [Fondateur]
 *     summary: Obtenir les contrats d'un agent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: agentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contrats récupérés
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/contract/{contractId}/validate:
 *   post:
 *     tags: [Fondateur]
 *     summary: Valider un contrat
 *     description: Valide entièrement un contrat complété
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: contractId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contrat validé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/contract/{contractId}/validate-partial:
 *   post:
 *     tags: [Fondateur]
 *     summary: Valider partiellement un contrat
 *     description: Valide un contrat sans la récompense emblème
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: contractId
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
 *         description: Contrat partiellement validé
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/contract/{contractId}/revoke:
 *   post:
 *     tags: [Fondateur]
 *     summary: Révoquer un contrat
 *     description: Révoque un contrat validé
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: contractId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contrat révoqué
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/contract/{contractId}/unrevoke:
 *   post:
 *     tags: [Fondateur]
 *     summary: Annuler la révocation
 *     description: Restaure un contrat révoqué
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: contractId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Révocation annulée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/contracts/cleanup:
 *   post:
 *     tags: [Fondateur]
 *     summary: Nettoyer les emblèmes expirés
 *     description: Supprime les récompenses emblèmes expirées
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nettoyage effectué
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
