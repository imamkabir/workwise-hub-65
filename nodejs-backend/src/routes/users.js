import express from 'express';
import { validate, schemas } from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from '../controllers/userController.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination and search
 * @access  Admin only
 */
router.get('/', 
  authorize(['ADMIN', 'SUPER_ADMIN']),
  validate(schemas.pagination, 'query'),
  getUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Admin only
 */
router.get('/:id',
  authorize(['ADMIN', 'SUPER_ADMIN']),
  validate(schemas.idParam, 'params'),
  getUserById
);

/**
 * @route   POST /api/v1/users
 * @desc    Create new user
 * @access  Admin only
 */
router.post('/',
  authorize(['ADMIN', 'SUPER_ADMIN']),
  validate(schemas.userRegistration),
  createUser
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Admin only
 */
router.put('/:id',
  authorize(['ADMIN', 'SUPER_ADMIN']),
  validate(schemas.idParam, 'params'),
  validate(schemas.userUpdate),
  updateUser
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Admin only
 */
router.delete('/:id',
  authorize(['ADMIN', 'SUPER_ADMIN']),
  validate(schemas.idParam, 'params'),
  deleteUser
);

/**
 * @route   PATCH /api/v1/users/:id/toggle-status
 * @desc    Toggle user active status
 * @access  Admin only
 */
router.patch('/:id/toggle-status',
  authorize(['ADMIN', 'SUPER_ADMIN']),
  validate(schemas.idParam, 'params'),
  toggleUserStatus
);

export default router;