import { Request, Response, NextFunction } from 'express';
import Application from '../models/application.model';
import { RoleType } from '../models/role.model';

/**
 * Validate application data
 */
export const validateApplicationData = (req: Request, res: Response, next: NextFunction) => {
    const { jobId, coverLetter, expectedSalary } = req.body;
    const errors: string[] = [];

    // Required fields validation
    if (!jobId) errors.push('Job ID is required');

    // Optional fields validation
    if (expectedSalary && (typeof expectedSalary !== 'number' || expectedSalary < 0)) {
        errors.push('Expected salary must be a positive number');
    }

    if (coverLetter && typeof coverLetter !== 'string') {
        errors.push('Cover letter must be a string');
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

/**
 * Validate application ownership - ensure employee can only modify their own applications
 */
export const validateApplicationOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const applicationId = req.params.id;
        const application = await Application.findById(applicationId);
        
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Admin can modify any application
        if (req.user.role === RoleType.Admin) {
            req.application = application;
            return next();
        }

        // Employee can only modify their own applications
        if (req.user.role === RoleType.Employee && application.employee.toString() === req.user._id.toString()) {
            req.application = application;
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'You can only modify your own applications'
        });

    } catch (error) {
        console.error('Application ownership validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Validate application status update
 */
export const validateStatusUpdate = (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Reviewed', 'Shortlisted', 'Interviewed', 'Accepted', 'Rejected'];
    
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
    }

    return next();
};

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            application?: any;
        }
    }
} 