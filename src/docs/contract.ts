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
 *           example: "Weekly Raid Challenge"
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
 *     CreateContract:
 *       type: object
 *       required: [title, type]
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description:
 *           type: string
 *           maxLength: 500
 *         type:
 *           type: string
 *           enum: [MISSION, WEEKLY, DAILY, CHALLENGE, SPECIAL]
 *         emblemReward:
 *           type: string
 *
 * /agent/contracts:
 *   get:
 *     tags: [Contracts]
 *     summary: Get my contracts
 *     description: Retrieve all contracts for the authenticated agent
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contracts retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contract'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /agent/contract:
 *   post:
 *     tags: [Contracts]
 *     summary: Create contract
 *     description: Create a new contract for the authenticated agent
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateContract'
 *     responses:
 *       201:
 *         description: Contract created
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /agent/contract/{contractId}:
 *   get:
 *     tags: [Contracts]
 *     summary: Get contract by ID
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
 *         description: Contract found
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     tags: [Contracts]
 *     summary: Update contract
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
 *         description: Contract updated
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *
 *   delete:
 *     tags: [Contracts]
 *     summary: Delete contract
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
 *         description: Contract deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /founder/contracts:
 *   get:
 *     tags: [Founder]
 *     summary: Get all contracts
 *     description: Retrieve all contracts across all agents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Contracts retrieved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/contracts:
 *   get:
 *     tags: [Founder]
 *     summary: Get agent's contracts
 *     description: Retrieve all contracts for a specific agent
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
 *         description: Contracts retrieved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/contract/{contractId}/validate:
 *   post:
 *     tags: [Founder]
 *     summary: Validate contract
 *     description: Fully validate a completed contract
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
 *         description: Contract validated
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/contract/{contractId}/validate-partial:
 *   post:
 *     tags: [Founder]
 *     summary: Partially validate contract
 *     description: Validate contract without emblem reward
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
 *         description: Contract partially validated
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/contract/{contractId}/revoke:
 *   post:
 *     tags: [Founder]
 *     summary: Revoke contract
 *     description: Revoke a validated contract
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
 *         description: Contract revoked
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/contract/{contractId}/unrevoke:
 *   post:
 *     tags: [Founder]
 *     summary: Unrevoke contract
 *     description: Restore a revoked contract
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
 *         description: Contract unrevoked
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/contracts/cleanup:
 *   post:
 *     tags: [Founder]
 *     summary: Cleanup expired emblems
 *     description: Remove expired emblem rewards from contracts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup completed
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
