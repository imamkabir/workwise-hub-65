import express from 'express';
import { validate, schemas } from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationStats,
} from '../controllers/applicationController.js';

const router = express.Router();

// All application routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/applications
 * @desc    Get applications with pagination and search
 * @access  Private (Users see their own, Admins see all)
 */
router.get('/',
  validate(schemas.pagination, 'query'),
  getApplications
);

/**
 * @route   GET /api/v1/applications/stats
 * @desc    Get application statistics
 * @access  Admin only
 */
router.get('/stats',
  authorize(['ADMIN', 'SUPER_ADMIN']),
  getApplicationStats
);

/**
 * @route   GET /api/v1/applications/:id
 * @desc    Get application by ID
 * @access  Private (Users see their own, Admins see all)
 */
router.get('/:id',
  validate(schemas.idParam, 'params'),
  getApplicationById
);

/**
 * @route   POST /api/v1/applications
 * @desc    Create new application
 * @access  Private
 */
router.post('/',
  validate(schemas.applicationCreate),
  createApplication
);

/**
 * @route   PUT /api/v1/applications/:id
 * @desc    Update application
 * @access  Private (Users update their own, Admins update any)
 */
router.put('/:id',
  validate(schemas.idParam, 'params'),
  validate(schemas.applicationUpdate),
  updateApplication
);

/**
 * @route   DELETE /api/v1/applications/:id
 * @desc    Delete application
 * @access  Private (Users delete their own, Admins delete any)
 */
router.delete('/:id',
  validate(schemas.idParam, 'params'),
  deleteApplication
);

export default router;