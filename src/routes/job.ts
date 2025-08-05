import { Router } from 'express';
import { 
    CreateJob, 
    GetAllJobs, 
    GetJobById, 
    UpdateJob, 
    DeleteJob, 
    GetJobsByEmployer,
    GetEmployerJobStats
} from '../controllers/job';
import { authenticateToken, isAdminOrEmployer, isEmployer } from '../middleware/auth';
import { validateJobData, validateJobOwnership, incrementJobViews } from '../middleware/job';

const router: Router = Router();

// ========================================
// PUBLIC ROUTES
// ========================================

/**
 * Get all jobs with filtering, search, and pagination
 * @route GET /api/jobs
 * @access Public
 */
router.get('/', GetAllJobs);

/**
 * Get job by ID (with view count increment)
 * @route GET /api/jobs/:id
 * @access Public
 */
router.get('/:id', incrementJobViews, GetJobById);

// ========================================
// PROTECTED ROUTES
// ========================================

/**
 * Create a new job
 * @route POST /api/jobs
 * @access Private (Employer, Admin)
 */
router.post('/', authenticateToken, isAdminOrEmployer, validateJobData, CreateJob);

/**
 * Update a job
 * @route PUT /api/jobs/:id
 * @access Private (Employer, Admin)
 */
router.put('/:id', authenticateToken, validateJobOwnership, validateJobData, UpdateJob);

/**
 * Delete a job
 * @route DELETE /api/jobs/:id
 * @access Private (Employer, Admin)
 */
router.delete('/:id', authenticateToken, validateJobOwnership, DeleteJob);

// ========================================
// EMPLOYER-SPECIFIC ROUTES
// ========================================

/**
 * Get jobs by current employer
 * @route GET /api/jobs/employer/jobs
 * @access Private (Employer)
 */
router.get('/employer/jobs', authenticateToken, isEmployer, GetJobsByEmployer);

/**
 * Get job statistics for employer
 * @route GET /api/jobs/employer/stats
 * @access Private (Employer)
 */
router.get('/employer/stats', authenticateToken, isEmployer, GetEmployerJobStats);

export default router;
