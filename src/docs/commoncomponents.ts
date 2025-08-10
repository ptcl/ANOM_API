/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   responses:
 *     UnauthorizedError:
 *       description: Accès non autorisé - Token manquant ou invalide
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
 *                 example: "Unauthorized"
 *               message:
 *                 type: string
 *                 example: "Authentication required"
 *     ForbiddenError:
 *       description: Accès interdit - Permissions insuffisantes
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
 *                 example: "Forbidden"
 *               message:
 *                 type: string
 *                 example: "Admin privileges required"
 *     NotFoundError:
 *       description: Ressource non trouvée
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
 *                 example: "Not Found"
 *               message:
 *                 type: string
 *                 example: "Resource not found"
 *     ValidationError:
 *       description: Erreur de validation des données
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
 *                 example: "Validation Error"
 *               message:
 *                 type: string
 *                 example: "Invalid data provided"
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                     message:
 *                       type: string
 *     ServerError:
 *       description: Erreur serveur interne
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
 *                 example: "Server Error"
 *               message:
 *                 type: string
 *                 example: "An unexpected error occurred"
 */
