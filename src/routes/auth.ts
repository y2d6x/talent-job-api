import { Router } from 'express';
import { 
  login, 
  register, 
  logout, 
  getCurrentUser, 
  updateUser, 
  deleteUser 
} from '../controllers/auth';
import { 
  authenticateToken, 
  isAuthenticated, 
  isAdmin 
} from '../middleware/auth';

const router: Router = Router();

// ========================================
// AUTHENTICATION ROUTES
// ========================================

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/register
 * @desc    User registration
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Private
 * 
 */
router.post('/logout', authenticateToken, logout);

// ========================================
// USER PROFILE ROUTES
// ========================================

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, getCurrentUser);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, updateUser);

// ========================================
// ADMIN ROUTES
// ========================================

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private (Admin)
 */
router.delete('/users/:id', authenticateToken, isAdmin, deleteUser);

export default router;
