/**
 * @swagger
 * components:
 *   schemas:
 *     Division:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         divisionId:
 *           type: string
 *           example: "ALPHA-TEAM"
 *         name:
 *           type: string
 *           example: "Alpha Team"
 *         description:
 *           type: string
 *         icon:
 *           type: string
 *         leaderId:
 *           type: string
 *           nullable: true
 *         memberCount:
 *           type: integer
 *         maxMembers:
 *           type: integer
 *           default: 50
 *         isRecruiting:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     DivisionRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         requesterId:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         rejectedReason:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * /agent/division:
 *   get:
 *     tags: [Divisions]
 *     summary: Get my division
 *     description: Get the division of the authenticated agent
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Division found
 *       404:
 *         description: Agent not in a division
 *
 * /agent/division/request:
 *   post:
 *     tags: [Divisions]
 *     summary: Request division creation
 *     description: Submit a request to create a new division
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
 *                 minLength: 2
 *                 maxLength: 50
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Request submitted
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *
 * /agent/division/requests:
 *   get:
 *     tags: [Divisions]
 *     summary: Get my division requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Requests retrieved
 *
 * /agent/division/request/{requestId}:
 *   delete:
 *     tags: [Divisions]
 *     summary: Cancel division request
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
 *         description: Request cancelled
 *
 * /leader/division/{divisionId}/members:
 *   post:
 *     tags: [Divisions]
 *     summary: Add member to division
 *     description: Add an agent to the division (leader only)
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
 *                 description: Agent ID, Bungie ID, or unique name
 *     responses:
 *       200:
 *         description: Member added
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /leader/division/{divisionId}/members/{identifier}:
 *   delete:
 *     tags: [Divisions]
 *     summary: Remove member from division
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
 *         description: Member removed
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /leader/division/{divisionId}/leave:
 *   post:
 *     tags: [Divisions]
 *     summary: Leader leave division
 *     description: Leader leaves and transfers leadership
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
 *         description: Left division
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/division/requests:
 *   get:
 *     tags: [Founder]
 *     summary: Get all division requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Requests retrieved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/division/request/{requestId}:
 *   get:
 *     tags: [Founder]
 *     summary: Get division request details
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
 *         description: Request found
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /founder/division/request/{requestId}/approve:
 *   post:
 *     tags: [Founder]
 *     summary: Approve division request
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
 *         description: Request approved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/division/request/{requestId}/reject:
 *   post:
 *     tags: [Founder]
 *     summary: Reject division request
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
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Request rejected
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/division:
 *   post:
 *     tags: [Founder]
 *     summary: Create division
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
 *         description: Division created
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/divisions:
 *   get:
 *     tags: [Founder]
 *     summary: Get all divisions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Divisions retrieved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/division/{divisionId}:
 *   get:
 *     tags: [Founder]
 *     summary: Get division by ID
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
 *         description: Division found
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     tags: [Founder]
 *     summary: Update division
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: divisionId
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
 *       200:
 *         description: Division updated
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     tags: [Founder]
 *     summary: Delete division
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
 *         description: Division deleted
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/division/{divisionId}/agents:
 *   get:
 *     tags: [Founder]
 *     summary: Get division members
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
 *         description: Members retrieved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/division/{divisionId}/leader:
 *   put:
 *     tags: [Founder]
 *     summary: Set division leader
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
 *         description: Leader set
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
