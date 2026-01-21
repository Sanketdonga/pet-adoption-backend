import express from 'express';
import {
    getPets,
    getPet,
    createPet,
    updatePet,
    deletePet
} from '../controllers/petController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../utils/cloudinary.js';

const router = express.Router();

router.route('/')
    .get(getPets)
    .post(protect, authorize('admin'), upload.array('images', 5), createPet);

router.route('/:id')
    .get(getPet)
    .put(protect, authorize('admin'), upload.array('images', 5), updatePet)
    .delete(protect, authorize('admin'), deletePet);

export default router;
