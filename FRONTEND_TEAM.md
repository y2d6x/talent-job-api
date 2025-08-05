# 🎨 Frontend Team Guide - Jobs API

## 📋 Quick Start

### 🌐 API Base URLs
```javascript
// Development
const API_BASE = 'http://localhost:3000';

// Production (Vercel)
const API_BASE = 'https://talent-lms4cwmvt-yousifs-projects-6b79b898.vercel.app';
```

### 🔑 Environment Variables
```env
# Frontend (.env)
REACT_APP_API_URL=https://talent-lms4cwmvt-yousifs-projects-6b79b898.vercel.app
REACT_APP_LOCAL_API_URL=http://localhost:3000
```

---

## 🔐 Authentication Flow

### 1. User Registration
```javascript
// POST /api/auth/register
const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });
  
  return response.json();
};

// Employee Registration
const employeeData = {
  userType: "employee",
  email: "ahmed.dev@example.com",
  password: "password123",
  firstName: "Ahmed",
  lastName: "Mohammed",
  username: "ahmed_dev",
  gender: "male",
  age: 28,
  jobInfo: {
    jobTitle: "Senior Software Developer",
    skills: ["JavaScript", "React", "Node.js"],
    experienceDescription: "Full-stack development with 5 years experience",
    experienceLevel: "senior",
    yearsOfExperience: 5,
    educationalStatus: "Bachelor in Computer Science"
  }
};

// Employer Registration
const employerData = {
  userType: "employer",
  email: "ceo@techcorp.com",
  password: "password123",
  companyName: "TechCorp Solutions",
  phoneNumber: "+971501234567",
  details: {
    industry: "Technology",
    contactName: "Mohammed Al-Rashid",
    contactPosition: "CEO"
  }
};
```

### 2. User Login
```javascript
// POST /api/auth/login
const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  
  return data;
};
```

### 3. Authentication Middleware
```javascript
// Add token to requests
const authHeaders = {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'application/json'
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

// Get current user
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
```

---

## 👥 User Types & Data Models

### Employee (Job Seeker)
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

### Employer (Company)
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

### Job Posting
```typescript
interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string;
  type: 'Full time' | 'Part time' | 'Contract' | 'Internship';
  location: string;
  isRemote: boolean;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  experience: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  education: string;
  skills: string[];
  hoursOfWork: string;
  employer: string; // Employer ID
  status: 'active' | 'inactive' | 'closed';
  applicationsCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🏢 Job Management

### 1. Create Job Posting
```javascript
// POST /api/jobs
const createJob = async (jobData) => {
  const response = await fetch(`${API_BASE}/api/jobs`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(jobData)
  });
  
  return response.json();
};

const newJob = {
  title: "Senior React Developer",
  description: "We are looking for an experienced React developer...",
  requirements: ["React", "TypeScript", "5+ years experience"],
  responsibilities: "Develop and maintain web applications...",
  type: "Full time",
  location: "New York, NY",
  isRemote: false,
  salary: {
    min: 80000,
    max: 120000,
    currency: "USD"
  },
  experience: "Senior",
  education: "Bachelor",
  skills: ["React", "TypeScript", "Node.js"],
  hoursOfWork: "40 hours/week"
};
```

### 2. Get All Jobs
```javascript
// GET /api/jobs
const getJobs = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`${API_BASE}/api/jobs?${queryParams}`);
  
  return response.json();
};

// Example filters
const filters = {
  type: 'Full time',
  experience: 'Senior',
  isRemote: 'true',
  location: 'New York'
};
```

### 3. Get Job by ID
```javascript
// GET /api/jobs/:id
const getJobById = async (jobId) => {
  const response = await fetch(`${API_BASE}/api/jobs/${jobId}`);
  
  return response.json();
};
```

### 4. Update Job
```javascript
// PUT /api/jobs/:id
const updateJob = async (jobId, jobData) => {
  const response = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(jobData)
  });
  
  return response.json();
};
```

### 5. Delete Job
```javascript
// DELETE /api/jobs/:id
const deleteJob = async (jobId) => {
  const response = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  
  return response.json();
};
```

---

## 📝 Job Applications

### 1. Apply for Job
```javascript
// POST /api/applications
const applyForJob = async (applicationData) => {
  const response = await fetch(`${API_BASE}/api/applications`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(applicationData)
  });
  
  return response.json();
};

const application = {
  jobId: "job_id_here",
  coverLetter: "I am excited to apply for this position...",
  resume: "resume_file_url",
  expectedSalary: 95000
};
```

### 2. Get User Applications
```javascript
// GET /api/applications
const getUserApplications = async () => {
  const response = await fetch(`${API_BASE}/api/applications`, {
    headers: authHeaders
  });
  
  return response.json();
};
```

### 3. Get Job Applications (Employer)
```javascript
// GET /api/jobs/:id/applications
const getJobApplications = async (jobId) => {
  const response = await fetch(`${API_BASE}/api/jobs/${jobId}/applications`, {
    headers: authHeaders
  });
  
  return response.json();
};
```

---

## 👤 User Management

### 1. Get Current User
```javascript
// GET /api/auth/profile
const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE}/api/auth/profile`, {
    headers: authHeaders
  });
  
  return response.json();
};
```

### 2. Update User Profile
```javascript
// PUT /api/auth/profile
const updateProfile = async (userData) => {
  const response = await fetch(`${API_BASE}/api/auth/profile`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(userData)
  });
  
  return response.json();
};
```

### 3. Delete User Account
```javascript
// DELETE /api/auth/profile
const deleteAccount = async () => {
  const response = await fetch(`${API_BASE}/api/auth/profile`, {
    method: 'DELETE',
    headers: authHeaders
  });
  
  return response.json();
};
```

---

## 🔍 Search & Filtering

### Job Search
```javascript
// Search jobs with filters
const searchJobs = async (searchParams) => {
  const queryParams = new URLSearchParams({
    search: searchParams.query,
    type: searchParams.type,
    experience: searchParams.experience,
    location: searchParams.location,
    isRemote: searchParams.isRemote,
    minSalary: searchParams.minSalary,
    maxSalary: searchParams.maxSalary
  });
  
  const response = await fetch(`${API_BASE}/api/jobs/search?${queryParams}`);
  
  return response.json();
};
```

### Employee Search
```javascript
// Search employees
const searchEmployees = async (searchParams) => {
  const queryParams = new URLSearchParams({
    search: searchParams.query,
    experienceLevel: searchParams.experienceLevel,
    skills: searchParams.skills.join(',')
  });
  
  const response = await fetch(`${API_BASE}/api/employees/search?${queryParams}`);
  
  return response.json();
};
```

---

## 📊 Response Formats

### Success Response
```javascript
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response
```javascript
{
  "success": false,
  "message": "Error description",
  "stack": "..." // Only in development
}
```

### Pagination Response
```javascript
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

---

## 🛡️ Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Error Handling Example
```javascript
const handleApiCall = async (apiFunction) => {
  try {
    const response = await apiFunction();
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.message === 'Unauthorized') {
      // Redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    
    throw error;
  }
};
```

---

## 🔄 Token Refresh

### Automatic Token Refresh
```javascript
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token');
  }
  
  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    return data.data.accessToken;
  } else {
    throw new Error('Token refresh failed');
  }
};

// Interceptor for automatic token refresh
const apiCallWithRefresh = async (apiFunction) => {
  try {
    return await apiFunction();
  } catch (error) {
    if (error.message === 'Unauthorized') {
      try {
        await refreshToken();
        return await apiFunction(); // Retry with new token
      } catch (refreshError) {
        // Redirect to login
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }
    throw error;
  }
};
```

---

## 📱 React Hooks Examples

### Authentication Hook
```javascript
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      getCurrentUser()
        .then(data => setUser(data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return { user, loading, login, logout };
};
```

### Jobs Hook
```javascript
import { useState, useEffect } from 'react';

export const useJobs = (filters = {}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getJobs(filters);
        setJobs(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters]);

  return { jobs, loading, error };
};
```

---

## 🎨 UI Components Examples

### Login Form
```javascript
import React, { useState } from 'react';

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await onLogin(formData);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

### Job Card
```javascript
const JobCard = ({ job }) => {
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p>{job.companyName}</p>
      <p>{job.location}</p>
      <p>${job.salary.min} - ${job.salary.max}</p>
      <p>{job.type}</p>
      <button onClick={() => applyForJob(job._id)}>
        Apply Now
      </button>
    </div>
  );
};
```

---

## 🚀 Testing Data

### Test Users Available
```javascript
// Employees
const testEmployees = [
  {
    email: "ahmed.dev@example.com",
    password: "password123"
  },
  {
    email: "sara.designer@example.com", 
    password: "password123"
  },
  {
    email: "omar.qa@example.com",
    password: "password123"
  },
  {
    email: "fatima.data@example.com",
    password: "password123"
  },
  {
    email: "khalid.mobile@example.com",
    password: "password123"
  }
];

// Employers
const testEmployers = [
  {
    email: "ceo@techcorp.com",
    password: "password123"
  },
  {
    email: "owner@designstudio.com",
    password: "password123"
  },
  {
    email: "founder@startup.com",
    password: "password123"
  },
  {
    email: "director@consulting.com",
    password: "password123"
  },
  {
    email: "manager@finance.com",
    password: "password123"
  }
];
```

---

## 📞 Support

### API Health Check
```javascript
// GET /health
const checkApiHealth = async () => {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
};
```

### Contact Information
- **Backend Team**: Available for API questions
- **API Version**: 1.0.0
- **Last Updated**: August 5, 2025

---

## 🔗 Useful Links

- **API Documentation**: Check this file for complete API reference
- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: Database management
- **GitHub Repository**: Source code

---

**🎉 Happy Coding! The API is ready for your frontend development!** 