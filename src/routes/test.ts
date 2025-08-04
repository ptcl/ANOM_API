import { Router } from 'express';

const router = Router();

/**
 * Routes de test API
 * @route GET /test - Test simple
 * @route POST /test - Test avec body
 * @route GET /test/:id - Test avec paramètres
 */

// Simple GET test
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Test route working!',
        data: {
            method: 'GET',
            endpoint: '/api/test',
            timestamp: new Date().toISOString()
        }
    });
});

// POST test with body
router.post('/', (req, res) => {
    res.json({
        success: true,
        message: 'POST test working!',
        data: {
            method: 'POST',
            body: req.body,
            endpoint: '/api/test',
            timestamp: new Date().toISOString()
        }
    });
});

// Test with URL params
router.get('/:id', (req, res) => {
    res.json({
        success: true,
        message: 'Param test working!',
        data: {
            id: req.params.id,
            endpoint: `/api/test/${req.params.id}`,
            timestamp: new Date().toISOString()
        }
    });
});

export default router;