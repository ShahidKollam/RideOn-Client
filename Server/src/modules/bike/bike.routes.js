import express from 'express'
import { protect } from '../../middlewares/auth.middleware.js'
import {
    createBikeController,
    getBikeListController,
    getBikeByIdController,
    updateBikeController,
    changeBikeStatusController,
    deleteBikeController,
} from './bike.controller.js'

const router = express.Router()

// Admin routes
// router.post('/', protect, createBikeController)
router.post('/', createBikeController)
router.get('/', protect, getBikeListController)
router.get('/:id', protect, getBikeByIdController)
router.patch('/:id', protect, updateBikeController)
router.patch('/:id/status', protect, changeBikeStatusController)
router.delete('/:id', protect, deleteBikeController)

// Public routes - can be mounted separately or with optional auth
router.get('/public', getBikeListController) // Adjust for public
router.get('/public/:id', getBikeByIdController)

export default router
