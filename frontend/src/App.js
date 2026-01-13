import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import { BranchProvider } from './contexts/BranchContext';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeTracking from './pages/EmployeeTracking';
import LeaveRequest from './pages/LeaveRequest';
import SkillManagement from './pages/SkillManagement';
import ComplaintRegister from './pages/ComplaintRegister';
import TechIssuesRegister from './pages/TechIssuesRegister';

// Import admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import AddEditEmployee from './pages/admin/AddEditEmployee';
import RoleManagement from './pages/admin/RoleManagement';
import LeaveManagement from './pages/admin/LeaveManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import SkillTestReports from './pages/admin/SkillTestReports';
import ComplaintsOverview from './pages/admin/ComplaintsOverview';
import TechIssuesManagement from './pages/admin/TechIssuesManagement';
import ReportsDownload from './pages/admin/ReportsDownload';
import PayslipGeneration from './pages/admin/PayslipGeneration';

// Protected Route Components
const EmployeeProtectedRoute = ({ children, requiredPermission }) => {
  const employeeName = localStorage.getItem('employeeName');
  const userRole = localStorage.getItem('userRole');
  
  if (!employeeName || userRole !== 'employee') {
    return <Navigate to="/" replace />;
  }
  
  // Check if specific permission is required
  if (requiredPermission) {
    try {
      const permissions = localStorage.getItem('employeePermissions');
      if (permissions) {
        const employeePermissions = JSON.parse(permissions);
        // Check if permission exists and is true
        if (employeePermissions[requiredPermission] !== true) {
          // User doesn't have permission for this page
          return <Navigate to="/dashboard" replace />;
        }
      } else {
        // No permissions stored, deny access
        return <Navigate to="/dashboard" replace />;
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
};

const AdminProtectedRoute = ({ children, requiredPermission }) => {
  const adminName = localStorage.getItem('adminName');
  const userRole = localStorage.getItem('userRole');
  
  if (!adminName || userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  // Check if specific permission is required
  if (requiredPermission) {
    try {
      const permissions = localStorage.getItem('adminPermissions');
      if (permissions) {
        const adminPermissions = JSON.parse(permissions);
        if (!adminPermissions[requiredPermission]) {
          // User doesn't have permission for this page
          return <Navigate to="/admin/dashboard" replace />;
        }
      }
      // If no permissions set, allow access (backward compatibility)
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }
  
  return (
    <BranchProvider>
      {children}
    </BranchProvider>
  );
};

function  App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <EmployeeProtectedRoute requiredPermission="dashboard">
                <Dashboard />
              </EmployeeProtectedRoute>
            } 
          />
          
          <Route 
            path="/employee-tracking" 
            element={
              <EmployeeProtectedRoute requiredPermission="attendance">
                <EmployeeTracking />
              </EmployeeProtectedRoute>
            } 
          />
          
          <Route 
            path="/leave-request" 
            element={
              <EmployeeProtectedRoute requiredPermission="leaveRequest">
                <LeaveRequest />
              </EmployeeProtectedRoute>
            } 
          />
          
          <Route 
            path="/skill-management" 
            element={
              <EmployeeProtectedRoute requiredPermission="skillManagement">
                <SkillManagement />
              </EmployeeProtectedRoute>
            } 
          />
          
          <Route 
            path="/complaint-register" 
            element={
              <EmployeeProtectedRoute requiredPermission="complaints">
                <ComplaintRegister />
              </EmployeeProtectedRoute>
            } 
          />
          
          <Route 
            path="/tech-issues" 
            element={
              <EmployeeProtectedRoute requiredPermission="techIssues">
                <TechIssuesRegister />
              </EmployeeProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminProtectedRoute requiredPermission="dashboard">
                <AdminDashboard />
              </AdminProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/employee-management" 
            element={
              <AdminProtectedRoute requiredPermission="employeeManagement">
                <EmployeeManagement />
              </AdminProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/employee-management/add" 
            element={
              <AdminProtectedRoute requiredPermission="employeeManagement">
                <AddEditEmployee />
              </AdminProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/employee-management/edit/:id" 
            element={
              <AdminProtectedRoute requiredPermission="employeeManagement">
                <AddEditEmployee />
              </AdminProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/role-management" 
            element={
              <AdminProtectedRoute requiredPermission="roleManagement">
                <RoleManagement />
              </AdminProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/leave-management" 
            element={
              <AdminProtectedRoute requiredPermission="leaveManagement">
                <LeaveManagement />
              </AdminProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/attendance" 
            element={
              <AdminProtectedRoute requiredPermission="attendance">
                <AttendanceManagement />
              </AdminProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/skill-reports" 
            element={
              <AdminProtectedRoute requiredPermission="skillReports">
                <SkillTestReports />
              </AdminProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/complaints" 
            element={
              <AdminProtectedRoute requiredPermission="complaints">
                <ComplaintsOverview />
              </AdminProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/tech-issues" 
            element={
              <AdminProtectedRoute requiredPermission="techIssues">
                <TechIssuesManagement />
              </AdminProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/reports" 
            element={
              <AdminProtectedRoute requiredPermission="reports">
                <ReportsDownload />
              </AdminProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/payslip" 
            element={
              <AdminProtectedRoute requiredPermission="payslip">
                <PayslipGeneration />
              </AdminProtectedRoute>
            } 
          />
          
          {/* Catch all route - redirect based on user role */}
          <Route 
            path="*" 
            element={
              localStorage.getItem('userRole') === 'admin' ? 
                <Navigate to="/admin/dashboard" replace /> :
                localStorage.getItem('userRole') === 'employee' ? 
                  <Navigate to="/dashboard" replace /> : 
                  <Navigate to="/" replace />
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;