import { Router } from 'express';
import { 
  getAllUsers,
  getUserById,
  updateUserProfile,
  deleteUser,
  changePassword,
  uploadProfilePicture,
  getUserStats,
  searchUsers
} from '../controllers/user';
import { 
  authenticateToken, 
  isAdmin,
  isEmployee,
  isEmployer
} from '../middleware/auth';
import { validateUserUpdate, validatePasswordChange } from '../middleware/validation';

const router: Router = Router();

// ========================================
// USER MANAGEMENT ROUTES
// ========================================

/**
 * Get all users (Admin only)
 * @route GET /api/users
 * @access Private (Admin)
 */
router.get('/', authenticateToken, isAdmin, getAllUsers);

/**
 * Search users
 * @route GET /api/users/search
 * @access Private (Admin)
 */
router.get('/search', authenticateToken, isAdmin, searchUsers);

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private (Admin, Self)
 */
router.get('/:id', authenticateToken, getUserById);

/**
 * Update user profile
 * @route PUT /api/users/:id
 * @access Private (Admin, Self)
 */
router.put('/:id', authenticateToken, validateUserUpdate, updateUserProfile);

/**
 * Change password
 * @route PUT /api/users/:id/password
 * @access Private (Self)
 */
router.put('/:id/password', authenticateToken, validatePasswordChange, changePassword);

/**
 * Upload profile picture
 * @route POST /api/users/:id/avatar
 * @access Private (Self)
 */
router.post('/:id/avatar', authenticateToken, uploadProfilePicture);

/**
 * Delete user
 * @route DELETE /api/users/:id
 * @access Private (Admin)
 */
router.delete('/:id', authenticateToken, isAdmin, deleteUser);

// ========================================
// STATISTICS ROUTES
// ========================================

/**
 * Get user statistics
 * @route GET /api/users/stats/overview
 * @access Private (Admin)
 */
router.get('/stats/overview', authenticateToken, isAdmin, getUserStats);

export default router; 