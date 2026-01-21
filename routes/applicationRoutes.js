import express from 'express';
import {
    applyForAdoption,
    getMyApplications,
    getAllApplications,
    updateApplicationStatus
} from '../controllers/applicationController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, applyForAdoption);
router.get('/my', protect, getMyApplications);
router.get('/', protect, authorize('admin'), getAllApplications);
router.put('/:id', protect, authorize('admin'), updateApplicationStatus);

export default router;
