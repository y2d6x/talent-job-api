import { Router } from 'express';
import { 
  getPlatformSettings,
  updatePlatformSettings,
  getUserPreferences,
  updateUserPreferences,
  getPrivacySettings,
  updatePrivacySettings,
  exportUserData,
  deleteUserData
} from '../controllers/settings';
import { 
  authenticateToken, 
  isAdmin
} from '../middleware/auth';

const router: Router = Router();

// ========================================
// PLATFORM SETTINGS ROUTES (Admin)
// ========================================

/**
 * Get platform settings
 * @route GET /api/settings/platform
 * @access Private (Admin)
 */
router.get('/platform', authenticateToken, isAdmin, getPlatformSettings);

/**
 * Update platform settings
 * @route PUT /api/settings/platform
 * @access Private (Admin)
 */
router.put('/platform', authenticateToken, isAdmin, updatePlatformSettings);

// ========================================
// USER PREFERENCES ROUTES
// ========================================

/**
 * Get user preferences
 * @route GET /api/settings/preferences
 * @access Private
 */
router.get('/preferences', authenticateToken, getUserPreferences);

/**
 * Update user preferences
 * @route PUT /api/settings/preferences
 * @access Private
 */
router.put('/preferences', authenticateToken, updateUserPreferences);

// ========================================
// PRIVACY SETTINGS ROUTES
// ========================================

/**
 * Get privacy settings
 * @route GET /api/settings/privacy
 * @access Private
 */
router.get('/privacy', authenticateToken, getPrivacySettings);

/**
 * Update privacy settings
 * @route PUT /api/settings/privacy
 * @access Private
 */
router.put('/privacy', authenticateToken, updatePrivacySettings);

// ========================================
// DATA MANAGEMENT ROUTES
// ========================================

/**
 * Export user data
 * @route GET /api/settings/export
 * @access Private
 */
router.get('/export', authenticateToken, exportUserData);

/**
 * Delete user data
 * @route DELETE /api/settings/data
 * @access Private
 */
router.delete('/data', authenticateToken, deleteUserData);

export default router; 