/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         roleId:
 *           type: string
 *           example: "ECHO"
 *         name:
 *           type: string
 *           example: "Echo"
 *         description:
 *           type: string
 *         color:
 *           type: string
 *           example: "#3498db"
 *         icon:
 *           type: string
 *         order:
 *           type: integer
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *         isDefault:
 *           type: boolean
 *         assignable:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     RoleAssignment:
 *       type: object
 *       properties:
 *         bungieId:
 *           type: string
 *         roleId:
 *           type: string
 *         note:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * /founder/role:
 *   post:
 *     tags: [Roles]
 *     summary: Create role
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
 *                 minLength: 1
 *                 maxLength: 50
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               description:
 *                 type: string
 *                 maxLength: 200
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
 *         description: Role created
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/roles:
 *   get:
 *     tags: [Roles]
 *     summary: Get all roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/roles/reorder:
 *   put:
 *     tags: [Roles]
 *     summary: Reorder roles
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
 *         description: Roles reordered
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/role/{roleId}:
 *   get:
 *     tags: [Roles]
 *     summary: Get role by ID
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
 *         description: Role found
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     tags: [Roles]
 *     summary: Update role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roleId
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
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               assignable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Role updated
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     tags: [Roles]
 *     summary: Delete role
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
 *         description: Role deleted
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/role/{roleId}/agents:
 *   get:
 *     tags: [Roles]
 *     summary: Get agents with role
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
 *         description: Agents retrieved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/roles/assignments:
 *   get:
 *     tags: [Roles]
 *     summary: Get all role pre-assignments
 *     description: Get pending role assignments for users not yet registered
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assignments retrieved
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/roles/assignment:
 *   post:
 *     tags: [Roles]
 *     summary: Create role pre-assignment
 *     description: Pre-assign a role to a Bungie ID before they register
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
 *                 maxLength: 200
 *     responses:
 *       201:
 *         description: Assignment created
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /founder/roles/assignment/{bungieId}:
 *   delete:
 *     tags: [Roles]
 *     summary: Delete role pre-assignment
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
 *         description: Assignment deleted
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
