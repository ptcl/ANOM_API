/**
 * @swagger
 * components:
 *   schemas:
 *     Agent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Identifiant unique de l'agent (MongoDB ObjectId)
 *           example: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         bungieId:
 *           type: string
 *           description: Identifiant Bungie unique de l'agent
 *           example: "12345678"
 *         bungieTokens:
 *           type: object
 *           description: Tokens d'authentification Bungie
 *           properties:
 *             accessToken:
 *               type: string
 *               description: Token d'accès Bungie
 *             refreshToken:
 *               type: string
 *               description: Token de rafraîchissement Bungie
 *             expiresAt:
 *               type: string
 *               format: date-time
 *               description: Date d'expiration du token
 *           required:
 *             - accessToken
 *             - refreshToken
 *             - expiresAt
 *         destinyMemberships:
 *           type: array
 *           description: Liste des memberships Destiny de l'agent
 *           items:
 *             type: object
 *             properties:
 *               crossSaveOverride:
 *                 type: number
 *                 description: Override pour le cross-save
 *               applicableMembershipTypes:
 *                 type: array
 *                 description: Types de membership applicables
 *                 items:
 *                   type: number
 *               isPublic:
 *                 type: boolean
 *                 description: Indique si le profil est public
 *               membershipType:
 *                 type: number
 *                 description: Type de membership (1=Xbox, 2=PSN, 3=Steam, etc.)
 *               membershipId:
 *                 type: string
 *                 description: Identifiant du membership
 *               displayName:
 *                 type: string
 *                 description: Nom d'affichage sur la plateforme
 *               bungieGlobalDisplayName:
 *                 type: string
 *                 description: Nom d'affichage global Bungie
 *               bungieGlobalDisplayNameCode:
 *                 type: number
 *                 description: Code du nom d'affichage global Bungie
 *         bungieUser:
 *           type: object
 *           description: Informations détaillées de l'utilisateur Bungie
 *           properties:
 *             membershipId:
 *               type: number
 *               description: Identifiant du membership Bungie
 *             uniqueName:
 *               type: string
 *               description: Nom unique de l'utilisateur
 *             displayName:
 *               type: string
 *               description: Nom d'affichage de l'utilisateur
 *             profilePicture:
 *               type: number
 *               description: Identifiant de l'image de profil
 *             about:
 *               type: string
 *               description: Description "À propos" de l'utilisateur
 *             firstAccess:
 *               type: string
 *               format: date-time
 *               description: Date du premier accès
 *             lastAccess:
 *               type: string
 *               format: date-time
 *               description: Date du dernier accès
 *             psnDisplayName:
 *               type: string
 *               description: Nom d'affichage PlayStation
 *             showActivity:
 *               type: boolean
 *               description: Indique si l'activité est visible
 *             locale:
 *               type: string
 *               description: Localisation de l'utilisateur
 *             localeInheritDefault:
 *               type: boolean
 *               description: Indique si la localisation par défaut est héritée
 *             profilePicturePath:
 *               type: string
 *               description: Chemin vers l'image de profil
 *             profileThemeName:
 *               type: string
 *               description: Nom du thème de profil
 *             steamDisplayName:
 *               type: string
 *               description: Nom d'affichage Steam
 *             twitchDisplayName:
 *               type: string
 *               description: Nom d'affichage Twitch
 *             cachedBungieGlobalDisplayName:
 *               type: string
 *               description: Nom d'affichage global Bungie en cache
 *             cachedBungieGlobalDisplayNameCode:
 *               type: number
 *               description: Code du nom d'affichage global Bungie en cache
 *         protocol:
 *           type: object
 *           description: Informations spécifiques au Protocol
 *           properties:
 *             agentName:
 *               type: string
 *               description: Nom de l'agent dans le Protocol
 *               example: "Agent-001"
 *             customName:
 *               type: string
 *               description: Nom personnalisé de l'agent
 *               example: "Gardien de la Lumière"
 *             species:
 *               type: string
 *               enum: [HUMAN, EXO, AWOKEN]
 *               description: Espèce de l'agent
 *               example: "HUMAN"
 *             roles:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [AGENT, ECHO, ORACLE, ARCHITECT, FOUNDER, EMISSARY]
 *               description: Rôles de l'agent dans le Protocol
 *               default: ["AGENT"]
 *               example: ["AGENT"]
 *             clearanceLevel:
 *               type: number
 *               enum: [1, 2, 3]
 *               description: Niveau d'habilitation de l'agent (1=Basique, 2=Élevé, 3=Maximum)
 *               example: 1
 *             hasSeenRecruitment:
 *               type: boolean
 *               description: Si l'agent a terminé le processus de recrutement
 *               default: false
 *               example: true
 *             protocolJoinedAt:
 *               type: string
 *               format: date-time
 *               description: Date d'intégration au Protocol
 *               example: "2024-01-15T10:30:00Z"
 *             group:
 *               type: string
 *               enum: [PROTOCOL, AURORA, ZENITH]
 *               description: Groupe d'affectation de l'agent
 *               example: "PROTOCOL"
 *             settings:
 *               type: object
 *               description: Paramètres personnels de l'agent
 *               properties:
 *                 notifications:
 *                   type: boolean
 *                   description: Activer les notifications
 *                   default: true
 *                 publicProfile:
 *                   type: boolean
 *                   description: Profil public visible
 *                   default: false
 *                 protocolOSTheme:
 *                   type: string
 *                   enum: [DEFAULT, DARKNESS]
 *                   description: Thème de l'interface Protocol OS
 *                   default: "DEFAULT"
 *                 protocolSounds:
 *                   type: boolean
 *                   description: Activer les sons du Protocol
 *                   default: true
 *           required:
 *             - agentName
 *             - species
 *             - clearanceLevel
 *         contracts:
 *           type: array
 *           description: Contrats assignés à l'agent
 *           items:
 *             type: object
 *             properties:
 *               contractMongoId:
 *                 type: string
 *                 description: Référence MongoDB vers le contrat
 *                 example: "64f5a7b2c8d4e1f2a3b4c5d7"
 *               contractId:
 *                 type: string
 *                 description: Identifiant du contrat
 *                 example: "CONTRACT-001"
 *         challenges:
 *           type: array
 *           description: Défis assignés à l'agent
 *           items:
 *             type: object
 *             properties:
 *               challengeMongoId:
 *                 type: string
 *                 description: Référence MongoDB vers le défi
 *                 example: "64f5a7b2c8d4e1f2a3b4c5d8"
 *               challengeId:
 *                 type: string
 *                 description: Identifiant du défi
 *                 example: "CHALLENGE-001"
 *               title:
 *                 type: string
 *                 description: Titre du défi
 *                 example: "Mission de reconnaissance"
 *               complete:
 *                 type: boolean
 *                 description: Indique si le défi est terminé
 *                 default: false
 *               accessedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Date d'accès au défi
 *               completedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Date de completion du défi
 *               partialCode:
 *                 type: string
 *                 description: Code partiel du défi
 *               unlockedFragments:
 *                 type: array
 *                 description: Fragments débloqués
 *                 items:
 *                   type: string
 *               progress:
 *                 type: object
 *                 description: Progression du défi (format flexible)
 *                 additionalProperties: true
 *         lastActivity:
 *           type: string
 *           format: date-time
 *           description: Date de dernière activité de l'agent
 *           example: "2024-01-20T14:30:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du compte
 *           example: "2024-01-10T09:15:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour du compte
 *           example: "2024-01-20T14:30:00Z"
 *       required:
 *         - bungieId
 *         - bungieTokens
 *         - protocol
 *       example:
 *         _id: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         bungieId: "12345678"
 *         bungieTokens:
 *           accessToken: "eyJhbGciOiJSUzI1NiJ9..."
 *           refreshToken: "refresh_token_here"
 *           expiresAt: "2024-01-21T10:30:00Z"
 *         destinyMemberships:
 *           - membershipType: 3
 *             membershipId: "4611686018467322167"
 *             displayName: "Guardian#1234"
 *             bungieGlobalDisplayName: "Guardian"
 *             bungieGlobalDisplayNameCode: 1234
 *             isPublic: true
 *         bungieUser:
 *           membershipId: 12345678
 *           displayName: "Guardian#1234"
 *           profilePicturePath: "/common/destiny2_content/icons/profile_pic.jpg"
 *         protocol:
 *           agentName: "Agent-001"
 *           customName: "Gardien de la Lumière"
 *           species: "HUMAN"
 *           role: "AGENT"
 *           clearanceLevel: 1
 *           hasSeenRecruitment: true
 *           protocolJoinedAt: "2024-01-15T10:30:00Z"
 *           group: "PROTOCOL"
 *           settings:
 *             notifications: true
 *             publicProfile: false
 *             protocolOSTheme: "DEFAULT"
 *             protocolSounds: true
 *         contracts: []
 *         challenges: []
 *         lastActivity: "2024-01-20T14:30:00Z"
 *         createdAt: "2024-01-10T09:15:00Z"
 *         updatedAt: "2024-01-20T14:30:00Z"
 */