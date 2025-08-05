import { Router } from 'express';
import { 
    applyToJob,
    getApplicationsByEmployee,
    getApplicationsByEmployer,
    updateApplicationStatus,
    withdrawApplication,
    getApplicationById
} from '../controllers/application';
import { authenticateToken, isEmployee, isEmployer, isAdminOrEmployer } from '../middleware/auth';
import { validateApplicationData, validateApplicationOwnership, validateStatusUpdate } from '../middleware/application';

const router: Router = Router();

// ========================================
// EMPLOYEE ROUTES
// ========================================

/**
 * Apply to a job
 * @route POST /api/applications/apply
 * @access Private (Employee)
 */
router.post('/apply', authenticateToken, isEmployee, validateApplicationData, applyToJob);

/**
 * Get applications by employee
 * @route GET /api/applications/employee
 * @access Private (Employee)
 */
router.get('/employee', authenticateToken, isEmployee, getApplicationsByEmployee);

/**
 * Withdraw application
 * @route PUT /api/applications/:id/withdraw
 * @access Private (Employee)
 */
router.put('/:id/withdraw', authenticateToken, isEmployee, validateApplicationOwnership, withdrawApplication);

// ========================================
// EMPLOYER ROUTES
// ========================================

/**
 * Get applications by employer
 * @route GET /api/applications/employer
 * @access Private (Employer)
 */
router.get('/employer', authenticateToken, isEmployer, getApplicationsByEmployer);

/**
 * Update application status
 * @route PUT /api/applications/:id/status
 * @access Private (Employer, Admin)
 */
router.put('/:id/status', authenticateToken, isAdminOrEmployer, validateStatusUpdate, updateApplicationStatus);

// ========================================
// GENERAL ROUTES
// ========================================

/**
 * Get application by ID
 * @route GET /api/applications/:id
 * @access Private (Employee, Employer, Admin)
 */
router.get('/:id', authenticateToken, getApplicationById);

export default router;
