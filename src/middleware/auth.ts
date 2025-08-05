import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/auth';
import { Employee, Employer, Admin } from '../models/index.model';
import { RoleType } from '../models/role.model'; // Import RoleType

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.cookies?.token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token) as any;
    
    if (!decoded || !decoded.userId) { // Changed from id to userId to match token payload
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
      return;
    }

    // Find user in database
    const user = 
      (await Employee.findById(decoded.userId)) || // Changed from id to userId
      (await Employer.findById(decoded.userId)) || // Changed from id to userId
      (await Admin.findById(decoded.userId)); // Changed from id to userId

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
    return;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized - Authentication required'
    });
    return;
  }
  next();
};

/**
 * Check if user is admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== RoleType.Admin) { // Use Enum
    res.status(403).json({
      success: false,
      message: 'Forbidden - Admin access required'
    });
    return;
  }
  next();
};

/**
 * Check if user is employee
 */
export const isEmployee = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== RoleType.Employee) { // Use Enum
    res.status(403).json({
      success: false,
      message: 'Forbidden - Employee access required'
    });
    return;
  }
  next();
};

/**
 * Check if user is employer
 */
export const isEmployer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== RoleType.Employer) { // Use Enum
    res.status(403).json({
      success: false,
      message: 'Forbidden - Employer access required'
    });
    return;
  }
  next();
};

/**
 * Check if user is admin or employer
 */
export const isAdminOrEmployer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== RoleType.Admin && req.user.role !== RoleType.Employer)) {
    res.status(403).json({
      success: false,
      message: 'Forbidden - Admin or Employer access required'
    });
    return;
  }
  next();
};

/**
 * Check if user is employee or employer
 */
export const isEmployeeOrEmployer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'employee' && req.user.role !== 'employer')) {
    res.status(403).json({
      success: false,
      message: 'Forbidden - Employee or Employer access required'
    });
    return;
  }
  next();
};
