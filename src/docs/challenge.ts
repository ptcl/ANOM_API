/**
 * @swagger
 * components:
 *   schemas:
 *     Challenge:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Identifiant unique MongoDB du défi
 *           example: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         challengeId:
 *           type: string
 *           description: Identifiant unique personnalisé du défi
 *           example: "CHALLENGE-CIPHER-001"
 *         title:
 *           type: string
 *           description: Titre du défi
 *           example: "Décryptage des Archives Vex"
 *         description:
 *           type: string
 *           description: Description détaillée du défi
 *           example: "Un ancien code Vex a été découvert dans les archives. Les agents doivent collaborer pour décrypter ce message crucial."
 *         targetCode:
 *           type: string
 *           description: Code cible à reconstituer
 *           example: "VEX-ARC-042"
 *         codeFormat:
 *           type: string
 *           description: Format du code à reconstituer
 *           default: "AAA-BBB-CCC"
 *           example: "VEX-ARC-XXX"
 *         isSharedChallenge:
 *           type: boolean
 *           description: Indique si c'est un défi collaboratif entre agents
 *           default: false
 *           example: true
 *         finalCode:
 *           type: object
 *           description: Structure du code final avec fragments
 *           properties:
 *             AAA:
 *               type: object
 *               properties:
 *                 A1:
 *                   type: string
 *                   description: Premier fragment du segment A
 *                 A2:
 *                   type: string
 *                   description: Deuxième fragment du segment A
 *                 A3:
 *                   type: string
 *                   description: Troisième fragment du segment A
 *             BBB:
 *               type: object
 *               properties:
 *                 B1:
 *                   type: string
 *                   description: Premier fragment du segment B
 *                 B2:
 *                   type: string
 *                   description: Deuxième fragment du segment B
 *                 B3:
 *                   type: string
 *                   description: Troisième fragment du segment B
 *             CCC:
 *               type: object
 *               properties:
 *                 C1:
 *                   type: string
 *                   description: Premier fragment du segment C
 *                 C2:
 *                   type: string
 *                   description: Deuxième fragment du segment C
 *                 C3:
 *                   type: string
 *                   description: Troisième fragment du segment C
 *           default:
 *             AAA: { A1: "", A2: "", A3: "" }
 *             BBB: { B1: "", B2: "", B3: "" }
 *             CCC: { C1: "", C2: "", C3: "" }
 *           example:
 *             VEX: { V1: "V", V2: "E", V3: "X" }
 *             ARC: { A1: "A", A2: "R", A3: "C" }
 *             XXX: { X1: "0", X2: "4", X3: "2" }
 *         challenges:
 *           type: array
 *           description: Liste des étapes/défis individuels
 *           items:
 *             type: object
 *             properties:
 *               fragmentId:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Identifiants des fragments débloqués par ce défi
 *                 example: ["V1", "A1"]
 *               challengeType:
 *                 type: string
 *                 description: Type du défi (puzzle, code, énigme, etc.)
 *                 example: "CIPHER_PUZZLE"
 *               groups:
 *                 type: array
 *                 description: Groupes d'instructions pour le défi
 *                 items:
 *                   type: object
 *                   properties:
 *                     accessCode:
 *                       type: string
 *                       description: Code d'accès pour ce groupe d'instructions
 *                       example: "ALPHA-7"
 *                     promptLines:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Lignes d'instructions/indices pour le défi
 *                       example: ["Analysez la séquence temporelle", "Cherchez les anomalies dans le pattern", "Le premier fragment est caché dans la répétition"]
 *                   required:
 *                     - accessCode
 *                     - promptLines
 *               expectedOutput:
 *                 type: string
 *                 description: Sortie attendue pour valider le défi
 *                 example: "TEMPORAL_SEQUENCE_V"
 *               hintLines:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Indices supplémentaires si l'agent est bloqué
 *                 example: ["Regardez les timestamps", "La clé est dans la fréquence"]
 *               rewardId:
 *                 type: string
 *                 description: Identifiant de la récompense obtenue
 *                 example: "REWARD-VEX-FRAGMENT-V1"
 *               isActive:
 *                 type: boolean
 *                 description: Indique si ce défi est actuellement actif
 *                 default: true
 *                 example: true
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: Date de création du défi
 *                 example: "2024-01-15T10:30:00Z"
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Date de dernière mise à jour du défi
 *                 example: "2024-01-15T14:20:00Z"
 *             required:
 *               - challengeType
 *               - groups
 *               - expectedOutput
 *               - rewardId
 *         isComplete:
 *           type: boolean
 *           description: Indique si le défi principal est terminé
 *           default: false
 *           example: false
 *         AgentProgress:
 *           type: array
 *           description: Progression individuelle des agents sur ce défi
 *           items:
 *             type: object
 *             properties:
 *               agentId:
 *                 type: string
 *                 description: Référence MongoDB vers l'agent
 *                 example: "64f5a7b2c8d4e1f2a3b4c5d7"
 *               bungieId:
 *                 type: string
 *                 description: Identifiant Bungie de l'agent
 *                 example: "12345678"
 *               displayName:
 *                 type: string
 *                 description: Nom d'affichage de l'agent
 *                 example: "Guardian#1234"
 *               unlockedFragments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des fragments débloqués par cet agent
 *                 example: ["V1", "A1", "X1"]
 *               currentProgress:
 *                 type: string
 *                 description: Progression actuelle de l'agent (format libre)
 *                 example: "2/3 fragments débloqués - En cours: défi CIPHER_PUZZLE"
 *               complete:
 *                 type: boolean
 *                 description: Indique si l'agent a terminé ce défi
 *                 default: false
 *                 example: false
 *               lastUpdated:
 *                 type: string
 *                 format: date-time
 *                 description: Date de dernière mise à jour de la progression
 *                 example: "2024-01-20T16:45:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du défi (générée automatiquement)
 *           example: "2024-01-10T09:15:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour du défi (mise à jour automatique)
 *           example: "2024-01-20T16:45:00Z"
 *       required:
 *         - challengeId
 *         - title
 *         - targetCode
 *       example:
 *         _id: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         challengeId: "CHALLENGE-CIPHER-001"
 *         title: "Décryptage des Archives Vex"
 *         description: "Un ancien code Vex a été découvert dans les archives. Les agents doivent collaborer pour décrypter ce message crucial."
 *         targetCode: "VEX-ARC-042"
 *         codeFormat: "VEX-ARC-XXX"
 *         isSharedChallenge: true
 *         finalCode:
 *           VEX: { V1: "V", V2: "E", V3: "X" }
 *           ARC: { A1: "A", A2: "R", A3: "C" }
 *           XXX: { X1: "", X2: "", X3: "" }
 *         challenges:
 *           - fragmentId: ["V1", "A1"]
 *             challengeType: "CIPHER_PUZZLE"
 *             groups:
 *               - accessCode: "ALPHA-7"
 *                 promptLines:
 *                   - "Analysez la séquence temporelle des données Vex"
 *                   - "Cherchez les anomalies dans le pattern de transmission"
 *                   - "Le premier fragment est caché dans la répétition"
 *             expectedOutput: "TEMPORAL_SEQUENCE_V"
 *             hintLines:
 *               - "Regardez les timestamps des transmissions"
 *               - "La clé est dans la fréquence de répétition"
 *             rewardId: "REWARD-VEX-FRAGMENT-V1"
 *             isActive: true
 *             createdAt: "2024-01-15T10:30:00Z"
 *             updatedAt: "2024-01-15T14:20:00Z"
 *         isComplete: false
 *         AgentProgress:
 *           - agentId: "64f5a7b2c8d4e1f2a3b4c5d7"
 *             bungieId: "12345678"
 *             displayName: "Guardian#1234"
 *             unlockedFragments: ["V1", "A1"]
 *             currentProgress: "2/9 fragments débloqués - En cours: défi CIPHER_PUZZLE"
 *             complete: false
 *             lastUpdated: "2024-01-20T16:45:00Z"
 *         createdAt: "2024-01-10T09:15:00Z"
 *         updatedAt: "2024-01-20T16:45:00Z"
 *
 *     ChallengeCreate:
 *       type: object
 *       description: Schéma pour créer un nouveau défi
 *       properties:
 *         challengeId:
 *           type: string
 *           description: Identifiant unique personnalisé du défi
 *           example: "CHALLENGE-CIPHER-002"
 *         title:
 *           type: string
 *           description: Titre du défi
 *           example: "Énigme des Fragments Cabal"
 *         description:
 *           type: string
 *           description: Description détaillée du défi
 *           example: "Décryptez les codes militaires Cabal interceptés."
 *         targetCode:
 *           type: string
 *           description: Code cible à reconstituer
 *           example: "CAB-MIL-789"
 *         codeFormat:
 *           type: string
 *           description: Format du code à reconstituer
 *           default: "AAA-BBB-CCC"
 *           example: "CAB-MIL-XXX"
 *         isSharedChallenge:
 *           type: boolean
 *           description: Indique si c'est un défi collaboratif
 *           default: false
 *           example: false
 *         challenges:
 *           type: array
 *           description: Liste des étapes/défis individuels
 *           items:
 *             type: object
 *             properties:
 *               fragmentId:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["C1", "M1"]
 *               challengeType:
 *                 type: string
 *                 example: "TACTICAL_ANALYSIS"
 *               groups:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     accessCode:
 *                       type: string
 *                       example: "BETA-9"
 *                     promptLines:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Analysez les formations Cabal", "Identifiez le pattern tactique"]
 *               expectedOutput:
 *                 type: string
 *                 example: "PHALANX_FORMATION"
 *               hintLines:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Observez la disposition des troupes"]
 *               rewardId:
 *                 type: string
 *                 example: "REWARD-CABAL-FRAGMENT-C1"
 *       required:
 *         - challengeId
 *         - title
 *         - targetCode
 *       example:
 *         challengeId: "CHALLENGE-CIPHER-002"
 *         title: "Énigme des Fragments Cabal"
 *         description: "Décryptez les codes militaires Cabal interceptés."
 *         targetCode: "CAB-MIL-789"
 *         codeFormat: "CAB-MIL-XXX"
 *         isSharedChallenge: false
 *
 *     ChallengeProgress:
 *       type: object
 *       description: Progression d'un agent sur un défi
 *       properties:
 *         agentId:
 *           type: string
 *           description: Identifiant de l'agent
 *           example: "64f5a7b2c8d4e1f2a3b4c5d7"
 *         unlockedFragments:
 *           type: array
 *           items:
 *             type: string
 *           description: Fragments débloqués
 *           example: ["V1", "A1", "X1"]
 *         currentProgress:
 *           type: string
 *           description: Description de la progression actuelle
 *           example: "3/9 fragments débloqués"
 *         complete:
 *           type: boolean
 *           description: Statut de completion
 *           example: false
 *       example:
 *         agentId: "64f5a7b2c8d4e1f2a3b4c5d7"
 *         unlockedFragments: ["V1", "A1", "X1"]
 *         currentProgress: "3/9 fragments débloqués - Prochaine étape: CIPHER_PUZZLE"
 *         complete: false
 *
 *     ChallengeList:
 *       type: object
 *       description: Réponse pour une liste de défis avec pagination
 *       properties:
 *         challenges:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Challenge'
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
 *               example: 15
 *             pages:
 *               type: number
 *               example: 2
 *       example:
 *         challenges:
 *           - _id: "64f5a7b2c8d4e1f2a3b4c5d6"
 *             challengeId: "CHALLENGE-CIPHER-001"
 *             title: "Décryptage des Archives Vex"
 *             targetCode: "VEX-ARC-042"
 *             isComplete: false
 *         pagination:
 *           page: 1
 *           limit: 10
 *           total: 15
 *           pages: 2
 */