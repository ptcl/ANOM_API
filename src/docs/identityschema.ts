
/**
 * @swagger
 * /identity/bungie/login:
 *   get:
 *     summary: Initie le processus d'authentification Bungie
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: direct
 *         schema:
 *           type: boolean
 *         description: Si true, redirige directement vers l'URL d'authentification Bungie
 *     responses:
 *       200:
 *         description: URL d'authentification générée avec succès
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
 *                     authUrl:
 *                       type: string
 *                       example: "https://www.bungie.net/fr/OAuth/Authorize?client_id=12345&response_type=code&state=abcdef"
 *                     state:
 *                       type: string
 *                       example: "abcdef123456"
 *                 message:
 *                   type: string
 *                   example: "Bungie authorization URL generated"
 *       500:
 *         description: Erreur lors de l'initiation du processus d'authentification
 */
/**
 * @swagger
 * /identity/bungie/callback:
 *   get:
 *     summary: Callback pour l'authentification Bungie
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Code d'autorisation fourni par Bungie
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: État de validation pour prévenir les attaques CSRF
 *     responses:
 *       200:
 *         description: Authentification réussie
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
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     agent:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: "Authentication successful"
 *       400:
 *         description: Paramètres de requête invalides ou profil Bungie invalide
 *       500:
 *         description: Erreur lors du traitement du callback
 */
/**
 * @swagger
 * /identity/verify:
 *   post:
 *     summary: Vérifie la validité d'un token JWT
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token valide
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
 *                     valid:
 *                       type: boolean
 *                       example: true
 *                     decoded:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: "Token is valid"
 *       400:
 *         description: Token manquant
 *       401:
 *         description: Token invalide ou expiré
 */
/**
 * @swagger
 * /identity/refresh:
 *   post:
 *     summary: Rafraîchit un token JWT
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Nouveau token généré avec succès
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
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *       400:
 *         description: Refresh token manquant
 *       401:
 *         description: Refresh token invalide ou expiré
 */
/**
 * @swagger
 * /identity/status:
 *   get:
 *     summary: Vérifie le statut du service d'authentification
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Statut du service d'authentification
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
 *                       example: "online"
 *                     timestamp:
 *                       type: string
 *                       example: "2025-08-05T12:00:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Authentication service is operational"
 */