import { Request, Response } from 'express';
import { Employee, Employer, Admin } from '../models/index.model';
import { RoleType } from '../models/role.model';
import bcrypt from 'bcryptjs';

// ========================================
// USER MANAGEMENT CONTROLLERS
// ========================================

/**
 * Get all users (Admin only)
 * @route GET /api/users
 * @access Private (Admin)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    
    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users from all collections
    const [employees, employers, admins] = await Promise.all([
      Employee.find(query).skip(skip).limit(Number(limit)).select('-password'),
      Employer.find(query).skip(skip).limit(Number(limit)).select('-password'),
      Admin.find(query).skip(skip).limit(Number(limit)).select('-password')
    ]);

    const allUsers = [...employees, ...employers, ...admins];
    const total = await Promise.all([
      Employee.countDocuments(query),
      Employer.countDocuments(query),
      Admin.countDocuments(query)
    ]);

    const totalUsers = total.reduce((sum, count) => sum + count, 0);

    return res.status(200).json({
      success: true,
      data: allUsers,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalUsers / Number(limit)),
        totalUsers,
        hasNextPage: Number(page) * Number(limit) < totalUsers,
        hasPrevPage: Number(page) > 1
      }
    });

  } catch (error: any) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

/**
 * Search users
 * @route GET /api/users/search
 * @access Private (Admin)
 */
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query, role } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchQuery: any = {
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    };

    if (role) {
      searchQuery.role = role;
    }

    const [employees, employers, admins] = await Promise.all([
      Employee.find(searchQuery).select('-password'),
      Employer.find(searchQuery).select('-password'),
      Admin.find(searchQuery).select('-password')
    ]);

    const results = [...employees, ...employers, ...admins];

    return res.status(200).json({
      success: true,
      data: results,
      total: results.length
    });

  } catch (error: any) {
    console.error('Search users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: error.message
    });
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private (Admin, Self)
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if user is requesting their own data or is admin
    if (req.user.role !== RoleType.Admin && id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Search in all collections
    const user = 
      (await Employee.findById(id).select('-password')) ||
      (await Employer.findById(id).select('-password')) ||
      (await Admin.findById(id).select('-password'));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error: any) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/users/:id
 * @access Private (Admin, Self)
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    // Check permissions
    if (req.user.role !== RoleType.Admin && id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find user in appropriate collection
    const user = 
      (await Employee.findById(id)) ||
      (await Employer.findById(id)) ||
      (await Admin.findById(id));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user data
    Object.keys(updateData).forEach(key => {
      if (key !== 'password' && key !== 'role') {
        (user as any)[key] = updateData[key];
      }
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: userResponse
    });

  } catch (error: any) {
    console.error('Update user profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message
    });
  }
};

/**
 * Change password
 * @route PUT /api/users/:id/password
 * @access Private (Self)
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Check if user is changing their own password
    if (id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only change your own password'
      });
    }

    // Find user
    const user = 
      (await Employee.findById(id)) ||
      (await Employer.findById(id)) ||
      (await Admin.findById(id));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error: any) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

/**
 * Upload profile picture
 * @route POST /api/users/:id/avatar
 * @access Private (Self)
 */
export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check permissions
    if (id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only upload your own profile picture'
      });
    }

    // For now, return a placeholder response
    // You'll need to implement file upload logic
    return res.status(200).json({
      success: true,
      message: 'Profile picture upload endpoint - implement file upload logic'
    });

  } catch (error: any) {
    console.error('Upload profile picture error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
};

/**
 * Delete user
 * @route DELETE /api/users/:id
 * @access Private (Admin)
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find and delete user from appropriate collection
    const deletedUser = 
      (await Employee.findByIdAndDelete(id)) ||
      (await Employer.findByIdAndDelete(id)) ||
      (await Admin.findByIdAndDelete(id));

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

/**
 * Get user statistics
 * @route GET /api/users/stats/overview
 * @access Private (Admin)
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const [employeeCount, employerCount, adminCount] = await Promise.all([
      Employee.countDocuments(),
      Employer.countDocuments(),
      Admin.countDocuments()
    ]);

    const totalUsers = employeeCount + employerCount + adminCount;

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentEmployees, recentEmployers, recentAdmins] = await Promise.all([
      Employee.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Employer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Admin.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    const recentRegistrations = recentEmployees + recentEmployers + recentAdmins;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        employeeCount,
        employerCount,
        adminCount,
        recentRegistrations,
        userDistribution: {
          employees: Math.round((employeeCount / totalUsers) * 100),
          employers: Math.round((employerCount / totalUsers) * 100),
          admins: Math.round((adminCount / totalUsers) * 100)
        }
      }
    });

  } catch (error: any) {
    console.error('Get user stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
}; 