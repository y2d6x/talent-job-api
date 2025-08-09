import { Router } from 'express';
import { 
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
  sendNotification
} from '../controllers/notification';
import { 
  authenticateToken, 
  isAuthenticated
} from '../middleware/auth';

const router: Router = Router();

// ========================================
// NOTIFICATION ROUTES
// ========================================

/**
 * Get user notifications
 * @route GET /api/notifications
 * @access Private
 */
router.get('/', authenticateToken, getNotifications);

/**
 * Mark notification as read
 * @route PUT /api/notifications/:id/read
 * @access Private
 */
router.put('/:id/read', authenticateToken, markNotificationAsRead);

/**
 * Mark all notifications as read
 * @route PUT /api/notifications/read-all
 * @access Private
 */
router.put('/read-all', authenticateToken, markAllNotificationsAsRead);

/**
 * Delete notification
 * @route DELETE /api/notifications/:id
 * @access Private
 */
router.delete('/:id', authenticateToken, deleteNotification);

/**
 * Get notification settings
 * @route GET /api/notifications/settings
 * @access Private
 */
router.get('/settings', authenticateToken, getNotificationSettings);

/**
 * Update notification settings
 * @route PUT /api/notifications/settings
 * @access Private
 */
router.put('/settings', authenticateToken, updateNotificationSettings);

/**
 * Send notification (Admin only)
 * @route POST /api/notifications/send
 * @access Private (Admin)
 */
router.post('/send', authenticateToken, sendNotification);

export default router; 