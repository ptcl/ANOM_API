/**
 * @swagger
 * components:
 *   schemas:
 *     Emblem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Identifiant unique MongoDB de l'emblème
 *           example: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         emblemId:
 *           type: string
 *           description: Identifiant unique de l'emblème Destiny 2 (hash depuis l'API Bungie)
 *           example: "1498876634"
 *         name:
 *           type: string
 *           description: Nom officiel de l'emblème
 *           example: "Trials of the Nine"
 *         description:
 *           type: string
 *           description: Description de l'emblème et comment l'obtenir
 *           example: "Accordé pour avoir atteint le Phare lors des Épreuves des Neuf."
 *         image:
 *           type: string
 *           description: URL de l'image de l'emblème
 *           example: "https://www.bungie.net/common/destiny2_content/icons/28c24e1bb372add8ceac75d6c2ebb5d6.jpg"
 *         code:
 *           type: string
 *           description: Code d'échange de l'emblème (si applicable)
 *           example: "XFV-KHP-N97"
 *         status:
 *           type: string
 *           enum: [available, unavailable]
 *           description: Statut de disponibilité de l'emblème
 *           default: "available"
 *           example: "available"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date d'ajout de l'emblème dans la base (générée automatiquement)
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour de l'emblème (mise à jour automatique)
 *           example: "2024-01-20T14:45:00Z"
 *       required:
 *         - emblemId
 *         - name
 *       example:
 *         _id: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         emblemId: "1498876634"
 *         name: "Trials of the Nine"
 *         description: "Accordé pour avoir atteint le Phare lors des Épreuves des Neuf. Cet emblème rare témoigne de votre excellence dans le Creuset compétitif."
 *         image: "https://www.bungie.net/common/destiny2_content/icons/28c24e1bb372add8ceac75d6c2ebb5d6.jpg"
 *         code: "XFV-KHP-N97"
 *         status: "available"
 *         createdAt: "2024-01-15T10:30:00Z"
 *         updatedAt: "2024-01-20T14:45:00Z"
 *
 *     EmblemCreate:
 *       type: object
 *       description: Schéma pour créer un nouvel emblème
 *       properties:
 *         emblemId:
 *           type: string
 *           description: Identifiant unique de l'emblème Destiny 2
 *           example: "1498876634"
 *         name:
 *           type: string
 *           description: Nom officiel de l'emblème
 *           example: "Trials of the Nine"
 *         description:
 *           type: string
 *           description: Description de l'emblème
 *           example: "Accordé pour avoir atteint le Phare lors des Épreuves des Neuf."
 *         image:
 *           type: string
 *           description: URL de l'image de l'emblème
 *           example: "https://www.bungie.net/common/destiny2_content/icons/28c24e1bb372add8ceac75d6c2ebb5d6.jpg"
 *         code:
 *           type: string
 *           description: Code d'échange (optionnel)
 *           example: "XFV-KHP-N97"
 *         status:
 *           type: string
 *           enum: [available, unavailable]
 *           description: Statut de disponibilité
 *           default: "available"
 *           example: "available"
 *       required:
 *         - emblemId
 *         - name
 *       example:
 *         emblemId: "1498876634"
 *         name: "Trials of the Nine"
 *         description: "Accordé pour avoir atteint le Phare lors des Épreuves des Neuf."
 *         image: "https://www.bungie.net/common/destiny2_content/icons/28c24e1bb372add8ceac75d6c2ebb5d6.jpg"
 *         code: "XFV-KHP-N97"
 *         status: "available"
 *
 *     EmblemUpdate:
 *       type: object
 *       description: Schéma pour mettre à jour un emblème existant
 *       properties:
 *         name:
 *           type: string
 *           description: Nouveau nom de l'emblème
 *           example: "Trials of the Nine (Legacy)"
 *         description:
 *           type: string
 *           description: Nouvelle description
 *           example: "Emblème hérité des Épreuves des Neuf, plus disponible."
 *         image:
 *           type: string
 *           description: Nouvelle URL d'image
 *           example: "https://www.bungie.net/common/destiny2_content/icons/new_image.jpg"
 *         code:
 *           type: string
 *           description: Nouveau code d'échange
 *           example: "ABC-DEF-123"
 *         status:
 *           type: string
 *           enum: [available, unavailable]
 *           description: Nouveau statut
 *           example: "unavailable"
 *       example:
 *         name: "Trials of the Nine (Legacy)"
 *         description: "Emblème hérité des Épreuves des Neuf, plus disponible."
 *         status: "unavailable"
 *
 *     EmblemSummary:
 *       type: object
 *       description: Version résumée d'un emblème pour les listes
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         emblemId:
 *           type: string
 *           example: "1498876634"
 *         name:
 *           type: string
 *           example: "Trials of the Nine"
 *         image:
 *           type: string
 *           example: "https://www.bungie.net/common/destiny2_content/icons/28c24e1bb372add8ceac75d6c2ebb5d6.jpg"
 *         status:
 *           type: string
 *           enum: [available, unavailable]
 *           example: "available"
 *         hasCode:
 *           type: boolean
 *           description: Indique si l'emblème a un code d'échange
 *           example: true
 *       example:
 *         _id: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         emblemId: "1498876634"
 *         name: "Trials of the Nine"
 *         image: "https://www.bungie.net/common/destiny2_content/icons/28c24e1bb372add8ceac75d6c2ebb5d6.jpg"
 *         status: "available"
 *         hasCode: true
 *
 *     EmblemList:
 *       type: object
 *       description: Réponse pour une liste d'emblèmes avec pagination et filtres
 *       properties:
 *         emblems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EmblemSummary'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *               description: Page actuelle
 *               example: 1
 *             limit:
 *               type: number
 *               description: Nombre d'éléments par page
 *               example: 20
 *             total:
 *               type: number
 *               description: Nombre total d'emblèmes
 *               example: 145
 *             pages:
 *               type: number
 *               description: Nombre total de pages
 *               example: 8
 *         filters:
 *           type: object
 *           description: Filtres appliqués
 *           properties:
 *             status:
 *               type: string
 *               enum: [all, available, unavailable]
 *               example: "available"
 *             hasCode:
 *               type: boolean
 *               description: Filtrer par présence de code
 *               example: true
 *             search:
 *               type: string
 *               description: Recherche textuelle
 *               example: "trials"
 *         stats:
 *           type: object
 *           description: Statistiques globales
 *           properties:
 *             totalEmblems:
 *               type: number
 *               description: Nombre total d'emblèmes
 *               example: 145
 *             availableEmblems:
 *               type: number
 *               description: Emblèmes disponibles
 *               example: 98
 *             emblemsWithCodes:
 *               type: number
 *               description: Emblèmes avec codes d'échange
 *               example: 67
 *             recentlyAdded:
 *               type: number
 *               description: Emblèmes ajoutés cette semaine
 *               example: 3
 *       example:
 *         emblems:
 *           - _id: "64f5a7b2c8d4e1f2a3b4c5d6"
 *             emblemId: "1498876634"
 *             name: "Trials of the Nine"
 *             image: "https://www.bungie.net/common/destiny2_content/icons/28c24e1bb372add8ceac75d6c2ebb5d6.jpg"
 *             status: "available"
 *             hasCode: true
 *           - _id: "64f5a7b2c8d4e1f2a3b4c5d7"
 *             emblemId: "1498876635"
 *             name: "Flawless Trials"
 *             image: "https://www.bungie.net/common/destiny2_content/icons/another_emblem.jpg"
 *             status: "available"
 *             hasCode: false
 *         pagination:
 *           page: 1
 *           limit: 20
 *           total: 145
 *           pages: 8
 *         filters:
 *           status: "available"
 *           hasCode: true
 *           search: "trials"
 *         stats:
 *           totalEmblems: 145
 *           availableEmblems: 98
 *           emblemsWithCodes: 67
 *           recentlyAdded: 3
 *
 *     EmblemStats:
 *       type: object
 *       description: Statistiques détaillées sur les emblèmes
 *       properties:
 *         totalEmblems:
 *           type: number
 *           description: Nombre total d'emblèmes dans la base
 *           example: 145
 *         availableEmblems:
 *           type: number
 *           description: Nombre d'emblèmes disponibles
 *           example: 98
 *         unavailableEmblems:
 *           type: number
 *           description: Nombre d'emblèmes indisponibles
 *           example: 47
 *         emblemsWithCodes:
 *           type: number
 *           description: Emblèmes ayant un code d'échange
 *           example: 67
 *         emblemsWithoutCodes:
 *           type: number
 *           description: Emblèmes sans code d'échange
 *           example: 78
 *         recentlyAdded:
 *           type: object
 *           description: Emblèmes ajoutés récemment
 *           properties:
 *             today:
 *               type: number
 *               example: 0
 *             thisWeek:
 *               type: number
 *               example: 3
 *             thisMonth:
 *               type: number
 *               example: 12
 *         recentlyUpdated:
 *           type: object
 *           description: Emblèmes mis à jour récemment
 *           properties:
 *             today:
 *               type: number
 *               example: 2
 *             thisWeek:
 *               type: number
 *               example: 8
 *             thisMonth:
 *               type: number
 *               example: 25
 *       example:
 *         totalEmblems: 145
 *         availableEmblems: 98
 *         unavailableEmblems: 47
 *         emblemsWithCodes: 67
 *         emblemsWithoutCodes: 78
 *         recentlyAdded:
 *           today: 0
 *           thisWeek: 3
 *           thisMonth: 12
 *         recentlyUpdated:
 *           today: 2
 *           thisWeek: 8
 *           thisMonth: 25
 *
 *     EmblemSearch:
 *       type: object
 *       description: Paramètres de recherche d'emblèmes
 *       properties:
 *         query:
 *           type: string
 *           description: Terme de recherche (nom ou description)
 *           example: "trials"
 *         status:
 *           type: string
 *           enum: [all, available, unavailable]
 *           description: Filtrer par statut
 *           default: "all"
 *           example: "available"
 *         hasCode:
 *           type: boolean
 *           description: Filtrer par présence de code d'échange
 *           example: true
 *         sortBy:
 *           type: string
 *           enum: [name, createdAt, updatedAt, emblemId]
 *           description: Champ de tri
 *           default: "name"
 *           example: "name"
 *         sortOrder:
 *           type: string
 *           enum: [asc, desc]
 *           description: Ordre de tri
 *           default: "asc"
 *           example: "asc"
 *         page:
 *           type: number
 *           description: Numéro de page
 *           minimum: 1
 *           default: 1
 *           example: 1
 *         limit:
 *           type: number
 *           description: Nombre d'éléments par page
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *           example: 20
 *       example:
 *         query: "trials"
 *         status: "available"
 *         hasCode: true
 *         sortBy: "name"
 *         sortOrder: "asc"
 *         page: 1
 *         limit: 20
 */