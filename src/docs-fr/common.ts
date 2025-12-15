/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Message d'erreur"
 *
 *     Success:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Opération réussie"
 *
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 100
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 50
 *         totalPages:
 *           type: integer
 *           example: 2
 *
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items: {}
 *         pagination:
 *           $ref: '#/components/schemas/PaginationMeta'
 *
 *   parameters:
 *     PageParam:
 *       name: page
 *       in: query
 *       description: Numéro de page (commence à 1)
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *
 *     LimitParam:
 *       name: limit
 *       in: query
 *       description: Nombre d'éléments par page
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 50
 *
 *   responses:
 *     Unauthorized:
 *       description: Authentification requise
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             error: "Non autorisé"
 *
 *     Forbidden:
 *       description: Permissions insuffisantes
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             error: "Accès refusé. Rôle FOUNDER requis."
 *
 *     NotFound:
 *       description: Ressource non trouvée
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             error: "Ressource non trouvée"
 *
 *     ValidationError:
 *       description: Erreur de validation
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: "Validation échouée"
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                     message:
 *                       type: string
 *
 *     InternalError:
 *       description: Erreur interne du serveur
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             error: "Erreur interne du serveur"
 */
