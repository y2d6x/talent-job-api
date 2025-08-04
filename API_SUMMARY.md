# Jobs API - Frontend Integration Guide

## 🚀 API Overview
**Base URL**: `http://localhost:3000` (development)
**Environment**: Node.js + Express + TypeScript + MongoDB

---

## 📊 Database Models & Data Structures

### 1. **Employee Model** (Job Seekers)
```typescript
interface Employee {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
  fullName: string; // Virtual field
  
  jobInfo: {
    jobTitle: string;
    skills: string[];
    experienceDescription: string;
    experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'other';
    yearsOfExperience: number;
    educationalStatus: string;
    lastWork?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. **Employer Model** (Companies)
```typescript
interface Employer {
  _id: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
  
  details: {
    industry: string;
    contactName: string;
    contactPosition: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. **Job Model** (Job Postings)
```typescript
interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string;
  type: 'Internship' | 'Part Time' | 'Hybrid' | 'Full time' | 'Freelance';
  location?: string;
  isRemote: boolean;
  
  salary: {
    min: number;
    max: number;
    currency: string; // Default: 'USD'
  };
  
  experience: 'Entry' | 'Mid' | 'Senior';
  education: 'HighSchool' | 'Bachelor' | 'Bachelor Student' | 'Master' | 'Other';
  skills: string[];
  status: 'Active' | 'Inactive';
  hoursOfWork: string;
  
  employer: string; // Employer ID
  applicationsCount: number;
  viewsCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. **Application Model** (Job Applications)
```typescript
interface Application {
  _id: string;
  employee: string; // Employee ID
  job: string; // Job ID
  status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Interviewed' | 'Accepted' | 'Rejected';
  
  coverLetter?: string;
  resume?: string;
  expectedSalary?: number;
  
  appliedAt: Date;
  reviewedAt?: Date;
  employerNotes?: string;
  employeeNotes?: string;
  
  isWithdrawn: boolean;
  withdrawnAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔐 Authentication

### JWT Token Structure
```typescript
interface TokenPayload {
  userId: string;
  email: string;
  role: 'employee' | 'employer' | 'admin';
}
```

### Authentication Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 📡 API Endpoints (Planned)

### **Authentication Routes**
```
POST /api/auth/register/employee    - Employee registration
POST /api/auth/register/employer    - Employer registration
POST /api/auth/login               - Login (both types)
POST /api/auth/logout              - Logout
POST /api/auth/refresh             - Refresh token
GET  /api/auth/profile             - Get current user profile
PUT  /api/auth/profile             - Update profile
```

### **Employee Routes**
```
GET    /api/employees              - Get all employees (admin)
GET    /api/employees/:id          - Get employee by ID
PUT    /api/employees/:id          - Update employee profile
DELETE /api/employees/:id          - Delete employee (admin)
```

### **Employer Routes**
```
GET    /api/employers              - Get all employers (admin)
GET    /api/employers/:id          - Get employer by ID
PUT    /api/employers/:id          - Update employer profile
DELETE /api/employers/:id          - Delete employer (admin)
```

### **Job Routes**
```
GET    /api/jobs                   - Get all jobs (with filters)
GET    /api/jobs/:id               - Get job by ID
POST   /api/jobs                   - Create job (employer only)
PUT    /api/jobs/:id               - Update job (owner only)
DELETE /api/jobs/:id               - Delete job (owner only)
GET    /api/jobs/search            - Search jobs
GET    /api/jobs/my-jobs           - Get employer's jobs
```

### **Application Routes**
```
GET    /api/applications           - Get user's applications
GET    /api/applications/:id       - Get application by ID
POST   /api/applications           - Apply for job (employee)
PUT    /api/applications/:id       - Update application status
DELETE /api/applications/:id       - Withdraw application
GET    /api/applications/job/:id   - Get applications for job (employer)
```

---

## 🔍 Search & Filtering

### Job Search Parameters
```typescript
interface JobSearchParams {
  title?: string;           // Search in job title
  location?: string;        // Job location
  type?: JobType;          // Job type filter
  experience?: Experience;  // Experience level
  salary_min?: number;      // Minimum salary
  salary_max?: number;      // Maximum salary
  isRemote?: boolean;       // Remote work filter
  skills?: string[];        // Required skills
  page?: number;           // Pagination
  limit?: number;          // Results per page
}
```

### Employee Search Parameters
```typescript
interface EmployeeSearchParams {
  skills?: string[];        // Skills filter
  experience?: Experience;  // Experience level
  location?: string;        // Location
  education?: string;       // Education level
}
```

---

## 📝 Request/Response Examples

### Employee Registration
```typescript
// POST /api/auth/register/employee
{
  "username": "john_doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "gender": "male",
  "age": 25,
  "jobInfo": {
    "jobTitle": "Software Developer",
    "skills": ["JavaScript", "React", "Node.js"],
    "experienceDescription": "Full-stack development experience",
    "experienceLevel": "mid",
    "yearsOfExperience": 3,
    "educationalStatus": "Bachelor's Degree"
  }
}

// Response
{
  "success": true,
  "data": {
    "user": { /* employee data */ },
    "token": "jwt_token_here"
  }
}
```

### Job Creation
```typescript
// POST /api/jobs
{
  "title": "Senior React Developer",
  "description": "We are looking for an experienced React developer...",
  "requirements": ["React", "TypeScript", "5+ years experience"],
  "responsibilities": "Develop and maintain web applications...",
  "type": "Full time",
  "location": "New York, NY",
  "isRemote": false,
  "salary": {
    "min": 80000,
    "max": 120000,
    "currency": "USD"
  },
  "experience": "Senior",
  "education": "Bachelor",
  "skills": ["React", "TypeScript", "Node.js"],
  "hoursOfWork": "40 hours/week"
}

// Response
{
  "success": true,
  "data": { /* job data */ }
}
```

### Job Application
```typescript
// POST /api/applications
{
  "jobId": "job_id_here",
  "coverLetter": "I am excited to apply for this position...",
  "resume": "resume_file_url",
  "expectedSalary": 95000
}

// Response
{
  "success": true,
  "data": { /* application data */ }
}
```

---

## 🛡️ Security Features

### Password Security
- ✅ Bcrypt hashing (salt rounds: 10)
- ✅ Password comparison method
- ✅ Minimum length: 6 characters

### JWT Security
- ✅ Token expiration
- ✅ Refresh token mechanism
- ✅ Secure token storage

### Data Protection
- ✅ Password excluded from responses
- ✅ Input validation and sanitization
- ✅ CORS configuration

---

## 📊 Database Indexes (Performance)

### Job Indexes
- Text search: `title`, `description`, `skills`
- Filtering: `status`, `type`, `experience`
- Performance: `employer`, `isRemote`, `applicationsCount`

### Employee Indexes
- Text search: `jobInfo.jobTitle`, `jobInfo.skills`
- Filtering: `isActive`, `jobInfo.experienceLevel`

### Application Indexes
- Unique constraint: `employee + job`
- Filtering: `status`, `isWithdrawn`

---

## 🔧 Environment Variables Needed

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URL=your_mongodb_connection_string

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXP_IN=7d
JWT_REFRESH_EXP_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 🚀 Getting Started

### 1. Health Check
```bash
GET '/health'
```
Returns API status and environment info.

### 2. Authentication Flow
1. Register user (employee/employer)
2. Login to get JWT token
3. Include token in Authorization header
4. Use refresh token when needed

### 3. Error Handling
All errors return consistent format:
```typescript
{
  "success": false,
  "message": "Error description",
  "stack": "..." // Only in development
}
```

---

## 📞 Contact
For API questions or issues, contact the backend team.

**API Version**: 1.0.0
**Last Updated**: 8/3 3:41