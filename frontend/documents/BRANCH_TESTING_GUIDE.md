# Super Admin & Branch Management Testing Guide

## Overview
This guide helps you test the new Super Admin role and branch management functionality.

## Test Credentials

### 1. Regular Admin (Branch-specific access)
- **Email**: `admin@bank.com`
- **Password**: `admin123`
- **Expected Behavior**: 
  - Can only see "Main Branch" in branch dropdown (disabled)
  - Can only view/manage employees from Main Branch
  - Shows "Branch Admin" chip in profile
  - Branch selection is disabled

### 2. Super Admin (All branches access)
- **Email**: `superadmin@bank.com`
- **Password**: `superadmin123`
- **Expected Behavior**:
  - Can see all branches in dropdown (enabled)
  - Default selection: "All Branches"
  - Can switch between branches dynamically
  - Shows "Super Admin" chip in profile
  - Branch selection flows to all admin pages

## Testing Steps

### Step 1: Test Regular Admin Login
1. Login with `admin@bank.com` / `admin123`
2. Verify the sidebar shows:
   - "System Administrator" role
   - "Admin Access" chip
   - Branch dropdown showing "Main Branch" (disabled)
3. Navigate to Employee Management
4. Verify you only see employees from "Main Branch"
5. Check that page header shows "Viewing: Main Branch" with "Branch Admin" chip

### Step 2: Test Super Admin Login
1. Logout and login with `superadmin@bank.com` / `superadmin123`
2. Verify the sidebar shows:
   - "Super Administrator" role
   - "Super Admin Access" chip (blue color)
   - Branch dropdown showing "All Branches" (enabled)
3. Verify the main dashboard shows:
   - "Super Admin" chip in top-right corner
   - Current branch name display

### Step 3: Test Branch Switching (Super Admin)
1. In Employee Management, note the current employee count
2. Use the branch dropdown in sidebar to select "Main Branch"
3. Verify employee list filters to only show Main Branch employees
4. Switch to "Downtown Branch" - employee list should update
5. Switch back to "All Branches" - should show all employees again

### Step 4: Test Branch Context Flow
1. As Super Admin, select "Main Branch" from sidebar dropdown
2. Navigate between different admin pages:
   - Employee Management
   - Attendance Management
   - Complaints Overview
3. Verify each page maintains "Main Branch" context
4. Check page headers show "Viewing: Main Branch"

## Expected Results

### Branch Filtering
- **All Branches**: Shows all employee data across all branches
- **Specific Branch**: Shows only employees assigned to that branch
- **Branch persistence**: Selected branch should persist across page navigation

### UI Indicators
- Branch name displayed prominently on each admin page
- Role-specific chips (Admin Access vs Super Admin Access)
- Enabled/disabled branch dropdown based on role
- Consistent branch context across all admin pages

### Employee Data
Sample employees by branch:
- **Main Branch**: John Doe (EMP001), Sarah Wilson (EMP004), David Brown (EMP005)
- **Downtown Branch**: Mike Johnson (EMP003)
- **Tech Center**: Jane Smith (EMP002)
- **West Branch**: Lisa Garcia (EMP006)

## Troubleshooting

### Branch not persisting
- Check localStorage for 'selectedBranch' key
- Verify BranchContext is properly wrapped around admin routes

### Dropdown not working
- Ensure user has 'superadmin' role in localStorage
- Check 'adminRole' localStorage key

### Employee filtering issues
- Verify employee data includes 'branch' field
- Check branch comparison logic in filteredEmployees function

## Technical Implementation Notes

### localStorage Keys Used
- `adminName`: Admin user name
- `adminRole`: 'admin' or 'superadmin'
- `adminBranch`: Default branch for regular admins
- `selectedBranch`: Currently selected branch (for super admins)
- `userRole`: Always 'admin' for both admin types

### Branch Context API
```javascript
const {
  selectedBranch,        // Currently selected branch
  adminRole,             // 'admin' or 'superadmin'
  adminBranch,           // Default admin branch
  branches,              // Array of all branches
  updateSelectedBranch,  // Function to change branch
  isSuperAdmin,          // Boolean helper
  getEffectiveBranch     // Gets current effective branch
} = useBranch();
```