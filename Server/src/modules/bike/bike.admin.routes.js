import express from 'express';
import { protectAdmin } from '../../middlewares/auth.middleware.js';
import {
  createBikeController,
  getBikeListController,
  getBikeByIdController,
  updateBikeController,
  changeBikeStatusController,
  deleteBikeController,
} from './bike.controller.js';

const router = express.Router();

// Admin routes
router.post('/', protectAdmin, createBikeController);
router.get('/', protectAdmin, getBikeListController);
router.get('/:id', protectAdmin, getBikeByIdController);
router.patch('/:id', protectAdmin, updateBikeController);
router.patch('/:id/status', protectAdmin, changeBikeStatusController);
router.delete('/:id', protectAdmin, deleteBikeController);

// Public routes - can be mounted separately or with optional auth
router.get('/public', getBikeListController); // Adjust for public
router.get('/public/:id', getBikeByIdController);

export default router;
