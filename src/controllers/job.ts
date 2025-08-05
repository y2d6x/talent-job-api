import { Request, Response } from 'express';
import Job from '../models/job.model';
import Employer from '../models/employer.model';
import { RoleType } from '../models/role.model';
import { IJob } from '../models/job.model';

// ========================================
// JOB CONTROLLERS
// ========================================

/**
 * Create a new job posting
 * @route POST /api/jobs
 * @access Private (Employer, Admin)
 */
export const CreateJob = async (req: Request, res: Response) => {
    try {
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
            status = 'Active',
            hoursOfWork,
            location,
            isRemote = false
        } = req.body;

        // Create job with employer ID from authenticated user
        const jobData = {
            title: title.trim(),
            description: description.trim(),
            requirements: requirements.map((req: string) => req.trim()),
            responsibilities: responsibilities.trim(),
            type,
            salary,
            experience,
            education,
            skills: skills.map((skill: string) => skill.trim()),
            status,
            hoursOfWork: hoursOfWork.trim(),
            employer: req.user._id, // Use authenticated user's ID
            location: location?.trim(),
            isRemote
        };

        const job = await Job.create(jobData);

        return res.status(201).json({
            success: true,
            message: 'Job created successfully',
            data: job
        });

    } catch (error: any) {
        console.error('CreateJob error:', error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err: any) => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Job with this title already exists'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get all jobs with filtering, search, and pagination
 * @route GET /api/jobs
 * @access Public
 */
export const GetAllJobs = async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            type,
            experience,
            education,
            isRemote,
            skills,
            location,
            minSalary,
            maxSalary,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter: any = { status: 'Active' };

        // Text search
        if (search) {
            filter.$text = { $search: search as string };
        }

        // Type filter
        if (type) {
            filter.type = type;
        }

        // Experience filter
        if (experience) {
            filter.experience = experience;
        }

        // Education filter
        if (education) {
            filter.education = education;
        }

        // Remote filter
        if (isRemote !== undefined) {
            filter.isRemote = isRemote === 'true';
        }

        // Skills filter
        if (skills) {
            const skillsArray = Array.isArray(skills) ? skills : [skills];
            filter.skills = { $in: skillsArray };
        }

        // Location filter
        if (location) {
            filter.location = { $regex: location as string, $options: 'i' };
        }

        // Salary range filter
        if (minSalary || maxSalary) {
            filter.salary = {};
            if (minSalary) filter.salary.$gte = Number(minSalary);
            if (maxSalary) filter.salary.$lte = Number(maxSalary);
        }

        // Build sort object
        const sort: any = {};
        sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Execute query with pagination
        const jobs = await Job.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .populate('employer', 'companyName email');

        // Get total count for pagination
        const totalJobs = await Job.countDocuments(filter);
        const totalPages = Math.ceil(totalJobs / Number(limit));

        return res.status(200).json({
            success: true,
            data: jobs,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalJobs,
                hasNextPage: Number(page) < totalPages,
                hasPrevPage: Number(page) > 1
            }
        });

    } catch (error) {
        console.error('GetAllJobs error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

/**
 * Get job by ID with view count increment
 * @route GET /api/jobs/:id
 * @access Public
 */
export const GetJobById = async (req: Request, res: Response) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('employer', 'companyName email details');

        if (!job) {
            return res.status(404).json({ 
                success: false,
                message: 'Job not found' 
            });
        }

        return res.status(200).json({
            success: true,
            data: job
        });

    } catch (error) {
        console.error('GetJobById error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

/**
 * Update a job
 * @route PUT /api/jobs/:id
 * @access Private (Employer, Admin)
 */
export const UpdateJob = async (req: Request, res: Response) => {
    try {
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
            status,
            hoursOfWork,
            location,
            isRemote
        } = req.body;

        // Update job data
        const jobData = {
            title: title?.trim(),
            description: description?.trim(),
            requirements: requirements?.map((req: string) => req.trim()),
            responsibilities: responsibilities?.trim(),
            type,
            salary,
            experience,
            education,
            skills: skills?.map((skill: string) => skill.trim()),
            status,
            hoursOfWork: hoursOfWork?.trim(),
            location: location?.trim(),
            isRemote
        };

        // Remove undefined fields
        Object.keys(jobData).forEach(key => {
            if (jobData[key as keyof typeof jobData] === undefined) {
                delete jobData[key as keyof typeof jobData];
            }
        });

        const job = await Job.findByIdAndUpdate(req.params.id, jobData, { new: true });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Job updated successfully',
            data: job
        });

    } catch (error: any) {
        console.error('UpdateJob error:', error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err: any) => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Delete a job
 * @route DELETE /api/jobs/:id
 * @access Private (Employer, Admin)
 */
export const DeleteJob = async (req: Request, res: Response) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        
        if (!job) {
            return res.status(404).json({ 
                success: false,
                message: 'Job not found' 
            });
        }

        return res.status(200).json({ 
            success: true,
            message: 'Job deleted successfully' 
        });

    } catch (error) {
        console.error('DeleteJob error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

/**
 * Get jobs by employer
 * @route GET /api/jobs/employer
 * @access Private (Employer)
 */
export const GetJobsByEmployer = async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit = 10,
            status
        } = req.query;

        // Build filter
        const filter: any = { employer: req.user._id };
        if (status) {
            filter.status = status;
        }

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Get jobs
        const jobs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        // Get total count
        const totalJobs = await Job.countDocuments(filter);
        const totalPages = Math.ceil(totalJobs / Number(limit));

        return res.status(200).json({
            success: true,
            data: jobs,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalJobs,
                hasNextPage: Number(page) < totalPages,
                hasPrevPage: Number(page) > 1
            }
        });

    } catch (error) {
        console.error('GetJobsByEmployer error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

/**
 * Get job statistics for employer
 * @route GET /api/jobs/employer/stats
 * @access Private (Employer)
 */
export const GetEmployerJobStats = async (req: Request, res: Response) => {
    try {
        const stats = await Job.aggregate([
            { $match: { employer: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalJobs: { $sum: 1 },
                    activeJobs: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
                    inactiveJobs: { $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] } },
                    totalViews: { $sum: '$viewsCount' },
                    totalApplications: { $sum: '$applicationsCount' },
                    avgViews: { $avg: '$viewsCount' },
                    avgApplications: { $avg: '$applicationsCount' }
                }
            }
        ]);

        const typeStats = await Job.aggregate([
            { $match: { employer: req.user._id } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        const experienceStats = await Job.aggregate([
            { $match: { employer: req.user._id } },
            {
                $group: {
                    _id: '$experience',
                    count: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                overview: stats[0] || {
                    totalJobs: 0,
                    activeJobs: 0,
                    inactiveJobs: 0,
                    totalViews: 0,
                    totalApplications: 0,
                    avgViews: 0,
                    avgApplications: 0
                },
                byType: typeStats,
                byExperience: experienceStats
            }
        });

    } catch (error) {
        console.error('GetEmployerJobStats error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};