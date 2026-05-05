# API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Common Response Format](#common-response-format)
5. [API Endpoints](#api-endpoints)
   - [Authentication APIs](#authentication-apis)
   - [User Management APIs](#user-management-apis)
   - [Intern Management APIs](#intern-management-apis)
   - [Certificate Access APIs](#certificate-access-apis)
   - [Certificate Generation APIs (HR)](#certificate-generation-apis-hr)
   - [Certificate Generation APIs (Director)](#certificate-generation-apis-director)
   - [Certificate Verification APIs](#certificate-verification-apis)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)
8. [Status Codes](#status-codes)

---

## Overview

This API provides endpoints for managing an internship certificate generation system with role-based access control. The system supports three user roles:
- **ADMIN**: Full system access, user management
- **HR**: Certificate generation, intern management, blockchain interactions
- **DIRECTOR**: Certificate signing 

---

## Base URL

```
http://localhost:8080
```

**Note**: Replace with your actual server URL in production.

---

## Authentication

### Cookie-Based Authentication

The API uses JWT tokens stored in HTTP-only cookies for authentication.

**Cookie Name**: `JwtToken`

**Cookie Properties**:
- HttpOnly: `true`
- Secure: `true`
- SameSite: `Strict`
- MaxAge: `36000` seconds (10 hours)
- Path: `/`

### Protected Endpoints

Protected endpoints require:
1. Valid JWT cookie from login
2. Appropriate role permissions

**Roles**:
- `ROLE_ADMIN`
- `ROLE_HR`
- `ROLE_DIRECTOR`

---

## Common Response Format

All API responses (except file downloads) follow this standard format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { },
  "error": null,
  "timestamp": "2026-01-29T10:30:00"
}
```

### Success Response
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { /* resource data */ },
  "timestamp": "2026-01-29T10:30:00"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error message",
    "field": "fieldName"
  },
  "timestamp": "2026-01-29T10:30:00"
}
```

---

## API Endpoints

---

## Authentication APIs

### 1. Login User

**Endpoint**: `POST /api/auth/loginUser`

**Description**: Authenticate user and receive JWT token in cookie.

**Authentication**: None (Public)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "roles": ["ROLE_ADMIN"],
    "email": "user@example.com",
    "phoneNumber": "+91-9876543210",
    "status": "ACTIVE",
    "createdAt": "2026-01-15T10:00:00",
    "updatedAt": "2026-01-29T08:30:00",
    "lastLogin": "2026-01-29T10:30:00",
    "createdById": 1,
    "createdByName": "Nilesh",
    "blockChainIdentity": "hr"
  },
  "timestamp": "2026-01-29T10:30:00"
}
```

**Headers** (Set-Cookie):
```
Set-Cookie: JwtToken=eyJhbGc...; HttpOnly; Secure; Path=/; Max-Age=36000; SameSite=Strict
```

---

### 2. Logout User

**Endpoint**: `POST /api/auth/logoutUser`

**Description**: Logout current user and clear authentication cookie.

**Authentication**: Required

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Logout successful",
  "timestamp": "2026-01-29T10:35:00"
}
```

---

### 3. Get Current User

**Endpoint**: `GET /api/auth/getCurrentUser`

**Description**: Retrieve currently authenticated user details.

**Authentication**: Required

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "roles": ["ROLE_ADMIN"],
    "email": "user@example.com",
    "phoneNumber": "+91-9876543210",
    "status": "ACTIVE",
    "createdAt": "2026-01-15T10:00:00",
    "updatedAt": "2026-01-29T08:30:00",
    "lastLogin": "2026-01-29T10:30:00",
    "createdById": 1,
    "createdByName": "Nilesh",
    "blockChainIdentity": "hr"
  },
  "timestamp": "2026-01-29T10:30:00"
}
```

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "message": "User is not Authorized",
  "timestamp": "2026-01-29T10:30:00"
}
```

---

### 4. Confirm Email

**Endpoint**: `POST /api/auth/confirmMail`

**Description**: Verify user email with OTP.

**Authentication**: Required

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Email is Verified",
  "timestamp": "2026-01-29T10:30:00"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid OTP",
  "timestamp": "2026-01-29T10:30:00"
}
```

---

## User Management APIs

**Note**: All user management endpoints require `ROLE_ADMIN` permission.

### 1. Register User

**Endpoint**: `POST /api/users/register`

**Description**: Register a new user (ADMIN, HR, or DIRECTOR).

**Authentication**: Required (ADMIN only)

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "fullName": "Jane Smith",
  "phoneNumber": "+91-9876543211",
  "password": "securePassword123",
  "roles": ["ROLE_HR"],
  "blockChainIdentity": "hr"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 2,
    "fullName": "Jane Smith",
    "roles": ["ROLE_HR"],
    "email": "newuser@example.com",
    "phoneNumber": "+91-9876543211",
    "blockChainIdentity": "HR",
    "status": "ACTIVE",
    "createdAt": "2026-01-29T10:30:00",
    "updatedAt": "2026-01-29T10:30:00",
    "lastLogin": "2026-01-30T16:05:35.0344924",
    "createdById": 1,
    "createdByName": "John Doe"
  },
  "timestamp": "2026-01-29T10:30:00"
}
```

**Notes on blockChainIdentity**:
- Auto-populated based on user roles
- Priority: DIRECTOR > HR > ADMIN
- If user has ROLE_DIRECTOR: blockChainIdentity = "DIRECTOR"
- If user has ROLE_HR (and no DIRECTOR role): blockChainIdentity = "HR"
- If user has ROLE_ADMIN: blockChainIdentity = "ADMIN"
- Updates automatically whenever user roles are modified

---

### 2. Get User by ID

**Endpoint**: `GET /api/users/getUserById/{id}`

**Description**: Retrieve user details by user ID.

**Authentication**: Required (ADMIN only)

**Path Parameters**:
- `id` (Long): User ID

**Example**: `GET /api/users/getUserById/2`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 2,
    "fullName": "Jane Smith",
    "roles": ["ROLE_HR"],
    "email": "newuser@example.com",
    "phoneNumber": "+91-9876543211",
    "status": "ACTIVE",
    "createdAt": "2026-01-29T10:30:00",
    "updatedAt": "2026-01-29T10:30:00",
    "lastLogin": "2026-01-30T16:05:35.0344924",
    "createdById": 1,
    "createdByName": "John Doe",
    "blockChainIdentity": "hr"
  },
  "timestamp": "2026-01-29T10:35:00"
}
```

---

### 3. Get All Users

**Endpoint**: `GET /api/users/getAllUsers`

**Description**: Retrieve list of all users in the system.

**Authentication**: Required (ADMIN only)

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "fullName": "John Doe",
      "roles": ["ROLE_ADMIN"],
      "email": "admin@example.com",
      "phoneNumber": "+91-9876543210",
      "status": "ACTIVE",
      "createdAt": "2026-01-15T10:00:00",
      "updatedAt": "2026-01-29T08:30:00",
      "lastLogin": "2026-01-29T10:30:00",
      "createdById": 1,
      "blockChainIdentity": "hr"
    },
    {
      "id": 2,
      "fullName": "Jane Smith",
      "roles": ["ROLE_HR"],
      "email": "hr@example.com",
      "phoneNumber": "+91-9876543211",
      "status": "ACTIVE",
      "createdAt": "2026-01-29T10:30:00",
      "updatedAt": "2026-01-29T10:30:00",
      "lastLogin": "2026-01-30T14:20:15.1234567",
      "createdById": 1,
      "createdByName": "John Doe",
      "blockChainIdentity": "hr"
    }
  ],
  "timestamp": "2026-01-29T10:35:00"
}
```

---

### 4. Update User

**Endpoint**: `PUT /api/users/updateUser/{id}`

**Description**: Update user details.

**Authentication**: Required (ADMIN only)

**Path Parameters**:
- `id` (Long): User ID

**Request Body**:
```json
{
  "fullName": "Jane Smith Updated",
  "roles": ["ROLE_HR", "ROLE_DIRECTOR"],
  "email": "hr.updated@example.com",
  "phoneNumber": "+91-9876543299",
  "status": "ACTIVE",
  "blockChainIdentity": "hr"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 2,
    "fullName": "Jane Smith Updated",
    "roles": ["ROLE_HR", "ROLE_DIRECTOR"],
    "email": "hr.updated@example.com",
    "phoneNumber": "+91-9876543299",
    "status": "ACTIVE",
    "createdAt": "2026-01-29T10:30:00",
    "updatedAt": "2026-01-29T11:00:00",
    "lastLogin": "2026-01-30T16:05:35.0344924",
    "createdById": 1,
    "createdByName": "John Doe",
    "blockChainIdentity": "hr"
  },
  "timestamp": "2026-01-29T11:00:00"
}
```

---

### 5. Change Password

**Endpoint**: `PUT /api/users/changePassword/{id}`

**Description**: Change user password.

**Authentication**: Required (ADMIN only)

**Path Parameters**:
- `id` (Long): User ID

**Request Body**:
```json
{
  "oldPassword": "oldPassword123",
  "newPassword": "newSecurePassword456",
  "confirmNewPassword": "newSecurePassword456"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "id": 2,
    "fullName": "Jane Smith",
    "roles": ["ROLE_HR"],
    "email": "hr@example.com",
    "phoneNumber": "+91-9876543211",
    "status": "ACTIVE",
    "createdAt": "2026-01-29T10:30:00",
    "updatedAt": "2026-01-29T11:05:00",
    "lastLogin": "2026-01-30T16:05:35.0344924",
    "createdById": 1,
    "createdByName": "John Doe",
    "blockChainIdentity": "hr"
  },
  "timestamp": "2026-01-29T11:05:00"
}
```

---

### 6. Delete User

**Endpoint**: `DELETE /api/users/deleteUser/{id}`

**Description**: Delete user from the system.

**Authentication**: Required (ADMIN only)

**Path Parameters**:
- `id` (Long): User ID

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": "User with ID 2 has been deleted",
  "timestamp": "2026-01-29T11:10:00"
}
```

---

### 7. Change User Status

**Endpoint**: `PATCH /api/users/changeStatus/{id}`

**Description**: Change user status to ACTIVE, INACTIVE, or BLOCKED.

**Authentication**: Required (ADMIN only)

**Path Parameters**:
- `id` (Long): User ID

**Query Parameters**:
- `status` (String, required): New status - Must be one of: `ACTIVE`, `INACTIVE`, `BLOCKED`

**Example Requests**:
- `PATCH /api/users/changeStatus/2?status=ACTIVE`
- `PATCH /api/users/changeStatus/2?status=INACTIVE`
- `PATCH /api/users/changeStatus/2?status=BLOCKED`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "id": 2,
    "fullName": "Jane Smith",
    "roles": ["ROLE_HR"],
    "email": "hr@example.com",
    "phoneNumber": "+91-9876543211",
    "status": "BLOCKED",
    "createdAt": "2026-01-29T10:30:00",
    "updatedAt": "2026-01-31T11:00:00",
    "lastLogin": "2026-01-30T16:05:35.0344924",
    "createdById": 1,
    "createdByName": "Admin User",
    "blockChainIdentity": "hr"
  },
  "timestamp": "2026-01-31T11:00:00"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid status value. Allowed values: ACTIVE, INACTIVE, BLOCKED",
  "error": null,
  "timestamp": "2026-01-31T11:00:00"
}
```

**Status Values**:
- `ACTIVE` - User can access the system normally
- `INACTIVE` - User account is temporarily inactive
- `BLOCKED` - User is blocked from accessing the system

---

### 8. Search Users by Name

**Endpoint**: `GET /api/users/searchByName`

**Description**: Search for users by name with relevance-based ordering. Supports partial matches and case-insensitive search.

**Authentication**: Required (ADMIN only)

**Query Parameters**:
- `name` (String, required): The name or partial name to search for

**Features**:
- ✅ Case-insensitive (e.g., "nilesh", "Nilesh", "NILESH" all work)
- ✅ Partial matching (e.g., "Nile" matches "Nilesh")
- ✅ Relevance-based ordering (exact matches first, then starts-with, then contains)

**Example Requests**:
- `GET /api/users/searchByName?name=Nilesh`
- `GET /api/users/searchByName?name=Nile`
- `GET /api/users/searchByName?name=yogesh`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "3 user(s) found",
  "data": [
    {
      "id": 1,
      "fullName": "Nilesh Yogeshwar Rahangdale",
      "roles": ["ROLE_ADMIN"],
      "email": "nilesh.r@example.com",
      "phoneNumber": "+91-9876543210",
      "status": "ACTIVE",
      "createdAt": "2026-01-15T10:00:00",
      "updatedAt": "2026-01-29T08:30:00",
      "lastLogin": "2026-01-30T16:05:35.0344924",
      "createdById": 1,
      "createdByName": "Nilesh",
      "blockChainIdentity": "hr"
    },
    {
      "id": 2,
      "fullName": "Nilesh Yogesh Roy",
      "roles": ["ROLE_HR"],
      "email": "nilesh.roy@example.com",
      "phoneNumber": "+91-9876543211",
      "status": "ACTIVE",
      "createdAt": "2026-01-20T10:30:00",
      "updatedAt": "2026-01-20T10:30:00",
      "lastLogin": "2026-01-30T14:20:15.1234567",
      "createdById": 1,
      "createdByName": "Admin User",
      "blockChainIdentity": "hr"
    },
    {
      "id": 3,
      "fullName": "Rahul Nilesh Patle",
      "roles": ["ROLE_DIRECTOR"],
      "email": "rahul.p@example.com",
      "phoneNumber": "+91-9876543212",
      "status": "ACTIVE",
      "createdAt": "2026-01-22T09:00:00",
      "updatedAt": "2026-01-22T09:00:00",
      "lastLogin": "2026-01-30T15:10:20.5678901",
      "createdById": 1,
      "createdByName": "Admin User",
      "blockChainIdentity": "hr"
    }
  ],
  "timestamp": "2026-01-31T10:30:00"
}
```

**No Results Response** (200 OK):
```json
{
  "success": true,
  "message": "No users found matching the search term",
  "data": [],
  "timestamp": "2026-01-31T10:30:00"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Search term must not be null or empty",
  "error": null,
  "timestamp": "2026-01-31T10:30:00"
}
```

**Ordering Logic**:
Results are ordered by relevance:
1. **Exact match** (highest priority) - Full name exactly matches search term
2. **Starts with** (high priority) - Name starts with search term
3. **Word boundary** (medium priority) - Search term appears at the start of a word
4. **Contains** (lower priority) - Search term appears anywhere in the name

**Example**: Searching for "Nilesh"
- "Nilesh Yogeshwar Rahangdale" → Priority 2 (starts with)
- "Nilesh Yogesh Roy" → Priority 2 (starts with)
- "Rahul Nilesh Patle" → Priority 3 (word boundary)

---

### 9. Get User Dashboard Statistics

**Endpoint**: `GET /api/users/dashboard`

**Description**: Get comprehensive dashboard statistics for users. Provides key insights for Admin landing page.

**Authentication**: Required (ADMIN only)

**Success Response** (200 OK):
```json
{
   "success": true,
   "message": "Users retrieved successfully",
   "data": [
      {
         "createdAt": "2026-01-15T14:49:00.543307",
         "createdById": 7,
         "createdByName": "Yogesh Rahangdale",
         "email": "nileshrahangdale08@gmail.com",
         "fullName": "Nilesh Shah",
         "id": 4,
         "lastLogin": "2026-01-30T22:48:28.905344",
         "phoneNumber": "+1234567890",
         "roles": [
            "ROLE_HR",
            "ROLE_ADMIN",
            "ROLE_DIRECTOR"
         ],
         "status": "ACTIVE",
         "updatedAt": "2026-01-30T22:48:28.913764",
        "blockChainIdentity": "hr"
      },
      {
         "createdAt": "2026-01-28T20:53:10.551729",
         "createdById": 4,
         "createdByName": "Nilesh Shah",
         "email": "yogeshwarrahangdale895@gmail.com",
         "fullName": "Yogesh Rahangdale Ji",
         "id": 5,
         "lastLogin": "2026-01-31T13:17:50.373515",
         "phoneNumber": "+1234567890",
         "roles": [
            "ROLE_HR",
            "ROLE_ADMIN",
            "ROLE_DIRECTOR"
         ],
         "status": "ACTIVE",
         "updatedAt": "2026-01-31T13:17:50.416539",
         "blockChainIdentity": "hr"
      }
   ],
   "timestamp": "2026-01-31T13:20:21.2772399"
}
```

**Dashboard Statistics Breakdown**:

- **totalUsers**: Total number of users in the system
- **userStatusStats**: Count of users by status
  - `ACTIVE`: Users who can access the system normally
  - `INACTIVE`: Users whose accounts are temporarily inactive
  - `BLOCKED`: Users who are blocked from accessing the system
- **userRoleStats**: Count of users by role
  - `admin`: System administrators
  - `hr`: HR personnel who manage interns
  - `director`: Directors who sign certificates
- **recentUsers**: Last 5 users (sorted by registration, most recent first)
  - Includes basic info: userId, fullName, email, role, status, designation

**Use Cases**:
- Admin landing page overview
- Quick statistics for system monitoring
- User distribution insights
- Monitoring recent user registrations

---

## Intern Management APIs

### 1. Add Intern

**Endpoint**: `POST /api/intern/addIntern`

**Description**: Add a new intern to the system.

**Authentication**: Required

**Request Body**:
```json
{
  "internId": 1,
  "fullName": "Rajesh Kumar",
  "email": "rajesh.kumar@example.com",
  "phone": "+91-9876543212",
  "address": "123 Main Street",
  "state": "Maharashtra",
  "district": "Pune",
  "aadhaarHash": "adhar number",
  "status": "ONGOING",
  "course": "B.Tech Computer Science",
  "domain": "Machine Learning",
  "instituteName": "ABC Engineering College",
  "rollNumber": "CS2022001",
  "cgpa": 8.5,
  "hscPercentage": 85.5,
  "sscPercentage": 90.0,
  "department": "Computer Science",
  "projectTitle": "AI-Based Image Recognition",
  "mentorName": "Dr. Sharma",
  "internshipType": "PAID",
  "startDate": "2026-01-01",
  "endDate": "2026-06-30"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Intern added successfully",
  "data": {
    "internId": "INT-2026-001",
    "fullName": "Rajesh Kumar",
    "email": "rajesh.kumar@example.com",
    "phone": "+91-9876543212",
    "address": "123 Main Street",
    "state": "Maharashtra",
    "district": "Pune",
    "aadhaarHash": "adhar number",
    "status": "ONGOING",
    "course": "B.Tech Computer Science",
    "domain": "Machine Learning",
    "instituteName": "ABC Engineering College",
    "rollNumber": "CS2022001",
    "cgpa": 8.5,
    "hscPercentage": 85.5,
    "sscPercentage": 90.0,
    "department": "Computer Science",
    "projectTitle": "AI-Based Image Recognition",
    "mentorName": "Dr. Sharma",
    "internshipType": "PAID",
    "startDate": "2026-01-01",
    "endDate": "2026-06-30"
  },
  "timestamp": "2026-01-29T11:15:00"
}
```

---

### 2. Update Intern

**Endpoint**: `PUT /api/intern/updateIntern`

**Description**: Update existing intern details.

**Authentication**: Required

**Request Body**:
```json
{
  "internId": "INT-2026-001",
  "fullName": "Rajesh Kumar",
  "email": "rajesh.updated@example.com",
  "phone": "+91-9876543213",
  "address": "456 New Street",
  "state": "Maharashtra",
  "district": "Mumbai",
  "aadhaarHash": "adhar number",
  "status": "COMPLETED",
  "course": "B.Tech Computer Science",
  "domain": "Machine Learning",
  "instituteName": "ABC Engineering College",
  "rollNumber": "CS2022001",
  "cgpa": 9.0,
  "hscPercentage": 85.5,
  "sscPercentage": 90.0,
  "department": "Computer Science",
  "projectTitle": "AI-Based Image Recognition - Phase 2",
  "mentorName": "Dr. Sharma",
  "internshipType": "PAID",
  "startDate": "2026-01-01",
  "endDate": "2026-06-30"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Intern updated successfully",
  "data": {
    "internId": "INT-2026-001",
    "fullName": "Rajesh Kumar",
    "email": "rajesh.updated@example.com",
    "phone": "+91-9876543213",
    "address": "456 New Street",
    "state": "Maharashtra",
    "district": "Mumbai",
    "aadhaarHash": "adhar number",
    "status": "COMPLETED",
    "course": "B.Tech Computer Science",
    "domain": "Machine Learning",
    "instituteName": "ABC Engineering College",
    "rollNumber": "CS2022001",
    "cgpa": 9.0,
    "hscPercentage": 85.5,
    "sscPercentage": 90.0,
    "department": "Computer Science",
    "projectTitle": "AI-Based Image Recognition - Phase 2",
    "mentorName": "Dr. Sharma",
    "internshipType": "PAID",
    "startDate": "2026-01-01",
    "endDate": "2026-06-30"
  },
  "timestamp": "2026-01-29T11:20:00"
}
```

---

### 3. Update Intern Status

**Endpoint**: `PUT /api/intern/updateInternStatus`

**Description**: Update intern status (ONGOING, COMPLETED, CANCELLED).

**Authentication**: Required

**Query Parameters**:
- `status` (String): New status (ONGOING, COMPLETED, CANCELLED)
- `internId` (String): Intern ID

**Example**: `PUT /api/intern/updateInternStatus?status=COMPLETED&internId=INT-2026-001`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Intern status updated successfully",
  "data": {
    "internId": "INT-2026-001",
    "fullName": "Rajesh Kumar",
    "status": "COMPLETED",
    /* ... other intern fields ... */
  },
  "timestamp": "2026-01-29T11:25:00"
}
```

---

### 4. Get All Interns

**Endpoint**: `GET /api/intern/getAllInterns`

**Description**: Retrieve list of all interns in the system.

**Authentication**: Required

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Interns retrieved successfully",
  "data": [
    {
      "internId": "INT-2026-001",
      "fullName": "Rajesh Kumar",
      "email": "rajesh.kumar@example.com",
      "phone": "+91-9876543212",
      "address": "123 Main Street",
      "state": "Maharashtra",
      "district": "Pune",
      "aadhaarHash": "adhar number",
      "status": "ONGOING",
      "course": "B.Tech Computer Science",
      "domain": "Machine Learning",
      "instituteName": "ABC Engineering College",
      "rollNumber": "CS2022001",
      "cgpa": 8.5,
      "hscPercentage": 85.5,
      "sscPercentage": 90.0,
      "department": "Computer Science",
      "projectTitle": "AI-Based Image Recognition",
      "mentorName": "Dr. Sharma",
      "internshipType": "PAID",
      "startDate": "2026-01-01",
      "endDate": "2026-06-30"
    }
    /* ... more interns ... */
  ],
  "timestamp": "2026-01-29T11:30:00"
}
```

---

### 5. Get Intern by ID

**Endpoint**: `GET /api/intern/getInternById/{internId}`

**Description**: Retrieve intern details by intern ID.

**Authentication**: Required

**Path Parameters**:
- `internId` (String): Intern ID

**Example**: `GET /api/intern/getInternById/INT-2026-001`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Intern retrieved successfully",
  "data": {
    "internId": "INT-2026-001",
    "fullName": "Rajesh Kumar",
    "email": "rajesh.kumar@example.com",
    "phone": "+91-9876543212",
    "address": "123 Main Street",
    "state": "Maharashtra",
    "district": "Pune",
    "aadhaarHash": "adhar number",
    "status": "ONGOING",
    "course": "B.Tech Computer Science",
    "domain": "Machine Learning",
    "instituteName": "ABC Engineering College",
    "rollNumber": "CS2022001",
    "cgpa": 8.5,
    "hscPercentage": 85.5,
    "sscPercentage": 90.0,
    "department": "Computer Science",
    "projectTitle": "AI-Based Image Recognition",
    "mentorName": "Dr. Sharma",
    "internshipType": "PAID",
    "startDate": "2026-01-01",
    "endDate": "2026-06-30"
  },
  "timestamp": "2026-01-29T11:35:00"
}
```

---

### 6. Upload Interns via CSV

**Endpoint**: `POST /api/intern/upload-csv`

**Description**: Bulk upload interns using CSV file.

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file` (File): CSV file containing intern data

**CSV Format**:
```csv
fullName,email,phone,address,state,district,aadhaarHash,course,domain,instituteName,rollNumber,cgpa,hscPercentage,sscPercentage,department,projectTitle,mentorName,internshipType,startDate,endDate
Rajesh Kumar,rajesh@example.com,9876543212,123 Main St,Maharashtra,Pune,hash123,B.Tech CS,ML,ABC College,CS001,8.5,85.5,90.0,CS,AI Project,Dr. Sharma,PAID,2026-01-01,2026-06-30
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "CSV processed: 10 interns added, 2 failed",
  "data": {
    "successCount": 10,
    "failureCount": 2,
    "successfulInterns": [
      {
        "internId": "INT-2026-001",
        "fullName": "Rajesh Kumar",
        /* ... intern details ... */
      }
      /* ... more successful interns ... */
    ],
    "failedRows": [
      {
        "rowNumber": 5,
        "errorMessage": "Invalid email format",
        "rowData": "Invalid data..."
      },
      {
        "rowNumber": 8,
        "errorMessage": "Missing required field: fullName",
        "rowData": "Incomplete data..."
      }
    ]
  },
  "timestamp": "2026-01-29T11:40:00"
}
```

---

### 7. Search Interns by Name

**Endpoint**: `GET /api/intern/searchByName`

**Description**: Search for interns by name with relevance-based ordering. Supports partial matches and case-insensitive search.

**Authentication**: Required

**Query Parameters**:
- `name` (String, required): The name or partial name to search for

**Features**:
- ✅ Case-insensitive (e.g., "nilesh", "Nilesh", "NILESH" all work)
- ✅ Partial matching (e.g., "Nile" matches "Nilesh")
- ✅ Relevance-based ordering (exact matches first, then starts-with, then contains)

**Example Requests**:
- `GET /api/intern/searchByName?name=Nilesh`
- `GET /api/intern/searchByName?name=Nile`
- `GET /api/intern/searchByName?name=yogesh`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "3 intern(s) found",
  "data": [
    {
      "internId": "DRDO2026INT00001",
      "fullName": "Nilesh Yogeshwar Rahangdale",
      "email": "nilesh.r@example.com",
      "phone": "+91-9876543210",
      "address": "123 Main Street",
      "state": "Maharashtra",
      "district": "Nagpur",
      "status": "ONGOING",
      "course": "B.Tech Computer Science",
      "domain": "AI/ML",
      "instituteName": "ABC Engineering College",
      "rollNumber": "CS2022001",
      "cgpa": 8.5,
      "hscPercentage": 85.5,
      "sscPercentage": 90.0,
      "department": "Computer Science",
      "projectTitle": "AI-Based Image Recognition",
      "mentorName": "Dr. Sharma",
      "internshipType": "PAID",
      "startDate": "2026-01-01",
      "endDate": "2026-06-30"
    },
    {
      "internId": "DRDO2026INT00002",
      "fullName": "Nilesh Yogesh Roy",
      "email": "nilesh.roy@example.com",
      "phone": "+91-9876543211",
      "course": "B.Tech Electronics",
      "domain": "IoT",
      "status": "ONGOING"
      /* ... other fields ... */
    },
    {
      "internId": "DRDO2026INT00003",
      "fullName": "Rahul Nilesh Patle",
      "email": "rahul.p@example.com",
      "phone": "+91-9876543212",
      "course": "B.Tech Mechanical",
      "domain": "Robotics",
      "status": "COMPLETED"
      /* ... other fields ... */
    }
  ],
  "timestamp": "2026-01-30T10:30:00"
}
```

**No Results Response** (200 OK):
```json
{
  "success": true,
  "message": "No interns found matching the search term",
  "data": [],
  "timestamp": "2026-01-30T10:30:00"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Search term must not be null or empty",
  "error": null,
  "timestamp": "2026-01-30T10:30:00"
}
```

**Ordering Logic**:
Results are ordered by relevance:
1. **Exact match** (highest priority) - Full name exactly matches search term
2. **Starts with** (high priority) - Name starts with search term
3. **Word boundary** (medium priority) - Search term appears at the start of a word
4. **Contains** (lower priority) - Search term appears anywhere in the name

**Example**: Searching for "Nilesh"
- "Nilesh Yogeshwar Rahangdale" → Priority 2 (starts with)
- "Nilesh Yogesh Roy" → Priority 2 (starts with)
- "Rahul Nilesh Patle" → Priority 3 (word boundary)

---

### 8. Change Internship Type

**Endpoint**: `PATCH /api/intern/changeInternshipType/{internId}`

**Description**: Change the internship type to PAID or UNPAID for a specific intern.

**Authentication**: Required (HR or ADMIN roles)

**Path Parameters**:
- `internId` (String): The intern ID (e.g., "DRDO2026INT00045")

**Query Parameters**:
- `type` (String, required): New internship type - Must be one of: `PAID`, `UNPAID`

**Example Requests**:
- `PATCH /api/intern/changeInternshipType/DRDO2026INT00045?type=PAID`
- `PATCH /api/intern/changeInternshipType/DRDO2026INT00045?type=UNPAID`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Internship type updated successfully",
  "data": {
    "internId": "DRDO2026INT00045",
    "fullName": "Rajesh Kumar",
    "email": "rajesh.kumar@example.com",
    "phone": "+91-9876543212",
    "address": "123 Main Street",
    "state": "Maharashtra",
    "district": "Pune",
    "status": "ONGOING",
    "course": "B.Tech Computer Science",
    "domain": "Machine Learning",
    "instituteName": "ABC Engineering College",
    "rollNumber": "CS2022001",
    "cgpa": 8.5,
    "hscPercentage": 85.5,
    "sscPercentage": 90.0,
    "department": "Computer Science",
    "projectTitle": "AI-Based Image Recognition",
    "mentorName": "Dr. Sharma",
    "internshipType": "PAID",
    "startDate": "2026-01-01",
    "endDate": "2026-06-30"
  },
  "timestamp": "2026-01-31T12:00:00"
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Intern not found for internId: DRDO2026INT00999",
  "error": null,
  "timestamp": "2026-01-31T12:00:00"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid internship type. Allowed values: PAID, UNPAID",
  "error": null,
  "timestamp": "2026-01-31T12:00:00"
}
```

**Internship Type Values**:
- `PAID` - Intern receives stipend/payment
- `UNPAID` - Intern does not receive payment

**Use Cases**:
- Update payment status when internship terms change
- Correct data entry errors
- Administrative adjustments to internship records

---

### 9. Get Dashboard Statistics

**Endpoint**: `GET /api/intern/dashboard`

**Description**: Get comprehensive dashboard statistics for interns and certificates. Provides key insights for HR and Director landing page.

**Authentication**: Required (HR, DIRECTOR, or ADMIN roles)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalInterns": 150,
    "totalCertificates": 120,
    "internStatusStats": {
      "ongoing": 45,
      "completed": 95,
      "cancelled": 10
    },
    "certificateStatusStats": {
      "generated": 30,
      "signed": 85,
      "revoked": 5
    },
    "internshipTypeStats": {
      "paid": 80,
      "unpaid": 70
    },
    "recentInterns": [
      {
        "internId": "DRDO2026INT00150",
        "fullName": "Amit Kumar",
        "email": "amit.k@example.com",
        "status": "ONGOING",
        "course": "B.Tech Computer Science",
        "domain": "AI/ML"
      },
      {
        "internId": "DRDO2026INT00149",
        "fullName": "Priya Sharma",
        "email": "priya.s@example.com",
        "status": "ONGOING",
        "course": "B.Tech Electronics",
        "domain": "IoT"
      },
      {
        "internId": "DRDO2026INT00148",
        "fullName": "Rahul Verma",
        "email": "rahul.v@example.com",
        "status": "COMPLETED",
        "course": "B.Tech Mechanical",
        "domain": "Robotics"
      },
      {
        "internId": "DRDO2026INT00147",
        "fullName": "Sneha Patel",
        "email": "sneha.p@example.com",
        "status": "ONGOING",
        "course": "M.Tech Data Science",
        "domain": "Machine Learning"
      },
      {
        "internId": "DRDO2026INT00146",
        "fullName": "Vikram Singh",
        "email": "vikram.s@example.com",
        "status": "COMPLETED",
        "course": "B.Tech IT",
        "domain": "Cyber Security"
      }
    ]
  },
  "timestamp": "2026-01-31T10:30:00"
}
```

**Dashboard Statistics Breakdown**:

- **totalInterns**: Total number of interns in the system
- **totalCertificates**: Total number of certificates generated
- **internStatusStats**: Count of interns by status
  - `ongoing`: Currently active interns
  - `completed`: Interns who completed their internship
  - `cancelled`: Interns whose internship was cancelled
- **certificateStatusStats**: Count of certificates by status
  - `generated`: Certificates generated by HR (awaiting signature)
  - `signed`: Certificates signed by Director (final)
  - `revoked`: Certificates that have been revoked
- **internshipTypeStats**: Count of interns by payment type
  - `paid`: Paid internships
  - `unpaid`: Unpaid internships
- **recentInterns**: Last 5 interns (sorted by start date, most recent first)

**Use Cases**:
- HR landing page overview
- Director dashboard
- Quick statistics for decision making
- Monitoring intern and certificate trends

---

## Certificate Access APIs

**Scope**: These endpoints are served by `CertificateController` under base path `/api/certificates`. Endpoints include database-backed certificate reads and blockchain-backed certificate reads/history.

### 1. Get Certificate by Certificate ID

**Endpoint**: `GET /api/certificates/certificate/{certificateId}`

**Description**: Retrieve a single certificate by certificate ID.

**Authentication**: Required

**Path Parameters**:
- `certificateId` (String): Certificate ID

**Example**: `GET /api/certificates/certificate/CERT-2026-001`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Certificate retrieved successfully",
  "data": {
    "certificateId": "CERT-2026-001",
    "certificateType": "INTERNSHIP_COMPLETION",
    "issueDate": "2026-04-14",
    "issuedBy": "HR",
    "status": "SIGNED",
    "pdfPath": "ServerStorage/signed/CERT-2026-001_SIGNED.pdf",
    "internId": "INT-2026-001",
    "internName": "Nilesh Y R",
    "metadataHashSha256": "8f3c...ab19",
    "qrMetadata": {
      "id": 31,
      "verificationUrl": "http://localhost:8080/api/verification/verify/CERT-2026-001",
      "qrPayloadHash": "d726...0df1"
    },
    "digitalSignature": {
      "id": 7,
      "signerName": "Director Name",
      "signerRole": "DIRECTOR",
      "signatureAlgorithm": "SHA256withRSA",
      "certificateChainPath": "ServerStorage/certs/director-chain.pem",
      "signedAt": "2026-04-15T11:42:00"
    }
  },
  "timestamp": "2026-04-18T16:30:00"
}
```

---

### 2. Get Certificates by Intern ID (Optional Status Filter)

**Endpoint**: `GET /api/certificates/intern`

**Description**: Retrieve all certificates for an intern, with optional filtering by certificate status.

**Authentication**: Required

**Query Parameters**:
- `internId` (String, Required): Intern ID
- `status` (Enum, Optional): Certificate status filter (`GENERATED`, `SIGNED`, `REVOKED`)

**Example**: `GET /api/certificates/intern?internId=INT-2026-001&status=SIGNED`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Certificate retrieved successfully",
  "data": [
    {
      "certificateId": "DRDO2026CERT00000",
      "certificateType": "COMPLETION",
      "issueDate": "2026-04-17",
      "issuedBy": "Nilesh Hr id",
      "status": "REVOKED",
      "pdfPath": "E:\\CERTIFICATE GENERATOR\\Cert_Gen_Backend\\ServerStorage\\certificates\\DRDO2026CERT00000_qr_SIGNED.pdf",
      "internId": "DRDO2026INT00074",
      "internName": "Pratiksha Patle",
      "metadataHashSha256": "5ed41dbc76ed8547b16fb96d37043013ea4b0948627f903b5ce9d30a3fc19b",
      "qrMetadata": {
        "id": 1,
        "verificationUrl": "http://localhost:8080/api/verification/verify/DRDO2026CERT00000",
        "qrPayloadHash": "b8f2f331d8c4470a632879af0c3a2552244725d55bd01a9e74219a613ccd44d2"
      },
      "digitalSignature": {
        "id": 1,
        "signerName": "Nilesh Director id",
        "signerRole": "Director",
        "signatureAlgorithm": "SHA256withRSA",
        "certificateChainPath": "PKCS12 keystore",
        "signedAt": "2026-04-17T18:17:03.020676"
      }
    },
    {
      "certificateId": "DRDO2026CERT00001",
      "certificateType": "COMPLETION",
      "issueDate": "2026-04-18",
      "issuedBy": "Nilesh Hr id",
      "status": "REVOKED",
      "pdfPath": "E:\\CERTIFICATE GENERATOR\\Cert_Gen_Backend\\ServerStorage\\certificates\\DRDO2026CERT010001_qr_SIGNED.pdf",
      "internId": "DRDO2026INT00074",
      "internName": "Pratiksha Patle",
      "metadataHashSha256": "2901284e5e3eb7d2806d87de38dbc93ed69fc8378796d1ed926a7a721d9c0e29",
      "qrMetadata": {
        "id": 2,
        "verificationUrl": "http://localhost:8080/api/verification/verify/DRDO2026CERT00001",
        "qrPayloadHash": "e4d27f7b08e31bdbd3710155d52518685964a18ddd9ce8b24e0a129d78f5d4d9"
      },
      "digitalSignature": {
        "id": 2,
        "signerName": "Nilesh Director id",
        "signerRole": "Director",
        "signatureAlgorithm": "SHA256withRSA",
        "certificateChainPath": "PKCS12 keystore",
        "signedAt": "2026-04-18T17:12:39.431267"
      }
    }
  ],
  "timestamp": "2026-04-23T16:19:24.2788892"
}
```

---

### 3. Get All Certificates by status (Optional Status Filter)

**Endpoint**: `GET /api/certificates/certificate`

**Description**: Retrieve all certificates with optional filtering by certificate status.

**Authentication**: Required

**Query Parameters**:
- `status` (Enum, Optional): Certificate status filter (`GENERATED`, `SIGNED`, `REVOKED`)

**Example**: `GET /api/certificates/certificate?status=REVOKED`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Certificate retrieved successfully",
  "data": [
    {
      "certificateId": "DRDO2026CERT00000",
      "certificateType": "COMPLETION",
      "issueDate": "2026-04-17",
      "issuedBy": "Nilesh Hr id",
      "status": "REVOKED",
      "pdfPath": "E:\\CERTIFICATE GENERATOR\\Cert_Gen_Backend\\ServerStorage\\certificates\\DRDO2026CERT00000_qr_SIGNED.pdf",
      "internId": "DRDO2026INT00074",
      "internName": "Pratiksha Patle",
      "metadataHashSha256": "5ed41dbc76ed8547b16fb96d37043013ea4b0948627f903b5ce9d30a3fc19b",
      "qrMetadata": {
        "id": 1,
        "verificationUrl": "http://localhost:8080/api/verification/verify/DRDO2026CERT00000",
        "qrPayloadHash": "b8f2f331d8c4470a632879af0c3a2552244725d55bd01a9e74219a613ccd44d2"
      },
      "digitalSignature": {
        "id": 1,
        "signerName": "Nilesh Director id",
        "signerRole": "Director",
        "signatureAlgorithm": "SHA256withRSA",
        "certificateChainPath": "PKCS12 keystore",
        "signedAt": "2026-04-17T18:17:03.020676"
      }
    },
    {
      "certificateId": "DRDO2026CERT00001",
      "certificateType": "COMPLETION",
      "issueDate": "2026-04-18",
      "issuedBy": "Nilesh Hr id",
      "status": "REVOKED",
      "pdfPath": "E:\\CERTIFICATE GENERATOR\\Cert_Gen_Backend\\ServerStorage\\certificates\\DRDO2026CERT001001_qr_SIGNED.pdf",
      "internId": "DRDO2026INT00074",
      "internName": "Pratiksha Patle",
      "metadataHashSha256": "2901284e5e3eb7d2806d87de38dbc93ed69fc8378796d1ed926a7a721d9c0e29",
      "qrMetadata": {
        "id": 2,
        "verificationUrl": "http://localhost:8080/api/verification/verify/DRDO2026CERT00001",
        "qrPayloadHash": "e4d27f7b08e31bdbd3710155d52518685964a18ddd9ce8b24e0a129d78f5d4d9"
      },
      "digitalSignature": {
        "id": 2,
        "signerName": "Nilesh Director id",
        "signerRole": "Director",
        "signatureAlgorithm": "SHA256withRSA",
        "certificateChainPath": "PKCS12 keystore",
        "signedAt": "2026-04-18T17:12:39.431267"
      }
    }
  ],
  "timestamp": "2026-04-23T16:14:30.2793083"
}
```

---

### 3. Download Certificate PDF by Certificate ID

**Endpoint**: `GET /api/certificates/certificate/{certificateId}/pdf`

**Description**: Download certificate PDF by certificate ID.

**Authentication**: Required

**Path Parameters**:
- `certificateId` (String): Certificate ID

**Example**: `GET /api/certificates/certificate/CERT-2026-001/pdf`

**Success Response** (200 OK):
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `inline; filename="CERT-2026-001.pdf"`
- **Body**: Binary PDF file

---

### 4. Get Certificate from Blockchain by Certificate ID

**Endpoint**: `GET /api/certificates/blockchain/{certificateId}`

**Description**: Retrieve blockchain-backed certificate details for the given certificate ID.

**Authentication**: Required

**Path Parameters**:
- `certificateId` (String): Certificate ID

**Example**: `GET /api/certificates/blockchain/CERT-2026-001`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Certificate successfully retrieved from blockchain",
  "data": {
    "certificateId": "CERT-2026-001",
    "internId": "INT-2026-001",
    "internName": "Nilesh Y R",
    "hash": "8f3c...ab19",
    "issuedBy": "HR",
    "approvedBy": "DIRECTOR",
    "issueDate": "14-04-2026",
    "status": "SIGNED",
    "txId": "7121534161023f01e3a591b5ee4c55bd18016473a98534b72187e8567ee03cc9"
  },
  "timestamp": "2026-04-18T16:40:00"
}
```

**Error Responses**:
- **401 Unauthorized**: when authentication is missing
- **404 Not Found**: Fabric gateway retrieval failure (`FABRIC_GET_CERTIFICATE_FAILED` or related Fabric error code)
- **500 Internal Server Error**: unexpected runtime error

---

### 5. Get Certificate Blockchain History

**Endpoint**: `GET /api/certificates/blockchain/{certificateId}/history`

**Description**: Retrieve blockchain transaction history for a certificate.

**Authentication**: Required

**Path Parameters**:
- `certificateId` (String): Certificate ID

**Example**: `GET /api/certificates/blockchain/CERT-2026-001/history`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Certificate history successfully retrieved from blockchain",
  "data": [
    {
      "txId": "0d8f...11a9",
      "timestamp": "2026-04-14T10:15:22Z",
      "value": {
        "certificateId": "CERT-2026-001",
        "internId": "INT-2026-001",
        "internName": "Nilesh Y R",
        "hash": "8f3c...ab19",
        "issuedBy": "HR",
        "approvedBy": "DIRECTOR",
        "issueDate": "14-04-2026",
        "status": "GENERATED",
        "txId": "0d8f...11a9"
      },
      "isDelete": false
    },
    {
      "txId": "7121...3cc9",
      "timestamp": "2026-04-15T11:42:00Z",
      "value": {
        "certificateId": "CERT-2026-001",
        "internId": "INT-2026-001",
        "internName": "Nilesh Y R",
        "hash": "8f3c...ab19",
        "issuedBy": "HR",
        "approvedBy": "DIRECTOR",
        "issueDate": "14-04-2026",
        "status": "SIGNED",
        "txId": "7121...3cc9"
      },
      "isDelete": false
    }
  ],
  "timestamp": "2026-04-18T16:43:00"
}
```

**Error Responses**:
- **401 Unauthorized**: when authentication is missing
- **404 Not Found**: Fabric gateway history retrieval failure (`FABRIC_GET_CERTIFICATE_HISTORY_FAILED` or related Fabric error code)
- **500 Internal Server Error**: unexpected runtime error

---

### 6. Get All Certificates from Blockchain

**Endpoint**: `GET /api/certificates/blockchain/certificates`

**Description**: Retrieve all certificates available from the blockchain ledger.

**Authentication**: Required

**Example**: `GET /api/certificates/blockchain/certificates`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Certificates successfully retrieved from blockchain",
  "data": [
    {
      "certificateId": "CERT-2026-001",
      "internId": "INT-2026-001",
      "internName": "Nilesh Y R",
      "hash": "8f3c...ab19",
      "issuedBy": "HR",
      "approvedBy": "DIRECTOR",
      "issueDate": "14-04-2026",
      "status": "SIGNED",
      "txId": "7121...3cc9"
    }
  ],
  "timestamp": "2026-04-18T16:46:00"
}
```

**Error Responses**:
- **401 Unauthorized**: when authentication is missing
- **404 Not Found**: Fabric gateway retrieval failure (`FABRIC_GET_ALL_CERTIFICATES_FAILED` or related Fabric error code)
- **500 Internal Server Error**: unexpected runtime error

**Important Behavior Note**:
- If the authenticated user does not have a configured blockchain identity, these blockchain endpoints currently return HTTP `200 OK` with `success: false` and an error message in the response body.

---

## Certificate Generation APIs (HR)

**Scope**: These endpoints are served by `HRController` under `/api/hr/certificates` and all are protected with `@PreAuthorize("hasRole('HR')")`.

### 1. Generate Certificate

**Endpoint**: `POST /api/hr/certificates/generate`

**Description**: Generate a certificate for the given intern and certificate type.

**Authentication**: Required (HR only)

**Query Parameters**:
- `internId` (String, Required): Intern ID for certificate generation
- `certificateType` (String, Required): Certificate type to generate

**Example**: `POST /api/hr/certificates/generate?internId=INT-2026-001&certificateType=INTERNSHIP_COMPLETION`

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Certificate generated successfully",
  "data": {
    "certificateId": "CERT-2026-001",
    "certificateType": "INTERNSHIP_COMPLETION",
    "internId": "INT-2026-001",
    "internName": "Nilesh Y R",
    "issueDate": "2026-04-18",
    "issuedBy": "HR User",
    "status": "GENERATED",
    "pdfPath": "ServerStorage/unsigned/CERT-2026-001.pdf",
    "verificationUrl": "http://localhost:8080/api/verification/verify/CERT-2026-001",
    "qrEmbedded": true,
    "signed": false
  },
  "timestamp": "2026-04-18T18:10:00"
}
```

**Error Responses**:
- **401 Unauthorized**: when authentication is missing

---

### 2. Revoke Certificate

**Endpoint**: `POST /api/hr/certificates/revoke`

**Description**: Revoke a certificate and record revocation metadata.

**Authentication**: Required (HR only)

**Query Parameters**:
- `certificateId` (String, Required): Certificate ID to revoke
- `revocationReason` (String, Required): Reason for revocation

**Example**: `POST /api/hr/certificates/revoke?certificateId=CERT-2026-001&revocationReason=Data%20mismatch`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Certificate revoked successfully",
  "data": {
    "certificateId": "CERT-2026-001",
    "internId": "INT-2026-001",
    "internName": "Nilesh Y R",
    "status": "REVOKED",
    "revocationReason": "Data mismatch"
  },
  "timestamp": "2026-04-18T18:15:00"
}
```

**Error Responses**:
- **401 Unauthorized**: when authentication is missing

---

### 3. Upload Certificate to Blockchain

**Endpoint**: `POST /api/hr/certificates/uploadCertificateToBlockchain`

**Description**: Upload an existing certificate record to Hyperledger Fabric.

**Authentication**: Required (HR only)

**Query Parameters**:
- `certificateId` (String, Required): Certificate ID to upload

**Example**: `POST /api/hr/certificates/uploadCertificateToBlockchain?certificateId=CERT-2026-001`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Certificate uploaded successfully to blockchain",
  "data": {
    "certificateId": "CERT-2026-001",
    "internId": "INT-2026-001",
    "internName": "Nilesh Y R",
    "hash": "8f3c...ab19",
    "issuedBy": "HR",
    "approvedBy": "DIRECTOR",
    "issueDate": "18-04-2026",
    "status": "GENERATED",
    "txId": "11ab2233cc44dd55ee66ff77aa889900"
  },
  "timestamp": "2026-04-18T18:20:00"
}
```

**Error Responses**:
- **401 Unauthorized**: when authentication is missing

**Important Behavior Note**:
- If HR user has no blockchain identity configured, `revoke` and `uploadCertificateToBlockchain` currently return HTTP `200 OK` with `success: false` and message in the response body.

---

## Certificate Generation APIs (Director)

**Note**: All Director certificate endpoints require `ROLE_DIRECTOR` permission. 

### 1. Sign Certificate

**Endpoint**: `POST /api/director/certificates/{certificateId}/sign`

**Description**: Digitally sign the certificate with Director's digital signature.

**Authentication**: Required (DIRECTOR only)

**Path Parameters**:
- `certificateId` (String): Certificate ID to sign

**Example**: `POST /api/director/certificates/CERT-2026-001/sign`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Certificate signed successfully",
  "data": {
    "certificateId": "CERT-2026-001",
    "status": "SIGNED",
    "signerDetails": {
      "signerName": "Dr. Director Name",
      "signerRole": "DIRECTOR",
      "signatureAlgorithm": "SHA256withRSA"
    },
    "signedAt": "2026-01-29T12:25:00",
    "signedPdfPath": "/ServerStorage/signed/CERT-2026-001.pdf",
    "verificationEnabled": true
  },
  "timestamp": "2026-01-29T12:25:00"
}
```

---




## Certificate Verification APIs

**Changes**: Certificate verification now includes blockchain transaction history and uses dedicated Blockchain History DTO.

### 1. Verify Certificate

**Endpoint**: `GET /api/verification/verify/{certificateId}`

**Description**: Verify certificate authenticity . Public endpoint accessible without authentication.

**Authentication**: None (Public)

**Path Parameters**:
- `certificateId` (String): Certificate ID to verify


**Example**: `GET /api/verification/verify/CERT0051`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Certificate verified successfully",
  "data": {
    "valid": true,
    "message": "Certificate is valid",
    "certificateId": "DRDO2026CERT00000",
    "internId": "DRDO2026INT00074",
    "internName": "Pratiksha Patle",
    "issuedBy": "SAG, DRDO",
    "issuedAt": "2026-04-17"
  },
  "timestamp": "2026-04-18T21:50:20.1545181"
}
```

**Error Response - Certificate Not Found** (404 Not Found):
```json
{
  "success": false,
  "message": "Failed to retrieve certificate: Certificate not found",
  "error": {
    "code": "FABRIC_GET_CERTIFICATE_FAILED",
    "details": "certificateId=CERT9999"
  },
  "timestamp": "2026-04-18T14:30:00"
}
```


---

## Data Models

### User

```typescript
{
  id: number,
  fullName: string,
  roles: Array<"ROLE_ADMIN" | "ROLE_HR" | "ROLE_DIRECTOR">,
  email: string,
  phoneNumber: string,
  blockChainIdentity: "ADMIN" | "HR" | "DIRECTOR",
  status: "ACTIVE" | "INACTIVE" | "BLOCKED",
  createdAt: string (ISO 8601 DateTime),
  updatedAt: string (ISO 8601 DateTime),
  lastLogin: string (ISO 8601 DateTime with microseconds, e.g., "2026-01-30T16:05:35.0344924"),
  createdById: number | null,
  createdByName: string | null
}
```

**Notes on blockChainIdentity**:
- Auto-populated based on user roles (priority: DIRECTOR > HR > ADMIN)
- Updates automatically when roles are modified
- Used for blockchain transaction authentication

### Intern

```typescript
{
  internId: string,
  fullName: string,
  email: string,
  phone: string,
  address: string,
  state: string,
  district: string,
  aadhaarHash: string,
  status: "ONGOING" | "COMPLETED" | "CANCELLED",
  
  // Academic Information
  course: string,
  domain: string,
  instituteName: string,
  rollNumber: string,
  cgpa: number,
  hscPercentage: number,
  sscPercentage: number,
  
  // Internship Information
  department: string,
  projectTitle: string,
  mentorName: string,
  internshipType: "PAID" | "UNPAID",
  startDate: string (ISO 8601 Date),
  endDate: string (ISO 8601 Date)
}
```

### BlockchainCertDto

```typescript
{
  certificateId: string,
  internId: string,
  internName: string,
  hash: string (certificate hash for integrity verification),
  issuedBy: string,
  approvedBy: string,
  issueDate: string (format: DD-MM-YYYY),
  status: "GENERATED" | "SIGNED" | "REVOKED",
  txId: string (blockchain transaction ID)
}
```

**Usage**: Returned by certificate create, get, and revoke endpoints. Represents certificate data stored on Hyperledger Fabric blockchain.

---

### BLockchainCertHistoryDto

```typescript
{
  txId: string (blockchain transaction ID),
  timestamp: string (ISO 8601 DateTime, e.g., "2026-04-16 09:00:42.5967361 +0000 UTC"),
  value: BlockchainCertDto,
  isDelete: boolean
}
```

**Usage**: Returned as array by certificate history verification endpoint. Each entry represents a transaction in the blockchain ledger.

### Certificate Generation Response

```typescript
{
  certificateId: string,
  certificateType: "PARTICIPATION" | "COMPLETION",
  internId: string,
  internName: string,
  issueDate: string (ISO 8601 Date),
  status: "GENERATED" | "SIGNED" | "REVOKED",
  pdfPath: string,
  verificationUrl: string | null,
  qrEmbedded: boolean,
  signed: boolean
}
```

### Certificate Signing Response

```typescript
{
  certificateId: string,
  status: "SIGNED",
  signerDetails: {
    signerName: string,
    signerRole: string,
    signatureAlgorithm: string
  },
  signedAt: string (ISO 8601 DateTime),
  signedPdfPath: string,
  verificationEnabled: boolean
}
```

### Certificate Verification Response

```typescript
{
  valid: boolean,
  message: string,
  certificateId: string | null,
  internId: string | null,
  internName: string | null,
  issuedBy: string | null,
  issuedAt: string (ISO 8601 Date) | null,
  signerName: string | null
}
```

### CSV Upload Response

```typescript
{
  successCount: number,
  failureCount: number,
  successfulInterns: Array<Intern>,
  failedRows: Array<{
    rowNumber: number,
    errorMessage: string,
    rowData: string
  }>
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request parameters",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": "Email format is invalid",
    "field": "email"
  },
  "timestamp": "2026-01-29T12:40:00"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required",
  "timestamp": "2026-01-29T12:40:00"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions",
  "error": {
    "code": "FORBIDDEN",
    "details": "User does not have required role: ROLE_ADMIN"
  },
  "timestamp": "2026-01-29T12:40:00"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": {
    "code": "NOT_FOUND",
    "details": "Intern not found with ID: INT-2026-999"
  },
  "timestamp": "2026-01-29T12:40:00"
}
```

#### 409 Conflict
```json
{
  "success": false,
  "message": "Resource conflict",
  "error": {
    "code": "DUPLICATE_RESOURCE",
    "details": "User with email already exists",
    "field": "email"
  },
  "timestamp": "2026-01-29T12:40:00"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": {
    "code": "INTERNAL_ERROR",
    "details": "An unexpected error occurred"
  },
  "timestamp": "2026-01-29T12:40:00"
}
```

---

## Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 OK | Request successful |
| 201 Created | Resource created successfully |
| 400 Bad Request | Invalid request parameters |
| 401 Unauthorized | Authentication required or failed |
| 403 Forbidden | Insufficient permissions |
| 404 Not Found | Resource not found |
| 409 Conflict | Resource conflict (e.g., duplicate) |
| 500 Internal Server Error | Server error |

---

## Enums Reference

### User.Status
- `ACTIVE` - User account is active
- `INACTIVE` - User account is inactive
- `BLOCKED` - User account is blocked

### User.Role
- `ROLE_ADMIN` - Administrator with full access
- `ROLE_HR` - HR personnel, can manage interns and generate certificates
- `ROLE_DIRECTOR` - Director, can sign certificates and embed QR codes

### Intern.Status
- `ONGOING` - Internship is currently ongoing
- `COMPLETED` - Internship completed successfully
- `CANCELLED` - Internship was cancelled

### Intern.InternshipType
- `PAID` - Paid internship
- `UNPAID` - Unpaid/Voluntary internship

### Certificate.Status
- `GENERATED` - Certificate generated but not signed
- `SIGNED` - Certificate digitally signed
- `REVOKED` - Certificate has been revoked

### Certificate.CertificateType
- `PARTICIPATION` - Participation certificate
- `COMPLETION` - Completion certificate

---

## Authentication Flow Example

### 1. Login
```bash
curl -X POST http://localhost:8080/api/auth/loginUser \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

### 2. Make Authenticated Request
```bash
curl -X GET http://localhost:8080/api/intern/getAllInterns \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### 3. Logout
```bash
curl -X POST http://localhost:8080/api/auth/logoutUser \
  -b cookies.txt
```

---

## Complete Workflow Example

### Certificate Generation Blockchain Flow

**Step 1: HR generates certificate on database**

**Step 2: Director signs certificate**

**Step 3: HR upload certificate to blockchain**

**Step 4: Public verification**

**Step 5: Optional - Revoke certificate on blockchain**


---

## Notes for Frontend Developers

1. **Cookie Handling**: 
   - Browser automatically handles JWT cookies
   - Ensure `credentials: 'include'` in fetch requests
   - Cookie expires after 10 hours

2. **File Upload**:
   - Use `multipart/form-data` for CSV upload
   - Maximum file size: Check server configuration

3. **PDF Download**:
   - Response is binary PDF
   - Use blob handling in JavaScript
   - Filename is in Content-Disposition header

4. **Date Formats**:
   - All dates are ISO 8601 format
   - DateTime: `2026-01-29T12:00:00`
   - Date only: `2026-01-29`

5. **Role-Based UI**:
   - Check user roles from `/api/auth/getCurrentUser`
   - Hide/disable features based on roles
   - ADMIN: User management
   - HR: Intern management, certificate generation, certificate revocation, blockchain upload
   - DIRECTOR: Certificate signing

6. **Error Handling**:
   - Always check `success` field in response
   - Display `message` to users
   - Use `error.details` for detailed error info

---

## Development Server Configuration

**Database**: PostgreSQL  
**Host**: `localhost:5000`  
**Database**: `drdo_internship_db`

**Mail Service**: Gmail SMTP  
**Port**: `587`

**Storage Paths**:
- Certificate PDFs: `give your system path here, e.g., C:/certificates/`

**Verification Base URL**: `http://localhost:8080/api/verification/verify/`

---

