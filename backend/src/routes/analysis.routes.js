import express from 'express';
import {
    analyzeResume,
    getAnalyses,
    getAnalysis,
    deleteAnalysis,
} from '../controllers/analysis.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/analyze', analyzeResume);
router.get('/', getAnalyses);
router.get('/:id', getAnalysis);
router.delete('/:id', deleteAnalysis);

export default router;