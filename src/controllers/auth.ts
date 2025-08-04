import { Request, Response } from 'express';
import { Employee, Employer, Admin } from '../models/index.model';
import { generateToken } from '../config/auth';
import { RoleType } from '../models/role.model';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// ========================================
// AUTHENTICATION CONTROLLERS
// ========================================

/**
 * User Login
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Find user in any of the collections
    const user =
      (await Employee.findOne({ email })) ||
      (await Employer.findOne({ email })) ||
      (await Admin.findOne({ email }));

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Use the comparePassword method from the respective model
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken((user as { _id: { toString(): string } })._id.toString());

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

/**
 * User Registration
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  const { userType, email, password, ...userData } = req.body;

  // Validation
  if (!userType || !email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'User type, email, and password are required.' 
    });
  }

  try {
    // Determine which model to use based on user type
    let UserModel: typeof Employee | typeof Employer | typeof Admin;
    switch (userType) {
      case RoleType.Employee:
        UserModel = Employee;
        break;
      case RoleType.Employer:
        UserModel = Employer;
        break;
      case RoleType.Admin:
        UserModel = Admin;
        break;
      default:
        return res.status(400).json({ 
          success: false,
          message: 'Invalid user type' 
        });
    }

    // Check if user already exists
    const existingUser = await (UserModel as any).findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Create new user
    const newUser = await new UserModel({ 
      email, 
      password, 
      role: userType, 
      ...userData 
    }).save();

    const token = generateToken((newUser._id as unknown as { toString(): string }).toString());

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
          role: userType,
        },
        token
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
    return res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

/**
 * User Logout
 * POST /api/auth/logout
 */
export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).json({ 
    success: true,
    message: 'Logged out successfully' 
  });
};

// ========================================
// USER PROFILE CONTROLLERS
// ========================================

/**
 * Get Current User Profile
 * GET /api/auth/profile
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized' 
    });
  }

  try {
    const user =
      (await Employee.findById(userId)) ||
      (await Employer.findById(userId)) ||
      (await Admin.findById(userId));

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        ...user.toJSON(),
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

/**
 * Update User Profile
 * PUT /api/auth/profile
 */
export const updateUser = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { email, password, ...allowedUpdates } = req.body; // Disallow changing email or password directly here

  if (password) {
    return res.status(400).json({
      success: false,
      message: 'Password cannot be updated through this route.'
    });
  }

  if (!userId) {
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized' 
    });
  }

  try {
    const user =
      (await Employee.findByIdAndUpdate(userId, allowedUpdates, { new: true })) ||
      (await Employer.findByIdAndUpdate(userId, allowedUpdates, { new: true })) ||
      (await Admin.findByIdAndUpdate(userId, allowedUpdates, { new: true }));

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        ...user.toJSON(),
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

/**
 * Delete User (Admin Only)
 * DELETE /api/auth/users/:id
 */
export const deleteUser = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== RoleType.Admin) {
    return res.status(403).json({ 
      success: false,
      message: 'Forbidden - Admin access required' 
    });
  }
  
  const userId = req.params.id || req.user?._id;

  if (!userId) {
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized' 
    });
  }

  try {
    const user =
      (await Employee.findByIdAndDelete(userId)) ||
      (await Employer.findByIdAndDelete(userId)) ||
      (await Admin.findByIdAndDelete(userId));

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    return res.status(200).json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ========================================
// go to src/routes/auth.ts & middleware/auth.ts
// ========================================



