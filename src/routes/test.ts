import { Router } from 'express';

const router = Router();

// Simple GET test
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Test route working!',
        data: {
            method: 'GET',
            endpoint: '/api/test'
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
            endpoint: '/api/test'
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
            endpoint: `/api/test/${req.params.id}`
        }
    });
});

export default router;