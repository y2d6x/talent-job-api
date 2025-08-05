# Job Management API Documentation

## Overview
This document describes the complete Job Management API with advanced features including filtering, search, pagination, and role-based authorization.

## Base URL
```
http://localhost:5000/api/jobs
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Jobs (Public)
**GET** `/api/jobs`

Get all active jobs with advanced filtering, search, and pagination.

#### Query Parameters:
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `search` (string) - Text search in title and description
- `type` (string) - Job type filter: 'Internship', 'Part Time', 'Hybrid', 'Full time', 'Freelance'
- `experience` (string) - Experience level: 'Entry', 'Mid', 'Senior'
- `education` (string) - Education level: 'HighSchool', 'Bachelor', 'Bachelor Student', 'Master', 'Other'
- `isRemote` (boolean) - Remote work filter
- `skills` (array) - Skills filter (multiple values)
- `location` (string) - Location search
- `minSalary` (number) - Minimum salary
- `maxSalary` (number) - Maximum salary
- `sortBy` (string, default: 'createdAt') - Sort field
- `sortOrder` (string, default: 'desc') - Sort order: 'asc' or 'desc'

#### Example Request:
```bash
GET /api/jobs?page=1&limit=10&type=Full time&experience=Mid&isRemote=true&search=developer
```

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "job_id",
      "title": "Senior Developer",
      "description": "We are looking for...",
      "requirements": ["React", "Node.js"],
      "responsibilities": "Develop and maintain...",
      "type": "Full time",
      "salary": {
        "min": 80000,
        "max": 120000,
        "currency": "USD"
      },
      "experience": "Senior",
      "education": "Bachelor",
      "skills": ["JavaScript", "React", "Node.js"],
      "status": "Active",
      "hoursOfWork": "40 hours/week",
      "employer": {
        "_id": "employer_id",
        "companyName": "Tech Corp",
        "email": "hr@techcorp.com"
      },
      "location": "New York",
      "isRemote": true,
      "applicationsCount": 15,
      "viewsCount": 150,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalJobs": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. Get Job by ID (Public)
**GET** `/api/jobs/:id`

Get a specific job by ID. Automatically increments the view count.

#### Example Request:
```bash
GET /api/jobs/64f5a1b2c3d4e5f6a7b8c9d0
```

#### Response:
```json
{
  "success": true,
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "title": "Senior Developer",
    "description": "We are looking for...",
    "requirements": ["React", "Node.js"],
    "responsibilities": "Develop and maintain...",
    "type": "Full time",
    "salary": {
      "min": 80000,
      "max": 120000,
      "currency": "USD"
    },
    "experience": "Senior",
    "education": "Bachelor",
    "skills": ["JavaScript", "React", "Node.js"],
    "status": "Active",
    "hoursOfWork": "40 hours/week",
    "employer": {
      "_id": "employer_id",
      "companyName": "Tech Corp",
      "email": "hr@techcorp.com",
      "details": {
        "industry": "Technology",
        "contactName": "John Doe",
        "contactPosition": "HR Manager"
      }
    },
    "location": "New York",
    "isRemote": true,
    "applicationsCount": 15,
    "viewsCount": 151,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Create Job (Protected - Employer/Admin)
**POST** `/api/jobs`

Create a new job posting.

#### Headers:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Request Body:
```json
{
  "title": "Senior Developer",
  "description": "We are looking for an experienced developer...",
  "requirements": [
    "5+ years of experience",
    "React and Node.js expertise",
    "Team leadership skills"
  ],
  "responsibilities": "Develop and maintain web applications...",
  "type": "Full time",
  "salary": {
    "min": 80000,
    "max": 120000,
    "currency": "USD"
  },
  "experience": "Senior",
  "education": "Bachelor",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "status": "Active",
  "hoursOfWork": "40 hours/week",
  "location": "New York",
  "isRemote": true
}
```

#### Response:
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "_id": "new_job_id",
    "title": "Senior Developer",
    "employer": "employer_user_id",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Job (Protected - Job Owner/Admin)
**PUT** `/api/jobs/:id`

Update an existing job. Only the job owner or admin can update.

#### Headers:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Request Body:
```json
{
  "title": "Updated Senior Developer",
  "salary": {
    "min": 90000,
    "max": 130000,
    "currency": "USD"
  },
  "status": "Inactive"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Job updated successfully",
  "data": {
    "_id": "job_id",
    "title": "Updated Senior Developer",
    "salary": {
      "min": 90000,
      "max": 130000,
      "currency": "USD"
    },
    "status": "Inactive",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

### 5. Delete Job (Protected - Job Owner/Admin)
**DELETE** `/api/jobs/:id`

Delete a job. Only the job owner or admin can delete.

#### Headers:
```
Authorization: Bearer <jwt-token>
```

#### Response:
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

### 6. Get Employer Jobs (Protected - Employer)
**GET** `/api/jobs/employer/jobs`

Get all jobs posted by the current employer.

#### Headers:
```
Authorization: Bearer <jwt-token>
```

#### Query Parameters:
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `status` (string) - Filter by status: 'Active' or 'Inactive'

#### Example Request:
```bash
GET /api/jobs/employer/jobs?page=1&limit=10&status=Active
```

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "job_id",
      "title": "Senior Developer",
      "status": "Active",
      "applicationsCount": 15,
      "viewsCount": 150,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalJobs": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 7. Get Employer Job Statistics (Protected - Employer)
**GET** `/api/jobs/employer/stats`

Get comprehensive statistics for the employer's jobs.

#### Headers:
```
Authorization: Bearer <jwt-token>
```

#### Response:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalJobs": 15,
      "activeJobs": 12,
      "inactiveJobs": 3,
      "totalViews": 1250,
      "totalApplications": 85,
      "avgViews": 83.33,
      "avgApplications": 5.67
    },
    "byType": [
      {
        "_id": "Full time",
        "count": 10
      },
      {
        "_id": "Part Time",
        "count": 3
      },
      {
        "_id": "Internship",
        "count": 2
      }
    ],
    "byExperience": [
      {
        "_id": "Senior",
        "count": 8
      },
      {
        "_id": "Mid",
        "count": 5
      },
      {
        "_id": "Entry",
        "count": 2
      }
    ]
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Title is required",
    "Invalid job type"
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You can only modify your own jobs"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Job not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Features Implemented

### ✅ Core Features
- [x] Create Job (Employer/Admin)
- [x] Get All Jobs (Public)
- [x] Get Job by ID (Public)
- [x] Update Job (Job Owner/Admin)
- [x] Delete Job (Job Owner/Admin)
- [x] Get Employer Jobs (Employer)

### ✅ Advanced Features
- [x] **Pagination** - Page-based results with metadata
- [x] **Filtering** - By type, experience, education, remote, skills, location, salary
- [x] **Search** - Text search in title and description
- [x] **Sorting** - By any field with asc/desc order
- [x] **Authorization** - Role-based access control
- [x] **Job Ownership** - Employers can only modify their own jobs
- [x] **View Count** - Automatic increment on job view
- [x] **Statistics** - Comprehensive employer job analytics
- [x] **Validation** - Comprehensive input validation
- [x] **Error Handling** - Proper error responses

### ✅ Security Features
- [x] JWT Authentication
- [x] Role-based Authorization
- [x] Job Ownership Validation
- [x] Input Validation and Sanitization
- [x] SQL Injection Prevention (MongoDB)
- [x] XSS Protection

### ✅ Performance Features
- [x] Database Indexing
- [x] Pagination for Large Datasets
- [x] Efficient Queries
- [x] Response Caching Ready

## Usage Examples

### Frontend Integration

#### Get Jobs with Filters
```javascript
const getJobs = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/jobs?${params}`);
  const data = await response.json();
  return data;
};

// Usage
const jobs = await getJobs({
  page: 1,
  limit: 10,
  type: 'Full time',
  experience: 'Senior',
  isRemote: 'true',
  search: 'developer'
});
```

#### Create Job
```javascript
const createJob = async (jobData) => {
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(jobData)
  });
  return response.json();
};
```

#### Get Employer Statistics
```javascript
const getStats = async () => {
  const response = await fetch('/api/jobs/employer/stats', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

## Database Schema

The Job model includes:
- Basic job information (title, description, requirements)
- Salary range with currency
- Job type, experience, and education levels
- Skills array
- Status (Active/Inactive)
- Employer reference
- View and application counters
- Timestamps

## Middleware Stack

1. **Authentication** - `authenticateToken`
2. **Authorization** - `isEmployer`, `isAdminOrEmployer`
3. **Validation** - `validateJobData`
4. **Ownership** - `validateJobOwnership`
5. **Analytics** - `incrementJobViews`

This comprehensive job management system provides all the features requested with proper security, validation, and performance optimizations. 