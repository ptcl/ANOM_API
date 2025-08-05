/**
 * @swagger
 * components:
 *   parameters:
 *     PaginationLimit:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         default: 20
 *         minimum: 1
 *         maximum: 100
 *       description: Nombre maximum d'éléments à retourner
 *     PaginationPage:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         default: 1
 *         minimum: 1
 *       description: Numéro de page pour la pagination
 *     AgentId:
 *       in: path
 *       name: agentId
 *       schema:
 *         type: string
 *       required: true
 *       description: ID de l'agent
 *     MembershipType:
 *       in: path
 *       name: membershipType
 *       schema:
 *         type: string
 *       required: true
 *       description: Type de membership Bungie
 *     MembershipId:
 *       in: path
 *       name: membershipId
 *       schema:
 *         type: string
 *       required: true
 *       description: ID de membership Bungie
 *     AnnouncementId:
 *       in: path
 *       name: announcementId
 *       schema:
 *         type: string
 *       required: true
 *       description: ID de l'annonce
 *     StartDate:
 *       in: query
 *       name: startDate
 *       schema:
 *         type: string
 *         format: date-time
 *       description: Date de début pour le filtrage
 *     EndDate:
 *       in: query
 *       name: endDate
 *       schema:
 *         type: string
 *         format: date-time
 *       description: Date de fin pour le filtrage
 */
