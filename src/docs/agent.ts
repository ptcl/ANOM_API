/**
 * @swagger
 * components:
 *   schemas:
 *     ActiveTheme:
 *       type: object
 *       properties:
 *         themeId:
 *           type: string
 *           example: "protocol"
 *         name:
 *           type: string
 *           example: "Protocol"
 *         primary:
 *           type: string
 *           example: "#626FDA"
 *         secondary:
 *           type: string
 *           example: "#1a1a2e"
 *         accent:
 *           type: string
 *           example: "#00d4ff"
 *
 *     AgentSettings:
 *       type: object
 *       properties:
 *         notifications:
 *           type: boolean
 *           example: true
 *         publicProfile:
 *           type: boolean
 *           example: true
 *         activeTheme:
 *           $ref: '#/components/schemas/ActiveTheme'
 *         soundEffects:
 *           type: boolean
 *           example: true
 *         language:
 *           type: string
 *           example: "fr"
 *
 *     RoleDetail:
 *       type: object
 *       properties:
 *         roleId:
 *           type: string
 *           example: "AGENT"
 *         name:
 *           type: string
 *           example: "Agent"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "Protocol member"
 *         color:
 *           type: string
 *           example: "#C0C0C0"
 *
 *     DivisionDetail:
 *       type: object
 *       properties:
 *         divisionId:
 *           type: string
 *           example: "PROTOCOL"
 *         name:
 *           type: string
 *           example: "Protocol"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "Main division"
 *         color:
 *           type: string
 *           example: "#626FDA"
 *         icon:
 *           type: string
 *           example: "shield"
 *
 *     AgentProtocol:
 *       type: object
 *       properties:
 *         agentName:
 *           type: string
 *           example: "Shadow-7"
 *         customName:
 *           type: string
 *           nullable: true
 *           example: "The Wanderer"
 *         bio:
 *           type: string
 *           nullable: true
 *           maxLength: 500
 *           example: "Guardian since 2017, passionate about raids"
 *         species:
 *           type: string
 *           enum: [HUMAN, EXO, AWOKEN]
 *           example: HUMAN
 *         roles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RoleDetail'
 *         clearanceLevel:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *           example: 3
 *         division:
 *           $ref: '#/components/schemas/DivisionDetail'
 *         hasSeenRecruitment:
 *           type: boolean
 *           example: true
 *         protocolJoinedAt:
 *           type: string
 *           format: date-time
 *         settings:
 *           $ref: '#/components/schemas/AgentSettings'
 *
 *     Agent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         bungieId:
 *           type: string
 *           example: "4611686018467431789"
 *         bungieUser:
 *           type: object
 *           properties:
 *             displayName:
 *               type: string
 *               example: "Guardian#1234"
 *             membershipId:
 *               type: string
 *         protocol:
 *           $ref: '#/components/schemas/AgentProtocol'
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /agent/profile:
 *   get:
 *     tags: [Agents]
 *     summary: Get current agent profile
 *     description: Returns the authenticated agent's full profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agent profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     agent:
 *                       $ref: '#/components/schemas/Agent'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   patch:
 *     tags: [Agents]
 *     summary: Update current agent profile
 *     description: Update settings and preferences for the authenticated agent
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               protocol:
 *                 type: object
 *                 properties:
 *                   customName:
 *                     type: string
 *                     maxLength: 50
 *                     nullable: true
 *                   species:
 *                     type: string
 *                     enum: [HUMAN, EXO, AWOKEN]
 *                   hasSeenRecruitment:
 *                     type: boolean
 *                   settings:
 *                     $ref: '#/components/schemas/AgentSettings'
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /agent/sync-stats:
 *   post:
 *     tags: [Agents]
 *     summary: Sync agent statistics
 *     description: Synchronize agent stats with Bungie API
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats synchronized
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /agent/deactivate:
 *   get:
 *     tags: [Agents]
 *     summary: Deactivate own account
 *     description: Deactivate the authenticated agent's account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deactivated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /founder/agents/deactivated:
 *   get:
 *     tags: [Founder]
 *     summary: Get all deactivated agents
 *     description: Retrieve list of all deactivated agents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deactivated agents list
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agents/statistics:
 *   get:
 *     tags: [Founder]
 *     summary: Get agent statistics
 *     description: Retrieve global agent statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}:
 *   patch:
 *     tags: [Founder]
 *     summary: Update agent
 *     description: Update any agent's profile (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: agentId
 *         in: path
 *         required: true
 *         description: Agent ID (MongoDB, Bungie ID, or unique name)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               protocol:
 *                 type: object
 *                 properties:
 *                   agentName:
 *                     type: string
 *                   customName:
 *                     type: string
 *                     nullable: true
 *                   species:
 *                     type: string
 *                     enum: [HUMAN, EXO, AWOKEN]
 *                   clearanceLevel:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 10
 *     responses:
 *       200:
 *         description: Agent updated
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     tags: [Founder]
 *     summary: Delete agent
 *     description: Permanently delete an agent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: agentId
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
 *               confirm:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Agent deleted
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/repair:
 *   post:
 *     tags: [Founder]
 *     summary: Repair agent profile
 *     description: Repair/sync agent profile with Bungie
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
 *         description: Profile repaired
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/deactivate:
 *   patch:
 *     tags: [Founder]
 *     summary: Deactivate agent
 *     description: Deactivate an agent's account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: agentId
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
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Agent deactivated
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/reactivate:
 *   patch:
 *     tags: [Founder]
 *     summary: Reactivate agent
 *     description: Reactivate a deactivated agent
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
 *         description: Agent reactivated
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/promote:
 *   post:
 *     tags: [Founder]
 *     summary: Promote agent
 *     description: Add a role to an agent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: agentId
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
 *             required: [roleId]
 *             properties:
 *               roleId:
 *                 type: string
 *                 example: "ECHO"
 *     responses:
 *       200:
 *         description: Agent promoted
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/agent/{agentId}/demote:
 *   post:
 *     tags: [Founder]
 *     summary: Demote agent
 *     description: Remove a role from an agent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: agentId
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
 *             required: [roleId]
 *             properties:
 *               roleId:
 *                 type: string
 *                 example: "ECHO"
 *     responses:
 *       200:
 *         description: Agent demoted
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
