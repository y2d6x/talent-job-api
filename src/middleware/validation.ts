import { Request, Response, NextFunction } from 'express';
import { createError } from '../utils/errorHandler';

export const validateJobInput = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, requirements, responsibilities, type, salary, experience, education, skills } = req.body;

  const errors: string[] = [];

  // Required fields validation
  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (!requirements || !Array.isArray(requirements) || requirements.length === 0) {
    errors.push('At least one requirement is required');
  }

  if (!responsibilities || responsibilities.trim().length < 10) {
    errors.push('Responsibilities must be at least 10 characters long');
  }

  // Type validation
  const validTypes = ['Internship', 'Part Time', 'Hybrid', 'Full time', 'Freelance'];
  if (!type || !validTypes.includes(type)) {
    errors.push('Invalid job type');
  }

  // Salary validation
  if (!salary || typeof salary !== 'object') {
    errors.push('Salary object is required');
  } else {
    if (!salary.min || salary.min < 0) {
      errors.push('Minimum salary must be a positive number');
    }
    if (!salary.max || salary.max < salary.min) {
      errors.push('Maximum salary must be greater than minimum salary');
    }
  }

  // Experience validation
  const validExperiences = ['Entry', 'Mid', 'Senior'];
  if (!experience || !validExperiences.includes(experience)) {
    errors.push('Invalid experience level');
  }

  // Education validation
  const validEducations = ['HighSchool', 'Bachelor', 'Bachelor Student', 'Master', 'Other'];
  if (!education || !validEducations.includes(education)) {
    errors.push('Invalid education level');
  }

  // Skills validation
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    errors.push('At least one skill is required');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
    return;
  }

  next();
};

export const validateApplicationInput = (req: Request, res: Response, next: NextFunction): void => {
  const { jobId, coverLetter, expectedSalary } = req.body;

  const errors: string[] = [];

  if (!jobId) {
    errors.push('Job ID is required');
  }

  if (!coverLetter || coverLetter.trim().length < 10) {
    errors.push('Cover letter must be at least 10 characters long');
  }

  if (!expectedSalary || expectedSalary < 0) {
    errors.push('Expected salary must be a positive number');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
    return;
  }

  next();
};

export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const { page, limit } = req.query;

  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    res.status(400).json({
      success: false,
      message: 'Page must be a positive number'
    });
    return;
  }

  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
    return;
  }

  next();
};

export const validateUserUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { firstName, lastName, email, phone } = req.body;
  const errors: string[] = [];

  if (firstName && firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  if (lastName && lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }

  if (email && !email.includes('@')) {
    errors.push('Invalid email format');
  }

  if (phone && phone.trim().length < 10) {
    errors.push('Phone number must be at least 10 digits');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
    return;
  }

  next();
};

export const validatePasswordChange = (req: Request, res: Response, next: NextFunction): void => {
  const { currentPassword, newPassword } = req.body;
  const errors: string[] = [];

  if (!currentPassword) {
    errors.push('Current password is required');
  }

  if (!newPassword || newPassword.length < 6) {
    errors.push('New password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
    return;
  }

  next();
};

export const validateSearchParams = (req: Request, res: Response, next: NextFunction): void => {
  const { query, page, limit, sort } = req.query;
  const errors: string[] = [];

  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    errors.push('Page must be a positive number');
  }

  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    errors.push('Limit must be between 1 and 100');
  }

  if (sort && typeof sort !== 'string') {
    errors.push('Sort must be a string');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
    return;
  }

  next();
}; 