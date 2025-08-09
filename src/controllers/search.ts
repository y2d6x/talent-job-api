import { Request, Response } from 'express';
import Job from '../models/job.model';
import { Employee, Employer } from '../models/index.model';

// ========================================
// SEARCH CONTROLLERS
// ========================================

/**
 * Search jobs with advanced filters
 * @route GET /api/search/jobs
 * @access Public
 */
export const searchJobs = async (req: Request, res: Response) => {
  try {
    const {
      query,
      location,
      type,
      experience,
      education,
      minSalary,
      maxSalary,
      isRemote,
      page = 1,
      limit = 10,
      sort = 'createdAt'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const queryObj: any = { status: 'Active' };

    // Text search
    if (query) {
      queryObj.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { skills: { $in: [new RegExp(query as string, 'i')] } }
      ];
    }

    // Location filter
    if (location) {
      queryObj.location = { $regex: location, $options: 'i' };
    }

    // Job type filter
    if (type) {
      queryObj.type = type;
    }

    // Experience filter
    if (experience) {
      queryObj.experience = experience;
    }

    // Education filter
    if (education) {
      queryObj.education = education;
    }

    // Salary range filter
    if (minSalary || maxSalary) {
      queryObj.salary = {};
      if (minSalary) queryObj.salary.$gte = Number(minSalary);
      if (maxSalary) queryObj.salary.$lte = Number(maxSalary);
    }

    // Remote work filter
    if (isRemote !== undefined) {
      queryObj.isRemote = isRemote === 'true';
    }

    // Build sort object
    const sortObj: any = {};
    if (sort === 'salary') {
      sortObj['salary.max'] = -1;
    } else if (sort === 'recent') {
      sortObj.createdAt = -1;
    } else {
      sortObj.createdAt = -1;
    }

    const jobs = await Job.find(queryObj)
      .populate('employer', 'companyName location')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(queryObj);

    return res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalJobs: total,
        hasNextPage: Number(page) * Number(limit) < total,
        hasPrevPage: Number(page) > 1
      },
      filters: {
        query,
        location,
        type,
        experience,
        education,
        minSalary,
        maxSalary,
        isRemote
      }
    });

  } catch (error: any) {
    console.error('Search jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search jobs',
      error: error.message
    });
  }
};

/**
 * Get job suggestions based on user profile
 * @route GET /api/search/jobs/suggestions
 * @access Private
 */
export const getJobSuggestions = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const user = await Employee.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build suggestion query based on user skills and preferences
    const suggestionQuery: any = {
      status: 'Active',
      $or: []
    };

    // Match user skills
    if (user.jobInfo?.skills && user.jobInfo.skills.length > 0) {
      suggestionQuery.$or.push({
        skills: { $in: user.jobInfo.skills }
      });
    }

    // Match user experience level
    if (user.jobInfo?.experienceLevel) {
      suggestionQuery.$or.push({
        experience: user.jobInfo.experienceLevel
      });
    }

    // Match user education
    if (user.jobInfo?.educationalStatus) {
      suggestionQuery.$or.push({
        education: user.jobInfo.educationalStatus
      });
    }

    // If no specific criteria, get recent jobs
    if (suggestionQuery.$or.length === 0) {
      delete suggestionQuery.$or;
    }

    const suggestions = await Job.find(suggestionQuery)
      .populate('employer', 'companyName location')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: suggestions
    });

  } catch (error: any) {
    console.error('Get job suggestions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get job suggestions',
      error: error.message
    });
  }
};

/**
 * Search candidates (for employers)
 * @route GET /api/search/candidates
 * @access Private (Employer, Admin)
 */
export const searchCandidates = async (req: Request, res: Response) => {
  try {
    const {
      query,
      skills,
      experience,
      education,
      location,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const queryObj: any = {};

    // Text search
    if (query) {
      queryObj.$or = [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { 'jobInfo.skills': { $in: [new RegExp(query as string, 'i')] } }
      ];
    }

    // Skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      queryObj['jobInfo.skills'] = { $in: skillsArray };
    }

    // Experience filter
    if (experience) {
      queryObj['jobInfo.experienceLevel'] = experience;
    }

    // Education filter
    if (education) {
      queryObj['jobInfo.educationalStatus'] = education;
    }

    // Location filter
    if (location) {
      queryObj.location = { $regex: location, $options: 'i' };
    }

    const candidates = await Employee.find(queryObj)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Employee.countDocuments(queryObj);

    return res.status(200).json({
      success: true,
      data: candidates,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalCandidates: total,
        hasNextPage: Number(page) * Number(limit) < total,
        hasPrevPage: Number(page) > 1
      }
    });

  } catch (error: any) {
    console.error('Search candidates error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search candidates',
      error: error.message
    });
  }
};

/**
 * Get candidate suggestions
 * @route GET /api/search/candidates/suggestions
 * @access Private (Employer, Admin)
 */
export const getCandidateSuggestions = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.query;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    // Get job details to match candidates
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Find candidates with matching skills
    const candidates = await Employee.find({
      skills: { $in: job.skills },
      experience: job.experience
    })
      .select('-password')
      .limit(5);

    return res.status(200).json({
      success: true,
      data: candidates
    });

  } catch (error: any) {
    console.error('Get candidate suggestions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get candidate suggestions',
      error: error.message
    });
  }
};

/**
 * Search employers
 * @route GET /api/search/employers
 * @access Public
 */
export const searchEmployers = async (req: Request, res: Response) => {
  try {
    const {
      query,
      location,
      industry,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const queryObj: any = {};

    // Text search
    if (query) {
      queryObj.$or = [
        { companyName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    // Location filter
    if (location) {
      queryObj.location = { $regex: location, $options: 'i' };
    }

    // Industry filter
    if (industry) {
      queryObj.industry = industry;
    }

    const employers = await Employer.find(queryObj)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Employer.countDocuments(queryObj);

    return res.status(200).json({
      success: true,
      data: employers,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalEmployers: total,
        hasNextPage: Number(page) * Number(limit) < total,
        hasPrevPage: Number(page) > 1
      }
    });

  } catch (error: any) {
    console.error('Search employers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search employers',
      error: error.message
    });
  }
};

/**
 * Get popular skills
 * @route GET /api/search/skills/popular
 * @access Public
 */
export const getPopularSkills = async (req: Request, res: Response) => {
  try {
    // Get skills from jobs
    const jobSkills = await Job.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get skills from employees
    const employeeSkills = await Employee.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Combine and sort by popularity
    const allSkills = [...jobSkills, ...employeeSkills];
    const skillCounts: any = {};

    allSkills.forEach(skill => {
      if (skillCounts[skill._id]) {
        skillCounts[skill._id] += skill.count;
      } else {
        skillCounts[skill._id] = skill.count;
      }
    });

    const popularSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 20);

    return res.status(200).json({
      success: true,
      data: popularSkills
    });

  } catch (error: any) {
    console.error('Get popular skills error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get popular skills',
      error: error.message
    });
  }
};

/**
 * Get job categories
 * @route GET /api/search/categories
 * @access Public
 */
export const getJobCategories = async (req: Request, res: Response) => {
  try {
    const categories = [
      { name: 'Technology', count: 0 },
      { name: 'Healthcare', count: 0 },
      { name: 'Finance', count: 0 },
      { name: 'Education', count: 0 },
      { name: 'Marketing', count: 0 },
      { name: 'Sales', count: 0 },
      { name: 'Design', count: 0 },
      { name: 'Engineering', count: 0 },
      { name: 'Customer Service', count: 0 },
      { name: 'Other', count: 0 }
    ];

    // Get counts for each category
    for (const category of categories) {
      const count = await Job.countDocuments({
        title: { $regex: category.name, $options: 'i' }
      });
      category.count = count;
    }

    return res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error: any) {
    console.error('Get job categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get job categories',
      error: error.message
    });
  }
};

/**
 * Get location suggestions
 * @route GET /api/search/locations
 * @access Public
 */
export const getLocationSuggestions = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    // Get unique locations from jobs
    const jobLocations = await Job.distinct('location', {
      location: { $regex: query, $options: 'i' }
    });

    // Get unique locations from employers
    const employerLocations = await Employer.distinct('location', {
      location: { $regex: query, $options: 'i' }
    });

    // Combine and remove duplicates
    const allLocations = [...new Set([...jobLocations, ...employerLocations])];

    return res.status(200).json({
      success: true,
      data: allLocations.slice(0, 10)
    });

  } catch (error: any) {
    console.error('Get location suggestions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get location suggestions',
      error: error.message
    });
  }
}; 