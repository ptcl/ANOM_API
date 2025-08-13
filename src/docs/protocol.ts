/**
 * @swagger
 * tags:
 *   - name: System
 *     description: Statut et informations système du Protocol
 *   - name: Agents
 *     description: Gestion des agents du Protocol
 *   - name: Contracts
 *     description: Gestion des contrats d'emblèmes
 *   - name: Challenges
 *     description: Système de défis et énigmes
 *   - name: Announcements
 *     description: Gestion des annonces
 *   - name: Emblems
 *     description: Gestion des emblèmes Destiny 2
 *   - name: Administration
 *     description: Fonctions réservées aux administrateurs (FOUNDER)
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   responses:
 *     StandardError:
 *       description: Erreur standard du Protocol
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
 *                 example: "Message d'erreur"
 *               code:
 *                 type: string
 *                 example: "ERROR_CODE"
 *     Unauthorized:
 *       description: Non authentifié - Token JWT requis
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
 *                 example: "Token d'authentification requis"
 *     Forbidden:
 *       description: Accès refusé - Privilèges insuffisants
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
 *                 example: "Privilèges administrateur requis"
 *     NotFound:
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
 *                 example: "Ressource non trouvée"
 */

/**
 * @swagger
 * /protocol/status:
 *   get:
 *     summary: Récupère le statut actuel du Protocol
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Statut du Protocol récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "operational"
 *                     activeAgents:
 *                       type: number
 *                       example: 42
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-05T12:00:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Protocol status retrieved successfully"
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/agents:
 *   get:
 *     summary: Récupère la liste de tous les agents
 *     tags: [Agents]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Nombre maximum d'agents à retourner
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Numéro de page pour la pagination
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [AGENT, SPECIALIST, FOUNDER]
 *         description: Filtrer par rôle d'agent
 *       - in: query
 *         name: group
 *         schema:
 *           type: string
 *           enum: [PROTOCOL, AURORA, ZENITH]
 *         description: Filtrer par groupe d'affectation
 *       - in: query
 *         name: species
 *         schema:
 *           type: string
 *           enum: [HUMAN, EXO, AWOKEN]
 *         description: Filtrer par espèce
 *     responses:
 *       200:
 *         description: Liste des agents récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     agents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Agent'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 42
 *                         page:
 *                           type: number
 *                           example: 1
 *                         limit:
 *                           type: number
 *                           example: 20
 *                         pages:
 *                           type: number
 *                           example: 3
 *                 message:
 *                   type: string
 *                   example: "Agents retrieved successfully"
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/agents/{membershipType}/{membershipId}:
 *   get:
 *     summary: Récupère un agent par son type et ID de membership Bungie
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: membershipType
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["1", "2", "3", "4", "5"]
 *         description: Type de membership Bungie (1=Xbox, 2=PSN, 3=Steam, 4=Blizzard, 5=Stadia)
 *         example: "3"
 *       - in: path
 *         name: membershipId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de membership Bungie
 *         example: "4611686018467322167"
 *     responses:
 *       200:
 *         description: Agent récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 *   patch:
 *     summary: Met à jour un agent par son type et ID de membership Bungie
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: membershipType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type de membership Bungie
 *       - in: path
 *         name: membershipId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de membership Bungie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               protocol:
 *                 type: object
 *                 properties:
 *                   customName:
 *                     type: string
 *                     example: "Gardien de la Lumière"
 *                   group:
 *                     type: string
 *                     enum: [PROTOCOL, AURORA, ZENITH]
 *                     example: "AURORA"
 *                   settings:
 *                     type: object
 *                     properties:
 *                       notifications:
 *                         type: boolean
 *                       publicProfile:
 *                         type: boolean
 *                       protocolOSTheme:
 *                         type: string
 *                         enum: [DEFAULT, DARKNESS]
 *                       protocolSounds:
 *                         type: boolean
 *     responses:
 *       200:
 *         description: Agent mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/agent/profile:
 *   get:
 *     summary: Récupère le profil de l'agent authentifié
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 *   patch:
 *     summary: Met à jour le profil de l'agent authentifié
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               protocol:
 *                 type: object
 *                 properties:
 *                   customName:
 *                     type: string
 *                     example: "Gardien de l'Aube"
 *                   settings:
 *                     type: object
 *                     properties:
 *                       notifications:
 *                         type: boolean
 *                         example: true
 *                       publicProfile:
 *                         type: boolean
 *                         example: false
 *                       protocolOSTheme:
 *                         type: string
 *                         enum: [DEFAULT, DARKNESS]
 *                         example: "DARKNESS"
 *                       protocolSounds:
 *                         type: boolean
 *                         example: true
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/agent/contracts:
 *   get:
 *     summary: Récupère tous les contrats de l'agent authentifié
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, validated, cancelled, revoked]
 *         description: Filtrer par statut de contrat
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre de contrats par page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *     responses:
 *       200:
 *         description: Contrats récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContractList'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/agent/contract/{contractId}:
 *   get:
 *     summary: Récupère un contrat spécifique de l'agent
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du contrat
 *         example: "CONTRACT-EMB-2024-001"
 *     responses:
 *       200:
 *         description: Contrat récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Contract'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/agent/contract:
 *   post:
 *     summary: Crée un nouveau contrat d'emblèmes
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContractCreate'
 *     responses:
 *       201:
 *         description: Contrat créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Contract'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Données de contrat invalides"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/agent/contract/{contractId}:
 *   patch:
 *     summary: Met à jour un contrat existant
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du contrat à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContractUpdate'
 *     responses:
 *       200:
 *         description: Contrat mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Contract'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 *   delete:
 *     summary: Supprime un contrat
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du contrat à supprimer
 *     responses:
 *       200:
 *         description: Contrat supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contrat supprimé avec succès"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/agent/challenge/access:
 *   post:
 *     summary: Accède à un défi avec un code d'accès
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessCode
 *             properties:
 *               accessCode:
 *                 type: string
 *                 description: Code d'accès au défi
 *                 example: "ALPHA-7"
 *     responses:
 *       200:
 *         description: Accès au défi accordé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     challengeId:
 *                       type: string
 *                       example: "CHALLENGE-CIPHER-001"
 *                     promptLines:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Analysez la séquence temporelle", "Cherchez les anomalies"]
 *                     hintLines:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Regardez les timestamps"]
 *       400:
 *         description: Code d'accès invalide
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Défi non trouvé
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/agent/challenge/submit:
 *   post:
 *     summary: Soumet une réponse à un défi
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - challengeId
 *               - answer
 *             properties:
 *               challengeId:
 *                 type: string
 *                 description: ID du défi
 *                 example: "CHALLENGE-CIPHER-001"
 *               answer:
 *                 type: string
 *                 description: Réponse proposée
 *                 example: "TEMPORAL_SEQUENCE_V"
 *     responses:
 *       200:
 *         description: Réponse soumise et évaluée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     correct:
 *                       type: boolean
 *                       example: true
 *                     unlockedFragments:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["V1", "A1"]
 *                     rewardId:
 *                       type: string
 *                       example: "REWARD-VEX-FRAGMENT-V1"
 *                     message:
 *                       type: string
 *                       example: "Fragments débloqués avec succès!"
 *       400:
 *         description: Réponse incorrecte ou défi non accessible
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Défi non trouvé
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/agent/challenge/progress:
 *   get:
 *     summary: Récupère la progression globale des défis de l'agent
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progression récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalChallenges:
 *                       type: number
 *                       example: 5
 *                     completedChallenges:
 *                       type: number
 *                       example: 2
 *                     totalFragments:
 *                       type: number
 *                       example: 45
 *                     unlockedFragments:
 *                       type: number
 *                       example: 12
 *                     challenges:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ChallengeProgress'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/agent/challenge/{challengeId}/progress:
 *   get:
 *     summary: Récupère les fragments débloqués pour un défi spécifique
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du défi
 *         example: "CHALLENGE-CIPHER-001"
 *     responses:
 *       200:
 *         description: Fragments récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     challengeId:
 *                       type: string
 *                       example: "CHALLENGE-CIPHER-001"
 *                     unlockedFragments:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["V1", "A1", "X1"]
 *                     totalFragments:
 *                       type: number
 *                       example: 9
 *                     progress:
 *                       type: string
 *                       example: "3/9 fragments débloqués"
 *                     complete:
 *                       type: boolean
 *                       example: false
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Défi non trouvé ou non accessible
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/founder/agents/{agentId}:
 *   patch:
 *     summary: Met à jour un agent (accès administrateur)
 *     tags: [Administration, Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB de l'agent à modifier
 *         example: "64f5a7b2c8d4e1f2a3b4c5d6"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               protocol:
 *                 type: object
 *                 properties:
 *                   role:
 *                     type: string
 *                     enum: [AGENT, SPECIALIST, FOUNDER]
 *                     example: "SPECIALIST"
 *                   clearanceLevel:
 *                     type: number
 *                     enum: [1, 2, 3]
 *                     example: 2
 *                   group:
 *                     type: string
 *                     enum: [PROTOCOL, AURORA, ZENITH]
 *                     example: "AURORA"
 *                   customName:
 *                     type: string
 *                     example: "Agent Spécialisé"
 *     responses:
 *       200:
 *         description: Agent mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/founder/agents/{agentId}/contracts:
 *   get:
 *     summary: Récupère tous les contrats d'un agent spécifique (admin)
 *     tags: [Administration, Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agent
 *     responses:
 *       200:
 *         description: Contrats de l'agent récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContractList'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/founder/contracts:
 *   get:
 *     summary: Récupère tous les contrats du système (admin)
 *     tags: [Administration, Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre de contrats par page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, validated, cancelled, revoked]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Tous les contrats récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContractList'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/founder/contract/{contractId}:
 *   get:
 *     summary: Récupère un contrat spécifique (admin)
 *     tags: [Administration, Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du contrat
 *     responses:
 *       200:
 *         description: Contrat récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Contract'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 *   patch:
 *     summary: Met à jour un contrat (admin)
 *     tags: [Administration, Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du contrat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContractUpdate'
 *     responses:
 *       200:
 *         description: Contrat mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Contract'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/founder/announcement:
 *   post:
 *     summary: Crée une nouvelle annonce (admin)
 *     tags: [Administration, Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnnouncementCreate'
 *     responses:
 *       201:
 *         description: Annonce créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Announcement'
 *       400:
 *         description: Données invalides
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/founder/announcement/{id}:
 *   patch:
 *     summary: Met à jour une annonce (admin)
 *     tags: [Administration, Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'annonce
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnnouncementUpdate'
 *     responses:
 *       200:
 *         description: Annonce mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Announcement'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 *   delete:
 *     summary: Supprime une annonce (admin)
 *     tags: [Administration, Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'annonce
 *     responses:
 *       200:
 *         description: Annonce supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Annonce supprimée avec succès"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/founder/announcements:
 *   get:
 *     summary: Récupère toutes les annonces (admin)
 *     tags: [Administration, Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre d'annonces par page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *     responses:
 *       200:
 *         description: Annonces récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     announcements:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Announcement'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/founder/emblem:
 *   post:
 *     summary: Crée un nouvel emblème (admin)
 *     tags: [Administration, Emblems]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmblemCreate'
 *     responses:
 *       201:
 *         description: Emblème créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Emblem'
 *       400:
 *         description: Données invalides
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/founder/emblem/{emblemId}:
 *   get:
 *     summary: Récupère un emblème spécifique (admin)
 *     tags: [Administration, Emblems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: emblemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'emblème
 *     responses:
 *       200:
 *         description: Emblème récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Emblem'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 *   patch:
 *     summary: Met à jour un emblème (admin)
 *     tags: [Administration, Emblems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: emblemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'emblème
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmblemUpdate'
 *     responses:
 *       200:
 *         description: Emblème mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Emblem'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 *   delete:
 *     summary: Supprime un emblème (admin)
 *     tags: [Administration, Emblems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: emblemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'emblème
 *     responses:
 *       200:
 *         description: Emblème supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Emblème supprimé avec succès"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/founder/emblems:
 *   get:
 *     summary: Récupère tous les emblèmes (admin)
 *     tags: [Administration, Emblems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre d'emblèmes par page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *     responses:
 *       200:
 *         description: Emblèmes récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     emblems:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Emblem'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/founder/challenge:
 *   post:
 *     summary: Crée un nouveau défi (admin)
 *     tags: [Administration, Challenges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChallengeCreate'
 *     responses:
 *       201:
 *         description: Défi créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Challenge'
 *       400:
 *         description: Données invalides
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/founder/challenge/{challengeId}:
 *   get:
 *     summary: Récupère un défi spécifique (admin)
 *     tags: [Administration, Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du défi
 *     responses:
 *       200:
 *         description: Défi récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Challenge'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 *   patch:
 *     summary: Met à jour un défi (admin)
 *     tags: [Administration, Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du défi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChallengeUpdate'
 *     responses:
 *       200:
 *         description: Défi mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Challenge'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 *   delete:
 *     summary: Supprime un défi (admin)
 *     tags: [Administration, Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du défi
 *     responses:
 *       200:
 *         description: Défi supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Défi supprimé avec succès"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

/**
 * @swagger
 * /protocol/founder/challenges:
 *   get:
 *     summary: Récupère tous les défis (admin)
 *     tags: [Administration, Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre de défis par page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [EASY, MEDIUM, HARD, EXPERT]
 *         description: Filtrer par difficulté
 *     responses:
 *       200:
 *         description: Défis récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     challenges:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Challenge'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/StandardError'
 */

// ============== SCHEMAS ==============

/**
 * @swagger
 * components:
 *   schemas:
 *     Agent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         bungie:
 *           type: object
 *           properties:
 *             membershipType:
 *               type: number
 *               example: 3
 *             membershipId:
 *               type: string
 *               example: "4611686018467322167"
 *             displayName:
 *               type: string
 *               example: "Guardian#1234"
 *             bungieGlobalDisplayName:
 *               type: string
 *               example: "Guardian"
 *             bungieGlobalDisplayNameCode:
 *               type: number
 *               example: 1234
 *         destiny2:
 *           type: object
 *           properties:
 *             characters:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   characterId:
 *                     type: string
 *                   classType:
 *                     type: number
 *                   raceType:
 *                     type: number
 *                   genderType:
 *                     type: number
 *                   light:
 *                     type: number
 *         protocol:
 *           type: object
 *           properties:
 *             role:
 *               type: string
 *               enum: [AGENT, SPECIALIST, FOUNDER]
 *               example: "AGENT"
 *             clearanceLevel:
 *               type: number
 *               enum: [1, 2, 3]
 *               example: 1
 *             group:
 *               type: string
 *               enum: [PROTOCOL, AURORA, ZENITH]
 *               example: "PROTOCOL"
 *             customName:
 *               type: string
 *               example: "Gardien Nova"
 *             settings:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: boolean
 *                   example: true
 *                 publicProfile:
 *                   type: boolean
 *                   example: false
 *                 protocolOSTheme:
 *                   type: string
 *                   enum: [DEFAULT, DARKNESS]
 *                   example: "DEFAULT"
 *                 protocolSounds:
 *                   type: boolean
 *                   example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Contract:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "CONTRACT-EMB-2024-001"
 *         agentId:
 *           type: string
 *           example: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         emblemId:
 *           type: string
 *           example: "EMBLEM-VEX-001"
 *         status:
 *           type: string
 *           enum: [pending, validated, cancelled, revoked]
 *           example: "pending"
 *         requestedAt:
 *           type: string
 *           format: date-time
 *         validatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         validatedBy:
 *           type: string
 *           nullable: true
 *         reason:
 *           type: string
 *           example: "Défi Vex terminé avec succès"
 *         metadata:
 *           type: object
 *           properties:
 *             challengeId:
 *               type: string
 *             completedAt:
 *               type: string
 *               format: date-time
 *
 *     ContractCreate:
 *       type: object
 *       required:
 *         - emblemId
 *         - reason
 *       properties:
 *         emblemId:
 *           type: string
 *           example: "EMBLEM-VEX-001"
 *         reason:
 *           type: string
 *           example: "Défi Vex terminé avec succès"
 *         metadata:
 *           type: object
 *
 *     ContractUpdate:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, validated, cancelled, revoked]
 *         reason:
 *           type: string
 *         metadata:
 *           type: object
 *
 *     ContractList:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             contracts:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contract'
 *             pagination:
 *               $ref: '#/components/schemas/Pagination'
 *
 *     Announcement:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         title:
 *           type: string
 *           example: "Mise à jour Protocol OS v2.1"
 *         content:
 *           type: string
 *           example: "Nouvelles fonctionnalités disponibles..."
 *         type:
 *           type: string
 *           enum: [INFO, WARNING, CRITICAL, EVENT]
 *           example: "INFO"
 *         priority:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 3
 *         active:
 *           type: boolean
 *           example: true
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         targetGroups:
 *           type: array
 *           items:
 *             type: string
 *             enum: [PROTOCOL, AURORA, ZENITH]
 *           example: ["PROTOCOL"]
 *
 *     AnnouncementUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         type:
 *           type: string
 *           enum: [INFO, WARNING, CRITICAL, EVENT]
 *         priority:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         active:
 *           type: boolean
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         targetGroups:
 *           type: array
 *           items:
 *             type: string
 *             enum: [PROTOCOL, AURORA, ZENITH]
 *
 *     Emblem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "EMBLEM-VEX-001"
 *         name:
 *           type: string
 *           example: "Chronophage Vex"
 *         description:
 *           type: string
 *           example: "Emblème obtenu en complétant les défis temporels Vex"
 *         category:
 *           type: string
 *           enum: [RAID, DUNGEON, CRUCIBLE, GAMBIT, TRIALS, SEASONAL, EXOTIC, PROTOCOL]
 *           example: "PROTOCOL"
 *         rarity:
 *           type: string
 *           enum: [COMMON, RARE, LEGENDARY, EXOTIC]
 *           example: "LEGENDARY"
 *         bungie:
 *           type: object
 *           properties:
 *             hash:
 *               type: number
 *               example: 1234567890
 *             iconUrl:
 *               type: string
 *               example: "https://www.bungie.net/common/destiny2_content/icons/emblems/icon.jpg"
 *             secondaryIconUrl:
 *               type: string
 *               nullable: true
 *         requirements:
 *           type: object
 *           properties:
 *             challengeId:
 *               type: string
 *               nullable: true
 *             description:
 *               type: string
 *               example: "Compléter tous les défis Vex temporels"
 *         active:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     EmblemCreate:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - category
 *         - rarity
 *       properties:
 *         name:
 *           type: string
 *           example: "Maître du Temps"
 *         description:
 *           type: string
 *           example: "Emblème pour les maîtres des paradoxes temporels"
 *         category:
 *           type: string
 *           enum: [RAID, DUNGEON, CRUCIBLE, GAMBIT, TRIALS, SEASONAL, EXOTIC, PROTOCOL]
 *           example: "PROTOCOL"
 *         rarity:
 *           type: string
 *           enum: [COMMON, RARE, LEGENDARY, EXOTIC]
 *           example: "EXOTIC"
 *         bungie:
 *           type: object
 *           properties:
 *             hash:
 *               type: number
 *             iconUrl:
 *               type: string
 *             secondaryIconUrl:
 *               type: string
 *               nullable: true
 *         requirements:
 *           type: object
 *           properties:
 *             challengeId:
 *               type: string
 *               nullable: true
 *             description:
 *               type: string
 *         active:
 *           type: boolean
 *           example: true
 *
 *     EmblemUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum: [RAID, DUNGEON, CRUCIBLE, GAMBIT, TRIALS, SEASONAL, EXOTIC, PROTOCOL]
 *         rarity:
 *           type: string
 *           enum: [COMMON, RARE, LEGENDARY, EXOTIC]
 *         bungie:
 *           type: object
 *           properties:
 *             hash:
 *               type: number
 *             iconUrl:
 *               type: string
 *             secondaryIconUrl:
 *               type: string
 *               nullable: true
 *         requirements:
 *           type: object
 *         active:
 *           type: boolean
 *
 *     Challenge:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "CHALLENGE-CIPHER-001"
 *         title:
 *           type: string
 *           example: "Décodage Temporal Vex"
 *         description:
 *           type: string
 *           example: "Déchiffrez les codes temporels laissés par les Vex"
 *         difficulty:
 *           type: string
 *           enum: [EASY, MEDIUM, HARD, EXPERT]
 *           example: "HARD"
 *         category:
 *           type: string
 *           enum: [CIPHER, PUZZLE, INVESTIGATION, COMBAT, EXPLORATION]
 *           example: "CIPHER"
 *         accessCode:
 *           type: string
 *           example: "ALPHA-7"
 *         promptLines:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Analysez la séquence temporelle", "Identifiez les anomalies"]
 *         hintLines:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Les timestamps cachent un pattern", "Cherchez les répétitions"]
 *         solution:
 *           type: object
 *           properties:
 *             correctAnswer:
 *               type: string
 *               example: "TEMPORAL_SEQUENCE_V"
 *             acceptedVariants:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["TEMP_SEQ_V", "TEMPORAL_V"]
 *         rewards:
 *           type: object
 *           properties:
 *             fragments:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["V1", "A1", "X1"]
 *             emblemId:
 *               type: string
 *               nullable: true
 *               example: "EMBLEM-VEX-001"
 *         active:
 *           type: boolean
 *           example: true
 *         stats:
 *           type: object
 *           properties:
 *             totalAttempts:
 *               type: number
 *               example: 156
 *             successfulSolutions:
 *               type: number
 *               example: 23
 *             successRate:
 *               type: number
 *               example: 14.7
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     ChallengeCreate:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - difficulty
 *         - category
 *         - accessCode
 *         - promptLines
 *         - solution
 *       properties:
 *         title:
 *           type: string
 *           example: "Enigme des Fragments Perdus"
 *         description:
 *           type: string
 *           example: "Retrouvez les fragments dispersés dans le réseau Vex"
 *         difficulty:
 *           type: string
 *           enum: [EASY, MEDIUM, HARD, EXPERT]
 *           example: "MEDIUM"
 *         category:
 *           type: string
 *           enum: [CIPHER, PUZZLE, INVESTIGATION, COMBAT, EXPLORATION]
 *           example: "PUZZLE"
 *         accessCode:
 *           type: string
 *           example: "BETA-9"
 *         promptLines:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Examinez les données corrompues", "Reconstruisez la séquence"]
 *         hintLines:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Les fragments suivent un ordre logique"]
 *         solution:
 *           type: object
 *           required:
 *             - correctAnswer
 *           properties:
 *             correctAnswer:
 *               type: string
 *               example: "FRAGMENT_SEQUENCE_BETA"
 *             acceptedVariants:
 *               type: array
 *               items:
 *                 type: string
 *         rewards:
 *           type: object
 *           properties:
 *             fragments:
 *               type: array
 *               items:
 *                 type: string
 *             emblemId:
 *               type: string
 *               nullable: true
 *         active:
 *           type: boolean
 *           example: true
 *
 *     ChallengeUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         difficulty:
 *           type: string
 *           enum: [EASY, MEDIUM, HARD, EXPERT]
 *         category:
 *           type: string
 *           enum: [CIPHER, PUZZLE, INVESTIGATION, COMBAT, EXPLORATION]
 *         accessCode:
 *           type: string
 *         promptLines:
 *           type: array
 *           items:
 *             type: string
 *         hintLines:
 *           type: array
 *           items:
 *             type: string
 *         solution:
 *           type: object
 *           properties:
 *             correctAnswer:
 *               type: string
 *             acceptedVariants:
 *               type: array
 *               items:
 *                 type: string
 *         rewards:
 *           type: object
 *         active:
 *           type: boolean
 *
 *     ChallengeProgress:
 *       type: object
 *       properties:
 *         challengeId:
 *           type: string
 *           example: "CHALLENGE-CIPHER-001"
 *         title:
 *           type: string
 *           example: "Décodage Temporal Vex"
 *         difficulty:
 *           type: string
 *           example: "HARD"
 *         completed:
 *           type: boolean
 *           example: false
 *         unlockedFragments:
 *           type: array
 *           items:
 *             type: string
 *           example: ["V1", "A1"]
 *         totalFragments:
 *           type: number
 *           example: 9
 *         attempts:
 *           type: number
 *           example: 3
 *         lastAttempt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           example: 150
 *         page:
 *           type: number
 *           example: 1
 *         limit:
 *           type: number
 *           example: 20
 *         pages:
 *           type: number
 *           example: 8
 *
 * security:
 *   - bearerAuth: []
 *
 * paths:
 *   # Toutes les routes sont définies ci-dessus
          minimum: 1
 *           maximum: 5
 *           example: 3
 *         active:
 *           type: boolean
 *           example: true
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdBy:
 *           type: string
 *           example: "64f5a7b2c8d4e1f2a3b4c5d6"
 *         targetGroups:
 *           type: array
 *           items:
 *             type: string
 *             enum: [PROTOCOL, AURORA, ZENITH]
 *           example: ["PROTOCOL", "AURORA"]
 *
 *     AnnouncementCreate:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - type
 *       properties:
 *         title:
 *           type: string
 *           example: "Nouvelle mission disponible"
 *         content:
 *           type: string
 *           example: "Une nouvelle série de défis Vex est maintenant disponible..."
 *         type:
 *           type: string
 *           enum: [INFO, WARNING, CRITICAL, EVENT]
 *           example: "INFO"
 *         priority:
 *           type: number
 */