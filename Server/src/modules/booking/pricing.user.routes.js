import express from 'express'

import { getPricingListController } from './pricing.controller.js'

const router = express.Router()

// Public packages are used by the pricing page. Only active packages are
// returned by the pricing service's default query.
router.get('/', getPricingListController)

export default router
