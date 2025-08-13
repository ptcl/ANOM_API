/**
 * @swagger
 * components:
 *   schemas:
 *     Contract:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Identifiant unique MongoDB du contrat
 *           example: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         contractId:
 *           type: string
 *           description: Identifiant unique personnalisé du contrat
 *           example: "CONTRACT-EMB-2024-001"
 *         contractDate:
 *           type: string
 *           format: date-time
 *           description: Date de création du contrat
 *           default: "Date actuelle"
 *           example: "2024-01-15T10:30:00Z"
 *         status:
 *           type: string
 *           enum: [pending, validated, cancelled, revoked]
 *           description: Statut du contrat
 *           default: "pending"
 *           example: "validated"
 *         validationDeadline:
 *           type: string
 *           format: date-time
 *           description: Date limite pour la validation du contrat
 *           example: "2024-02-15T23:59:59Z"
 *         isExpired:
 *           type: boolean
 *           description: Indique si le contrat a expiré
 *           default: false
 *           example: false
 *         contributor:
 *           type: object
 *           description: Informations sur le contributeur d'emblèmes
 *           properties:
 *             bungieId:
 *               type: string
 *               description: Identifiant Bungie du contributeur
 *               example: "87654321"
 *             displayName:
 *               type: string
 *               description: Nom d'affichage du contributeur
 *               example: "EmblemProvider#5678"
 *             isAnonymous:
 *               type: boolean
 *               description: Indique si le contributeur souhaite rester anonyme
 *               default: false
 *               example: false
 *           required:
 *             - bungieId
 *             - displayName
 *         emblems:
 *           type: array
 *           description: Liste des emblèmes fournis dans ce contrat
 *           items:
 *             type: object
 *             properties:
 *               emblemId:
 *                 type: string
 *                 description: Identifiant de l'emblème Destiny 2
 *                 default: ""
 *                 example: "1498876634"
 *               name:
 *                 type: string
 *                 description: Nom de l'emblème
 *                 example: "Trials of the Nine"
 *               code:
 *                 type: string
 *                 description: Code d'échange de l'emblème
 *                 example: "ABC-DEF-123"
 *               status:
 *                 type: string
 *                 enum: [available, redeemed, revoked]
 *                 description: Statut du code d'emblème
 *                 default: "available"
 *                 example: "available"
 *               redeemedBy:
 *                 type: string
 *                 description: Référence MongoDB vers l'utilisateur qui a utilisé le code
 *                 example: "64f5a7b2c8d4e1f2a3b4c5d7"
 *               redeemedDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date de récupération du code
 *                 example: "2024-01-20T14:30:00Z"
 *         totalCodes:
 *           type: number
 *           description: Nombre total de codes d'emblèmes dans le contrat
 *           default: 0
 *           example: 25
 *         availableCodes:
 *           type: number
 *           description: Nombre de codes encore disponibles
 *           default: 0
 *           example: 18
 *         revocationRequests:
 *           type: array
 *           description: Demandes de révocation de codes
 *           items:
 *             type: object
 *             properties:
 *               requestDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date de la demande de révocation
 *                 default: "Date actuelle"
 *                 example: "2024-01-25T09:00:00Z"
 *               effectiveDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date effective de la révocation
 *                 example: "2024-01-30T00:00:00Z"
 *               emblemCodes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des codes à révoquer
 *                 example: ["ABC-DEF-123", "GHI-JKL-456"]
 *               isPartial:
 *                 type: boolean
 *                 description: Indique si c'est une révocation partielle
 *                 default: false
 *                 example: true
 *               status:
 *                 type: string
 *                 enum: [pending, processed, cancelled]
 *                 description: Statut de la demande de révocation
 *                 default: "pending"
 *                 example: "pending"
 *         media:
 *           type: array
 *           description: Médias attachés au contrat (preuves, captures d'écran)
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL du média
 *                 example: "https://example.com/proof-screenshot.png"
 *               legend:
 *                 type: string
 *                 description: Légende ou description du média
 *                 example: "Capture d'écran des codes d'emblèmes valides"
 *         signedDocumentPath:
 *           type: string
 *           description: Chemin vers le document signé (contrat légal)
 *           example: "/contracts/signed/CONTRACT-EMB-2024-001.pdf"
 *         isSigned:
 *           type: boolean
 *           description: Indique si le contrat a été signé
 *           default: false
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du contrat (générée automatiquement)
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour du contrat (mise à jour automatique)
 *           example: "2024-01-25T09:15:00Z"
 *       required:
 *         - contractId
 *         - contributor
 *       example:
 *         _id: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         contractId: "CONTRACT-EMB-2024-001"
 *         contractDate: "2024-01-15T10:30:00Z"
 *         status: "validated"
 *         validationDeadline: "2024-02-15T23:59:59Z"
 *         isExpired: false
 *         contributor:
 *           bungieId: "87654321"
 *           displayName: "EmblemProvider#5678"
 *           isAnonymous: false
 *         emblems:
 *           - emblemId: "1498876634"
 *             name: "Trials of the Nine"
 *             code: "ABC-DEF-123"
 *             status: "available"
 *           - emblemId: "1498876634"
 *             name: "Trials of the Nine"
 *             code: "GHI-JKL-456"
 *             status: "redeemed"
 *             redeemedBy: "64f5a7b2c8d4e1f2a3b4c5d7"
 *             redeemedDate: "2024-01-20T14:30:00Z"
 *         totalCodes: 25
 *         availableCodes: 18
 *         revocationRequests: []
 *         media:
 *           - url: "https://example.com/proof-screenshot.png"
 *             legend: "Capture d'écran des codes d'emblèmes valides"
 *         signedDocumentPath: "/contracts/signed/CONTRACT-EMB-2024-001.pdf"
 *         isSigned: true
 *         createdAt: "2024-01-15T10:30:00Z"
 *         updatedAt: "2024-01-25T09:15:00Z"
 *
 *     ContractCreate:
 *       type: object
 *       description: Schéma pour créer un nouveau contrat
 *       properties:
 *         contractId:
 *           type: string
 *           description: Identifiant unique personnalisé du contrat
 *           example: "CONTRACT-EMB-2024-002"
 *         validationDeadline:
 *           type: string
 *           format: date-time
 *           description: Date limite pour la validation du contrat
 *           example: "2024-03-15T23:59:59Z"
 *         contributor:
 *           type: object
 *           properties:
 *             bungieId:
 *               type: string
 *               description: Identifiant Bungie du contributeur
 *               example: "87654321"
 *             displayName:
 *               type: string
 *               description: Nom d'affichage du contributeur
 *               example: "EmblemProvider#5678"
 *             isAnonymous:
 *               type: boolean
 *               description: Contributeur anonyme
 *               default: false
 *               example: false
 *           required:
 *             - bungieId
 *             - displayName
 *         emblems:
 *           type: array
 *           description: Liste des emblèmes à ajouter
 *           items:
 *             type: object
 *             properties:
 *               emblemId:
 *                 type: string
 *                 example: "1498876634"
 *               name:
 *                 type: string
 *                 example: "Trials of the Nine"
 *               code:
 *                 type: string
 *                 example: "ABC-DEF-123"
 *         media:
 *           type: array
 *           description: Médias de preuve
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 example: "https://example.com/proof.png"
 *               legend:
 *                 type: string
 *                 example: "Preuve de possession des codes"
 *       required:
 *         - contractId
 *         - contributor
 *       example:
 *         contractId: "CONTRACT-EMB-2024-002"
 *         validationDeadline: "2024-03-15T23:59:59Z"
 *         contributor:
 *           bungieId: "87654321"
 *           displayName: "EmblemProvider#5678"
 *           isAnonymous: false
 *         emblems:
 *           - emblemId: "1498876634"
 *             name: "Trials of the Nine"
 *             code: "ABC-DEF-123"
 *         media:
 *           - url: "https://example.com/proof.png"
 *             legend: "Preuve de possession des codes"
 *
 *     ContractUpdate:
 *       type: object
 *       description: Schéma pour mettre à jour un contrat existant
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, validated, cancelled, revoked]
 *           description: Nouveau statut du contrat
 *           example: "validated"
 *         validationDeadline:
 *           type: string
 *           format: date-time
 *           description: Nouvelle date limite
 *           example: "2024-04-15T23:59:59Z"
 *         isExpired:
 *           type: boolean
 *           description: Marquer comme expiré
 *           example: true
 *         signedDocumentPath:
 *           type: string
 *           description: Chemin vers le document signé
 *           example: "/contracts/signed/CONTRACT-EMB-2024-001.pdf"
 *         isSigned:
 *           type: boolean
 *           description: Marquer comme signé
 *           example: true
 *       example:
 *         status: "validated"
 *         isSigned: true
 *         signedDocumentPath: "/contracts/signed/CONTRACT-EMB-2024-001.pdf"
 *
 *     EmblemRedemption:
 *       type: object
 *       description: Schéma pour l'échange d'un emblème
 *       properties:
 *         emblemCode:
 *           type: string
 *           description: Code de l'emblème à échanger
 *           example: "ABC-DEF-123"
 *         userId:
 *           type: string
 *           description: ID de l'utilisateur qui échange
 *           example: "64f5a7b2c8d4e1f2a3b4c5d7"
 *       required:
 *         - emblemCode
 *         - userId
 *       example:
 *         emblemCode: "ABC-DEF-123"
 *         userId: "64f5a7b2c8d4e1f2a3b4c5d7"
 *
 *     RevocationRequest:
 *       type: object
 *       description: Schéma pour demander la révocation de codes
 *       properties:
 *         effectiveDate:
 *           type: string
 *           format: date-time
 *           description: Date effective de la révocation
 *           example: "2024-02-01T00:00:00Z"
 *         emblemCodes:
 *           type: array
 *           items:
 *             type: string
 *           description: Codes à révoquer
 *           example: ["ABC-DEF-123", "GHI-JKL-456"]
 *         isPartial:
 *           type: boolean
 *           description: Révocation partielle
 *           default: false
 *           example: true
 *       required:
 *         - emblemCodes
 *       example:
 *         effectiveDate: "2024-02-01T00:00:00Z"
 *         emblemCodes: ["ABC-DEF-123", "GHI-JKL-456"]
 *         isPartial: true
 *
 *     ContractStats:
 *       type: object
 *       description: Statistiques d'un contrat
 *       properties:
 *         contractId:
 *           type: string
 *           example: "CONTRACT-EMB-2024-001"
 *         totalCodes:
 *           type: number
 *           description: Total des codes
 *           example: 25
 *         availableCodes:
 *           type: number
 *           description: Codes disponibles
 *           example: 18
 *         redeemedCodes:
 *           type: number
 *           description: Codes échangés
 *           example: 7
 *         revokedCodes:
 *           type: number
 *           description: Codes révoqués
 *           example: 0
 *         redemptionRate:
 *           type: number
 *           description: Taux d'échange (pourcentage)
 *           example: 28.0
 *       example:
 *         contractId: "CONTRACT-EMB-2024-001"
 *         totalCodes: 25
 *         availableCodes: 18
 *         redeemedCodes: 7
 *         revokedCodes: 0
 *         redemptionRate: 28.0
 *
 *     ContractList:
 *       type: object
 *       description: Réponse pour une liste de contrats avec pagination
 *       properties:
 *         contracts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Contract'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *               example: 1
 *             limit:
 *               type: number
 *               example: 10
 *             total:
 *               type: number
 *               example: 47
 *             pages:
 *               type: number
 *               example: 5
 *         stats:
 *           type: object
 *           description: Statistiques globales
 *           properties:
 *             totalContracts:
 *               type: number
 *               example: 47
 *             activeContracts:
 *               type: number
 *               example: 23
 *             totalEmblems:
 *               type: number
 *               example: 1250
 *             availableEmblems:
 *               type: number
 *               example: 892
 *       example:
 *         contracts:
 *           - _id: "64f5a7b2c8d4e1f2a3b4c5d6"
 *             contractId: "CONTRACT-EMB-2024-001"
 *             status: "validated"
 *             totalCodes: 25
 *             availableCodes: 18
 *         pagination:
 *           page: 1
 *           limit: 10
 *           total: 47
 *           pages: 5
 *         stats:
 *           totalContracts: 47
 *           activeContracts: 23
 *           totalEmblems: 1250
 *           availableEmblems: 892
 */