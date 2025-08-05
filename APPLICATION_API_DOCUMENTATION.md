# Application API Documentation

## Overview
The Application API provides endpoints for managing job applications between employees and employers. This includes applying to jobs, viewing applications, updating status, and withdrawing applications.

## Base URL
```
/api/applications
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Apply to a Job
**POST** `/api/applications/apply`

Allows an employee to apply to a job.

**Access:** Employee only

**Request Body:**
```json
{
  "jobId": "string (required)",
  "coverLetter": "string (optional)",
  "expectedSalary": "number (optional)",
  "resume": "string (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "_id": "application_id",
    "employee": "employee_id",
    "job": {
      "_id": "job_id",
      "title": "Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco"
    },
    "status": "Pending",
    "coverLetter": "I am excited to apply...",
    "expectedSalary": 80000,
    "appliedAt": "2024-01-15T10:30:00Z",
    "isWithdrawn": false
  }
}
```

**Error Responses:**
- `400` - Job not found, job inactive, already applied, validation errors
- `401` - Unauthorized
- `403` - Employee access required
- `500` - Server error

---

### 2. Get Employee Applications
**GET** `/api/applications/employee`

Retrieves all applications submitted by the current employee.

**Access:** Employee only

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "application_id",
      "job": {
        "_id": "job_id",
        "title": "Software Engineer",
        "company": "Tech Corp",
        "location": "San Francisco",
        "salary": {
          "min": 70000,
          "max": 90000
        },
        "type": "Full time",
        "isActive": true
      },
      "status": "Pending",
      "coverLetter": "I am excited to apply...",
      "expectedSalary": 80000,
      "appliedAt": "2024-01-15T10:30:00Z",
      "isWithdrawn": false
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalApplications": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 3. Get Employer Applications
**GET** `/api/applications/employer`

Retrieves all applications for jobs posted by the current employer.

**Access:** Employer only

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `jobId` (optional): Filter by specific job

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "application_id",
      "job": {
        "_id": "job_id",
        "title": "Software Engineer",
        "company": "Tech Corp",
        "location": "San Francisco",
        "salary": {
          "min": 70000,
          "max": 90000
        },
        "type": "Full time"
      },
      "employee": {
        "_id": "employee_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "status": "Pending",
      "coverLetter": "I am excited to apply...",
      "expectedSalary": 80000,
      "appliedAt": "2024-01-15T10:30:00Z",
      "isWithdrawn": false
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalApplications": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 4. Update Application Status
**PUT** `/api/applications/:id/status`

Allows employer or admin to update the status of an application.

**Access:** Employer, Admin

**Request Body:**
```json
{
  "status": "string (required) - one of: Pending, Reviewed, Shortlisted, Interviewed, Accepted, Rejected",
  "employerNotes": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "_id": "application_id",
    "status": "Shortlisted",
    "employerNotes": "Strong candidate, schedule interview",
    "reviewedAt": "2024-01-16T14:30:00Z"
  }
}
```

**Error Responses:**
- `400` - Invalid status, validation errors
- `403` - Not authorized to update this application
- `404` - Application not found
- `500` - Server error

---

### 5. Withdraw Application
**PUT** `/api/applications/:id/withdraw`

Allows employee to withdraw their application.

**Access:** Employee only

**Response (200):**
```json
{
  "success": true,
  "message": "Application withdrawn successfully",
  "data": {
    "_id": "application_id",
    "isWithdrawn": true,
    "withdrawnAt": "2024-01-16T15:30:00Z"
  }
}
```

**Error Responses:**
- `400` - Application already withdrawn, cannot withdraw accepted/rejected application
- `403` - Not authorized to withdraw this application
- `404` - Application not found
- `500` - Server error

---

### 6. Get Application by ID
**GET** `/api/applications/:id`

Retrieves a specific application by ID.

**Access:** Employee (own applications), Employer (own jobs), Admin (all)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "application_id",
    "job": {
      "_id": "job_id",
      "title": "Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco",
      "salary": {
        "min": 70000,
        "max": 90000
      },
      "type": "Full time",
      "employer": "employer_id"
    },
    "employee": {
      "_id": "employee_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "status": "Shortlisted",
    "coverLetter": "I am excited to apply...",
    "expectedSalary": 80000,
    "appliedAt": "2024-01-15T10:30:00Z",
    "reviewedAt": "2024-01-16T14:30:00Z",
    "employerNotes": "Strong candidate",
    "isWithdrawn": false
  }
}
```

---

## Application Status Flow

```
Pending → Reviewed → Shortlisted → Interviewed → Accepted/Rejected
```

**Status Descriptions:**
- `Pending`: Application submitted, awaiting review
- `Reviewed`: Application has been reviewed by employer
- `Shortlisted`: Candidate selected for further consideration
- `Interviewed`: Interview has been conducted
- `Accepted`: Job offer extended
- `Rejected`: Application not selected

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation errors, invalid data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## Rate Limiting

- Apply to job: 5 applications per hour per user
- Status updates: 10 updates per hour per employer
- General endpoints: 100 requests per hour per user

---

## Notes

1. **Duplicate Applications**: Users cannot apply to the same job multiple times
2. **Job Status**: Applications can only be submitted to active jobs
3. **Withdrawal**: Applications cannot be withdrawn if already accepted or rejected
4. **Privacy**: Users can only access their own applications or applications for their own jobs
5. **Pagination**: All list endpoints support pagination with configurable limits 