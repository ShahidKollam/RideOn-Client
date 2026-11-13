import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import { 
  signupSchema, 
  magicLinkSchema, 
  verifyMagicLinkSchema, 
  completeProfileSchema,
  adminLoginSchema 
} from './auth.validation.js';
import { 
  signupController, 
  sendMagicLinkController, 
  verifyMagicLinkController, 
  completeProfileController,
  refreshTokenController,
  // adminLoginController,
  logoutController,
  logoutAllController 
} from './auth.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authRateLimit } from '../../middlewares/rateLimit.middleware.js';

const router = express.Router();

router.post('/signup', authRateLimit, validate(signupSchema), signupController);
router.post('/login-link', authRateLimit, validate(magicLinkSchema), sendMagicLinkController);
router.post('/verify-login-link', authRateLimit, validate(verifyMagicLinkSchema), verifyMagicLinkController);
router.post('/complete-profile', protect, validate(completeProfileSchema), completeProfileController);
router.post('/refresh', authRateLimit, refreshTokenController);
// router.post('/admin/login', validate(adminLoginSchema), adminLoginController);
router.post('/logout', logoutController);
router.post('/logout-all', protect, logoutAllController);

export default router;