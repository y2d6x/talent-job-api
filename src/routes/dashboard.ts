import { Router } from 'express';
import { 
  getDashboardStats,
  getJobAnalytics,
  getApplicationAnalytics,
  getUserAnalytics,
  getRevenueStats,
  getTopJobs,
  getRecentActivity
} from '../controllers/dashboard';
import { 
  authenticateToken, 
  isAdmin,
  isEmployer
} from '../middleware/auth';

const router: Router = Router();

// ========================================
// DASHBOARD ROUTES
// ========================================

/**
 * Get overall dashboard statistics
 * @route GET /api/dashboard/stats
 * @access Private (Admin)
 */
router.get('/stats', authenticateToken, isAdmin, getDashboardStats);

/**
 * Get job analytics
 * @route GET /api/dashboard/jobs/analytics
 * @access Private (Admin, Employer)
 */
router.get('/jobs/analytics', authenticateToken, getJobAnalytics);

/**
 * Get application analytics
 * @route GET /api/dashboard/applications/analytics
 * @access Private (Admin, Employer)
 */
router.get('/applications/analytics', authenticateToken, getApplicationAnalytics);

/**
 * Get user analytics
 * @route GET /api/dashboard/users/analytics
 * @access Private (Admin)
 */
router.get('/users/analytics', authenticateToken, isAdmin, getUserAnalytics);

/**
 * Get revenue statistics
 * @route GET /api/dashboard/revenue
 * @access Private (Admin)
 */
router.get('/revenue', authenticateToken, isAdmin, getRevenueStats);

/**
 * Get top performing jobs
 * @route GET /api/dashboard/jobs/top
 * @access Private (Admin, Employer)
 */
router.get('/jobs/top', authenticateToken, getTopJobs);

/**
 * Get recent activity
 * @route GET /api/dashboard/activity
 * @access Private (Admin)
 */
router.get('/activity', authenticateToken, isAdmin, getRecentActivity);

export default router; 