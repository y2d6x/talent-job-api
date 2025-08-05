import { Request, Response } from 'express';
import Application from '../models/application.model';
import Job from '../models/job.model';
import { RoleType } from '../models/role.model';

/**
 * Apply to a job
 * @route POST /api/applications/apply
 * @access Private (Employee)
 */
export const applyToJob = async (req: Request, res: Response) => {
    try {
        const { jobId, coverLetter, expectedSalary, resume } = req.body;
        const employeeId = req.user._id;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if job is active
        if (job.status !== 'Active') {
            return res.status(400).json({
                success: false,
                message: 'This job is no longer accepting applications'
            });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            employee: employeeId,
            job: jobId,
            isWithdrawn: false
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this job'
            });
        }

        // Create new application
        const application = new Application({
            employee: employeeId,
            job: jobId,
            coverLetter,
            expectedSalary,
            resume,
            status: 'Pending'
        });

        await application.save();

        // Populate job details for response
        await application.populate('job', 'title company location');

        return res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: application
        });

    } catch (error: any) {
        console.error('Apply to job error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit application',
            error: error.message
        });
    }
};

/**
 * Get applications by employee
 * @route GET /api/applications/employee
 * @access Private (Employee)
 */
export const getApplicationsByEmployee = async (req: Request, res: Response) => {
    try {
        const employeeId = req.user._id;
        const { page = 1, limit = 10, status } = req.query;

        const query: any = {
            employee: employeeId,
            isWithdrawn: false
        };

        if (status) {
            query.status = status;
        }

        const applications = await Application.find(query)
            .populate('job', 'title company location salary type isActive')
            .populate('employer', 'companyName')
            .sort({ appliedAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit))
            .exec();

        const total = await Application.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: applications,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalApplications: total,
                hasNextPage: Number(page) * Number(limit) < total,
                hasPrevPage: Number(page) > 1
            }
        });

    } catch (error: any) {
        console.error('Get applications by employee error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch applications',
            error: error.message
        });
    }
};

/**
 * Get applications by employer
 * @route GET /api/applications/employer
 * @access Private (Employer)
 */
export const getApplicationsByEmployer = async (req: Request, res: Response) => {
    try {
        const employerId = req.user._id;
        const { page = 1, limit = 10, status, jobId } = req.query;

        // First get all jobs by this employer
        const employerJobs = await Job.find({ employer: employerId }).select('_id');
        const jobIds = employerJobs.map(job => job._id);

        const query: any = {
            job: { $in: jobIds },
            isWithdrawn: false
        };

        if (status) {
            query.status = status;
        }

        if (jobId) {
            query.job = jobId;
        }

        const applications = await Application.find(query)
            .populate('job', 'title company location salary type')
            .populate('employee', 'firstName lastName email phone')
            .sort({ appliedAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit))
            .exec();

        const total = await Application.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: applications,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalApplications: total,
                hasNextPage: Number(page) * Number(limit) < total,
                hasPrevPage: Number(page) > 1
            }
        });

    } catch (error: any) {
        console.error('Get applications by employer error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch applications',
            error: error.message
        });
    }
};

/**
 * Update application status
 * @route PUT /api/applications/:id/status
 * @access Private (Employer, Admin)
 */
export const updateApplicationStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, employerNotes } = req.body;
        const employerId = req.user._id;

        const application = await Application.findById(id)
            .populate({
                path: 'job',
                select: 'employer title',
                populate: {
                    path: 'employer',
                    select: 'companyName'
                }
            });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if employer owns the job or is admin
        if (req.user.role !== RoleType.Admin && 
            (application.job as any).employer && (application.job as any).employer.toString() !== employerId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update applications for your own jobs'
            });
        }

        // Validate status
        const validStatuses = ['Pending', 'Reviewed', 'Shortlisted', 'Interviewed', 'Accepted', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        // Update application
        application.status = status;
        application.reviewedAt = new Date();
        if (employerNotes) {
            application.employerNotes = employerNotes;
        }

        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Application status updated successfully',
            data: application
        });

    } catch (error: any) {
        console.error('Update application status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update application status',
            error: error.message
        });
    }
};

/**
 * Withdraw application
 * @route PUT /api/applications/:id/withdraw
 * @access Private (Employee)
 */
export const withdrawApplication = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const employeeId = req.user._id;

        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if employee owns the application
        if (application.employee.toString() !== employeeId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only withdraw your own applications'
            });
        }

        // Check if already withdrawn
        if (application.isWithdrawn) {
            return res.status(400).json({
                success: false,
                message: 'Application has already been withdrawn'
            });
        }

        // Check if application is in final state
        if (application.status === 'Accepted' || application.status === 'Rejected') {
            return res.status(400).json({
                success: false,
                message: 'Cannot withdraw application that has been accepted or rejected'
            });
        }

        // Withdraw application
        application.isWithdrawn = true;
        application.withdrawnAt = new Date();
        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Application withdrawn successfully',
            data: application
        });

    } catch (error: any) {
        console.error('Withdraw application error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to withdraw application',
            error: error.message
        });
    }
};

/**
 * Get application by ID
 * @route GET /api/applications/:id
 * @access Private (Employee, Employer, Admin)
 */
export const getApplicationById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const application = await Application.findById(id)
            .populate('job', 'title company location salary type employer')
            .populate('employee', 'firstName lastName email phone')
            .populate('employer', 'companyName');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check access permissions
        const isEmployee = req.user.role === RoleType.Employee && 
                          application.employee._id.toString() === userId.toString();
        const isEmployer = req.user.role === RoleType.Employer && 
                          (application.job as any).employer && (application.job as any).employer.toString() === userId.toString();
        const isAdmin = req.user.role === RoleType.Admin;

        if (!isEmployee && !isEmployer && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        return res.status(200).json({
            success: true,
            data: application
        });

    } catch (error: any) {
        console.error('Get application by ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch application',
            error: error.message
        });
    }
}; 