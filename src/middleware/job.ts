import { Request, Response, NextFunction } from 'express';
import Job from '../models/job.model';
import { RoleType } from '../models/role.model';

/**
 * Validate job ownership - ensure employer can only modify their own jobs
 */
export const validateJobOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId);
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Admin can modify any job
        if (req.user.role === RoleType.Admin) {
            req.job = job;
            return next();
        }

        // Employer can only modify their own jobs
        if (req.user.role === RoleType.Employer && job.employer.toString() === req.user._id.toString()) {
            req.job = job;
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'You can only modify your own jobs'
        });

    } catch (error) {
        console.error('Job ownership validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Increment job views count
 */
export const incrementJobViews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jobId = req.params.id;
        await Job.findByIdAndUpdate(jobId, { $inc: { viewsCount: 1 } });
        next();
    } catch (error) {
        console.error('Increment views error:', error);
        next(); // Continue even if increment fails
    }
};

/**
 * Validate job data
 */
export const validateJobData = (req: Request, res: Response, next: NextFunction) => {
    const {
        title,
        description,
        requirements,
        responsibilities,
        type,
        salary,
        experience,
        education,
        skills,
        hoursOfWork
    } = req.body;

    const errors: string[] = [];

    // Required fields validation
    if (!title?.trim()) errors.push('Title is required');
    if (!description?.trim()) errors.push('Description is required');
    if (!requirements || !Array.isArray(requirements) || requirements.length === 0) {
        errors.push('Requirements must be a non-empty array');
    }
    if (!responsibilities?.trim()) errors.push('Responsibilities is required');
    if (!type) errors.push('Job type is required');
    if (!salary?.min || !salary?.max) errors.push('Salary range is required');
    if (!experience) errors.push('Experience level is required');
    if (!education) errors.push('Education level is required');
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
        errors.push('Skills must be a non-empty array');
    }
    if (!hoursOfWork?.trim()) errors.push('Hours of work is required');

    // Type validation
    const validTypes = ['Internship', 'Part Time', 'Hybrid', 'Full time', 'Freelance'];
    if (type && !validTypes.includes(type)) {
        errors.push('Invalid job type');
    }

    const validExperience = ['Entry', 'Mid', 'Senior'];
    if (experience && !validExperience.includes(experience)) {
        errors.push('Invalid experience level');
    }

    const validEducation = ['HighSchool', 'Bachelor', 'Bachelor Student', 'Master', 'Other'];
    if (education && !validEducation.includes(education)) {
        errors.push('Invalid education level');
    }

    // Salary validation
    if (salary?.min && salary?.max && salary.min > salary.max) {
        errors.push('Minimum salary cannot be greater than maximum salary');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    return next();
};

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            job?: any;
        }
    }
}
