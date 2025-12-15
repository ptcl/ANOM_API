/**
 * @swagger
 * components:
 *   schemas:
 *     Announcement:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         type:
 *           type: string
 *           enum: [INFO, WARNING, ALERT, UPDATE]
 *         isActive:
 *           type: boolean
 *         isPinned:
 *           type: boolean
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         readBy:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * /announcements:
 *   get:
 *     tags: [Announcements]
 *     summary: Get all active announcements
 *     description: Get all public, active announcements
 *     responses:
 *       200:
 *         description: Announcements retrieved
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
 *                     $ref: '#/components/schemas/Announcement'
 *
 * /announcement/{id}/read:
 *   post:
 *     tags: [Announcements]
 *     summary: Mark announcement as read
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
 *         description: Marked as read
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /founder/announcements:
 *   get:
 *     tags: [Founder]
 *     summary: Get all announcements
 *     description: Get all announcements including inactive ones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Announcements retrieved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/announcement:
 *   post:
 *     tags: [Founder]
 *     summary: Create announcement
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
 *                 minLength: 1
 *                 maxLength: 200
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 5000
 *               type:
 *                 type: string
 *                 enum: [INFO, WARNING, ALERT, UPDATE]
 *                 default: INFO
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               isPinned:
 *                 type: boolean
 *                 default: false
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Announcement created
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/announcement/{id}:
 *   patch:
 *     tags: [Founder]
 *     summary: Update announcement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
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
 *       200:
 *         description: Announcement updated
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     tags: [Founder]
 *     summary: Delete announcement
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
 *         description: Announcement deleted
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
