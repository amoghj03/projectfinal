# Role-Based Access Control for Employee Pages - Implementation Summary

## Overview

Implemented role-based access control (RBAC) for all employee pages, similar to the existing admin route protection. This ensures that employees can only access pages they have permissions for.

## Changes Made

### 1. Frontend Changes

#### App.js

- **Updated `EmployeeProtectedRoute` component**: Added `requiredPermission` prop to check employee permissions
- **Added permission checks to all employee routes**:
  - `/dashboard` → requires `dashboard` permission
  - `/employee-tracking` → requires `attendance` permission
  - `/leave-request` → requires `leaveRequest` permission
  - `/skill-management` → requires `skillManagement` permission
  - `/complaint-register` → requires `complaints` permission
  - `/tech-issues` → requires `techIssues` permission

#### authService.js

- Added storage for `employeePermissions` in localStorage during login
- Employee permissions are now stored and checked separately from admin permissions

### 2. Backend Changes

#### AuthService.cs

- **Separated permission handling**: Created separate dictionaries for admin and employee permissions
- **Employee permission mapping**:
  - `dashboard` → `dashboard.view`
  - `attendance` → `employee.view`
  - `leaveRequest` → `leave.request`
  - `skillManagement` → `skill.manage`
  - `complaints` → `complaint.create`
  - `techIssues` → `techissue.create`
- All permissions are fetched from the database through role_permissions

#### LoginResponse.cs (DTOs)

- Added `EmployeePermissions` property to `UserData` class
- Returns both admin and employee permissions in login response

### 3. Database Changes

#### Permissions Already Available

The following permissions already exist in the `permissions` table:

- `dashboard.view` (id: 1)
- `employee.view` (id: 2)
- `leave.request` (id: 3)
- `skill.manage` (id: 4)
- `complaint.create` (id: 5)
- `techissue.create` (id: 6)

#### SQL Script to Execute

Run `employee_permissions_setup.sql` to assign permissions to the Employee role:

```sql
INSERT INTO role_permissions (role_id, permission_id, created_at)
VALUES
    (3, 1, NOW()),  -- dashboard.view
    (3, 2, NOW()),  -- employee.view
    (3, 3, NOW()),  -- leave.request
    (3, 4, NOW()),  -- skill.manage
    (3, 5, NOW()),  -- complaint.create
    (3, 6, NOW());  -- techissue.create
```

## How It Works

1. **Login Process**:

   - User logs in with credentials
   - Backend fetches user's roles and associated permissions from database
   - Backend returns both `adminPermissions` and `employeePermissions` in login response
   - Frontend stores both permission sets in localStorage

2. **Route Protection**:

   - When navigating to a protected route, `EmployeeProtectedRoute` checks:
     - If user is logged in
     - If user has the required permission for that specific page
   - If permission is missing, user is redirected to dashboard

3. **Permission Check**:
   - Permissions are stored as a JSON object in localStorage
   - Each page checks for a specific permission key
   - If permission is `false` or missing, access is denied

## Benefits

1. **Granular Access Control**: Each page can be independently controlled
2. **Database-Driven**: Permissions are stored in database and can be modified without code changes
3. **Scalable**: Easy to add new permissions for new features
4. **Consistent**: Same pattern used for both employee and admin routes
5. **Secure**: Backend validates permissions, frontend just provides UX

## Testing

After running the SQL script, test by:

1. Logging in as an employee (john@acme.com)
2. Verify access to all employee pages
3. Try removing a permission from the database and verify access is denied
4. Check that navigation properly redirects when permission is missing

## Future Enhancements

- Add permission management UI for administrators
- Implement real-time permission updates without re-login
- Add permission groups for easier management
- Audit log for permission changes
