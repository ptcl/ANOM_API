/**
 * @swagger
 * components:
 *   schemas:
 *     TimelineNode:
 *       type: object
 *       properties:
 *         nodeId:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         choices:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               choiceId:
 *                 type: string
 *               label:
 *                 type: string
 *               nextNodeId:
 *                 type: string
 *
 *     Timeline:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         timelineId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [DRAFT, ACTIVE, COMPLETED, ARCHIVED]
 *         isPublic:
 *           type: boolean
 *         startNodeId:
 *           type: string
 *         nodes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TimelineNode'
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * /timelines/available:
 *   get:
 *     tags: [Timelines]
 *     summary: Get available timelines
 *     description: Get all public and active timelines
 *     responses:
 *       200:
 *         description: Timelines retrieved
 *
 * /agent/timeline/{timelineId}:
 *   get:
 *     tags: [Timelines]
 *     summary: Get timeline by ID
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
 *         description: Timeline found
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /agent/timeline/interact:
 *   post:
 *     tags: [Timelines]
 *     summary: Interact with timeline
 *     description: Make a choice in a timeline
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
 *         description: Choice made
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *
 * /agent/timeline/home:
 *   post:
 *     tags: [Timelines]
 *     summary: Go to home
 *     description: Reset timeline to start
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reset to home
 *
 * /agent/timeline/back:
 *   post:
 *     tags: [Timelines]
 *     summary: Go back
 *     description: Go back in timeline
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
 *         description: Went back
 *
 * /founder/timelines:
 *   get:
 *     tags: [Founder]
 *     summary: Get all timelines
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Timelines retrieved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/timeline:
 *   post:
 *     tags: [Founder]
 *     summary: Create timeline
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
 *               startNodeId:
 *                 type: string
 *               nodes:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TimelineNode'
 *     responses:
 *       201:
 *         description: Timeline created
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/timeline/{timelineId}:
 *   get:
 *     tags: [Founder]
 *     summary: Get timeline by ID (admin)
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
 *         description: Timeline found
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     tags: [Founder]
 *     summary: Update timeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: timelineId
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
 *               isPublic:
 *                 type: boolean
 *               nodes:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TimelineNode'
 *     responses:
 *       200:
 *         description: Timeline updated
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     tags: [Founder]
 *     summary: Delete timeline
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
 *         description: Timeline deleted
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
