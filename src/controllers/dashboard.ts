import { Request, Response } from 'express';
import Job from '../models/job.model';
import Application from '../models/application.model';
import { Employee, Employer } from '../models/index.model';
import { RoleType } from '../models/role.model';

// ========================================
// DASHBOARD CONTROLLERS
// ========================================

/**
 * Get overall dashboard statistics
 * @route GET /api/dashboard/stats
 * @access Private (Admin)
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get counts
    const [totalJobs, totalApplications, totalEmployees, totalEmployers] = await Promise.all([
      Job.countDocuments(),
      Application.countDocuments(),
      Employee.countDocuments(),
      Employer.countDocuments()
    ]);

    // Get active jobs
    const activeJobs = await Job.countDocuments({ status: 'Active' });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentJobs, recentApplications, recentEmployees, recentEmployers] = await Promise.all([
      Job.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Application.countDocuments({ appliedAt: { $gte: sevenDaysAgo } }),
      Employee.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Employer.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    ]);

    // Get application status distribution
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusDistribution = applicationStats.reduce((acc: any, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalJobs,
          activeJobs,
          totalApplications,
          totalEmployees,
          totalEmployers
        },
        recentActivity: {
          newJobs: recentJobs,
          newApplications: recentApplications,
          newEmployees: recentEmployees,
          newEmployers: recentEmployers
        },
        applicationStatus: statusDistribution,
        growth: {
          jobsGrowth: Math.round((recentJobs / totalJobs) * 100),
          applicationsGrowth: Math.round((recentApplications / totalApplications) * 100),
          employeesGrowth: Math.round((recentEmployees / totalEmployees) * 100),
          employersGrowth: Math.round((recentEmployers / totalEmployers) * 100)
        }
      }
    });

  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

/**
 * Get job analytics
 * @route GET /api/dashboard/jobs/analytics
 * @access Private (Admin, Employer)
 */
export const getJobAnalytics = async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));

    // Get job statistics
    const [totalJobs, activeJobs, inactiveJobs] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: 'Active' }),
      Job.countDocuments({ status: 'Inactive' })
    ]);

    // Get jobs by type
    const jobsByType = await Job.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get jobs by experience level
    const jobsByExperience = await Job.aggregate([
      {
        $group: {
          _id: '$experience',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent jobs
    const recentJobs = await Job.find({ createdAt: { $gte: daysAgo } })
      .populate('employer', 'companyName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get average salary
    const salaryStats = await Job.aggregate([
      {
        $group: {
          _id: null,
          avgMinSalary: { $avg: '$salary.min' },
          avgMaxSalary: { $avg: '$salary.max' },
          minSalary: { $min: '$salary.min' },
          maxSalary: { $max: '$salary.max' }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalJobs,
          activeJobs,
          inactiveJobs,
          activeRate: Math.round((activeJobs / totalJobs) * 100)
        },
        byType: jobsByType,
        byExperience: jobsByExperience,
        recentJobs,
        salaryStats: salaryStats[0] || {}
      }
    });

  } catch (error: any) {
    console.error('Get job analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch job analytics',
      error: error.message
    });
  }
};

/**
 * Get application analytics
 * @route GET /api/dashboard/applications/analytics
 * @access Private (Admin, Employer)
 */
export const getApplicationAnalytics = async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));

    // Get application statistics
    const [totalApplications, pendingApplications, acceptedApplications, rejectedApplications] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: 'Pending' }),
      Application.countDocuments({ status: 'Accepted' }),
      Application.countDocuments({ status: 'Rejected' })
    ]);

    // Get applications by status
    const applicationsByStatus = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent applications
    const recentApplications = await Application.find({ appliedAt: { $gte: daysAgo } })
      .populate('job', 'title')
      .populate('employee', 'firstName lastName')
      .sort({ appliedAt: -1 })
      .limit(10);

    // Get applications per job
    const applicationsPerJob = await Application.aggregate([
      {
        $group: {
          _id: '$job',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'jobDetails'
        }
      },
      {
        $unwind: '$jobDetails'
      },
      {
        $project: {
          jobTitle: '$jobDetails.title',
          applicationCount: '$count'
        }
      },
      {
        $sort: { applicationCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalApplications,
          pendingApplications,
          acceptedApplications,
          rejectedApplications,
          acceptanceRate: Math.round((acceptedApplications / totalApplications) * 100)
        },
        byStatus: applicationsByStatus,
        recentApplications,
        topJobs: applicationsPerJob
      }
    });

  } catch (error: any) {
    console.error('Get application analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch application analytics',
      error: error.message
    });
  }
};

/**
 * Get user analytics
 * @route GET /api/dashboard/users/analytics
 * @access Private (Admin)
 */
export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));

    // Get user counts
    const [totalEmployees, totalEmployers] = await Promise.all([
      Employee.countDocuments(),
      Employer.countDocuments()
    ]);

    // Get recent registrations
    const [recentEmployees, recentEmployers] = await Promise.all([
      Employee.countDocuments({ createdAt: { $gte: daysAgo } }),
      Employer.countDocuments({ createdAt: { $gte: daysAgo } })
    ]);

    // Get users by experience level
    const employeesByExperience = await Employee.aggregate([
      {
        $group: {
          _id: '$experience',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get users by education
    const employeesByEducation = await Employee.aggregate([
      {
        $group: {
          _id: '$education',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top skills
    const topSkills = await Employee.aggregate([
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalEmployees,
          totalEmployers,
          totalUsers: totalEmployees + totalEmployers
        },
        recentActivity: {
          newEmployees: recentEmployees,
          newEmployers: recentEmployers
        },
        employeesByExperience,
        employeesByEducation,
        topSkills
      }
    });

  } catch (error: any) {
    console.error('Get user analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics',
      error: error.message
    });
  }
};

/**
 * Get revenue statistics
 * @route GET /api/dashboard/revenue
 * @access Private (Admin)
 */
export const getRevenueStats = async (req: Request, res: Response) => {
  try {
    // This is a placeholder for revenue statistics
    // You would implement actual revenue tracking based on your business model
    
    const revenueData = {
      totalRevenue: 0,
      monthlyRevenue: 0,
      revenueGrowth: 0,
      topRevenueSources: [],
      revenueByMonth: []
    };

    return res.status(200).json({
      success: true,
      data: revenueData,
      message: 'Revenue tracking not implemented yet'
    });

  } catch (error: any) {
    console.error('Get revenue stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue statistics',
      error: error.message
    });
  }
};

/**
 * Get top performing jobs
 * @route GET /api/dashboard/jobs/top
 * @access Private (Admin, Employer)
 */
export const getTopJobs = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    // Get jobs with most applications
    const topJobsByApplications = await Application.aggregate([
      {
        $group: {
          _id: '$job',
          applicationCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'jobDetails'
        }
      },
      {
        $unwind: '$jobDetails'
      },
      {
        $project: {
          title: '$jobDetails.title',
          company: '$jobDetails.employer',
          location: '$jobDetails.location',
          applicationCount: 1,
          salary: '$jobDetails.salary',
          status: '$jobDetails.status'
        }
      },
      {
        $sort: { applicationCount: -1 }
      },
      {
        $limit: Number(limit)
      }
    ]);

    // Get jobs with most views
    const topJobsByViews = await Job.find()
      .sort({ viewsCount: -1 })
      .limit(Number(limit))
      .populate('employer', 'companyName');

    return res.status(200).json({
      success: true,
      data: {
        byApplications: topJobsByApplications,
        byViews: topJobsByViews
      }
    });

  } catch (error: any) {
    console.error('Get top jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch top jobs',
      error: error.message
    });
  }
};

/**
 * Get recent activity
 * @route GET /api/dashboard/activity
 * @access Private (Admin)
 */
export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 7);

    // Get recent activities from different collections
    const [recentJobs, recentApplications, recentEmployees, recentEmployers] = await Promise.all([
      Job.find({ createdAt: { $gte: daysAgo } })
        .populate('employer', 'companyName')
        .sort({ createdAt: -1 })
        .limit(Number(limit)),
      Application.find({ appliedAt: { $gte: daysAgo } })
        .populate('job', 'title')
        .populate('employee', 'firstName lastName')
        .sort({ appliedAt: -1 })
        .limit(Number(limit)),
      Employee.find({ createdAt: { $gte: daysAgo } })
        .select('firstName lastName email createdAt')
        .sort({ createdAt: -1 })
        .limit(Number(limit)),
      Employer.find({ createdAt: { $gte: daysAgo } })
        .select('companyName email createdAt')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
    ]);

    // Combine and sort all activities
    const activities = [
      ...recentJobs.map(job => ({
        type: 'job_created',
        data: job,
        timestamp: job.createdAt
      })),
      ...recentApplications.map(app => ({
        type: 'application_submitted',
        data: app,
        timestamp: app.appliedAt
      })),
      ...recentEmployees.map(emp => ({
        type: 'employee_registered',
        data: emp,
        timestamp: emp.createdAt
      })),
      ...recentEmployers.map(emp => ({
        type: 'employer_registered',
        data: emp,
        timestamp: emp.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return res.status(200).json({
      success: true,
      data: activities.slice(0, Number(limit))
    });

  } catch (error: any) {
    console.error('Get recent activity error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message
    });
  }
}; 