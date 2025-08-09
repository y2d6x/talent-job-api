import { Router } from 'express';
import { 
  searchJobs,
  searchCandidates,
  searchEmployers,
  getJobSuggestions,
  getCandidateSuggestions,
  getPopularSkills,
  getJobCategories,
  getLocationSuggestions
} from '../controllers/search';
import { 
  authenticateToken, 
  isAuthenticated
} from '../middleware/auth';
import { validateSearchParams } from '../middleware/validation';

const router: Router = Router();

// ========================================
// JOB SEARCH ROUTES
// ========================================

/**
 * Search jobs with advanced filters
 * @route GET /api/search/jobs
 * @access Public
 */
router.get('/jobs', validateSearchParams, searchJobs);

/**
 * Get job suggestions based on user profile
 * @route GET /api/search/jobs/suggestions
 * @access Private
 */
router.get('/jobs/suggestions', authenticateToken, getJobSuggestions);

/**
 * Get popular skills
 * @route GET /api/search/skills/popular
 * @access Public
 */
router.get('/skills/popular', getPopularSkills);

/**
 * Get job categories
 * @route GET /api/search/categories
 * @access Public
 */
router.get('/categories', getJobCategories);

/**
 * Get location suggestions
 * @route GET /api/search/locations
 * @access Public
 */
router.get('/locations', getLocationSuggestions);

// ========================================
// CANDIDATE SEARCH ROUTES
// ========================================

/**
 * Search candidates (for employers)
 * @route GET /api/search/candidates
 * @access Private (Employer, Admin)
 */
router.get('/candidates', authenticateToken, validateSearchParams, searchCandidates);

/**
 * Get candidate suggestions
 * @route GET /api/search/candidates/suggestions
 * @access Private (Employer, Admin)
 */
router.get('/candidates/suggestions', authenticateToken, getCandidateSuggestions);

// ========================================
// EMPLOYER SEARCH ROUTES
// ========================================

/**
 * Search employers
 * @route GET /api/search/employers
 * @access Public
 */
router.get('/employers', validateSearchParams, searchEmployers);

export default router; 