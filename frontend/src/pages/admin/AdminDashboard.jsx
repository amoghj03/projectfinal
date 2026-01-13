import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  useMediaQuery,
  useTheme,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AdminPanelSettings,
  People,
  Assessment,
  ReportProblem,
  BugReport,
  FileDownload,
  Dashboard as DashboardIcon,
  Logout,
  Notifications,
  TrendingUp,
  CheckCircle,
  Warning,
  Assignment,
  Business,
  Receipt,
  PersonOutline,
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useBranch } from '../../contexts/BranchContext';
import dashboardService from '../../services/dashboardService';

const drawerWidth = 280;

const AdminLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedBranch, adminRole, adminBranch, branches, updateSelectedBranch, isSuperAdmin, getEffectiveBranch } = useBranch();
  
  const adminName = localStorage.getItem('adminName') || 'Admin User';
  const hasAdminAccess = localStorage.getItem('hasAdminAccess') === 'true';
  
  // Get admin permissions from localStorage
  const getAdminPermissions = () => {
    try {
      const permissions = localStorage.getItem('adminPermissions');
      return permissions ? JSON.parse(permissions) : null;
    } catch {
      return null;
    }
  };

  const adminPermissions = getAdminPermissions();

  const handleBackToEmployee = () => {
    localStorage.setItem('userRole', 'employee');
    navigate('/dashboard');
  };

  const allMenuItems = [
    { text: 'Admin Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard', permission: 'dashboard' },
    { text: 'Employee Management', icon: <People />, path: '/admin/employee-management', permission: 'employeeManagement' },
    { text: 'Role Management', icon: <AdminPanelSettings />, path: '/admin/role-management', permission: 'roleManagement' },
    { text: 'Leave Management', icon: <Assignment />, path: '/admin/leave-management', permission: 'leaveManagement' },
    { text: 'Attendance Management', icon: <Assignment />, path: '/admin/attendance', permission: 'attendance' },
    { text: 'Payslip Generation', icon: <Receipt />, path: '/admin/payslip', permission: 'payslip' },
    { text: 'Skill Test Reports', icon: <Assessment />, path: '/admin/skill-reports', permission: 'skillReports' },
    { text: 'Complaints Overview', icon: <ReportProblem />, path: '/admin/complaints', permission: 'complaints' },
    { text: 'Tech Issues & Approvals', icon: <BugReport />, path: '/admin/tech-issues', permission: 'techIssues' },
    { text: 'Reports Download', icon: <FileDownload />, path: '/admin/reports', permission: 'reports' },
  ];

  // Filter menu items based on permissions (if permissions are set)
  const menuItems = adminPermissions 
    ? allMenuItems.filter(item => adminPermissions[item.permission] === true)
    : allMenuItems; // Show all if no permissions are set (backward compatibility)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleBranchChange = (event) => {
    updateSelectedBranch(event.target.value);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const drawer = (
    <Box>
      {/* Admin Profile Section */}
      <Box sx={{ p: 3, textAlign: 'center', backgroundColor: '#F0F4F8' }}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
          }}
        >
          <AdminPanelSettings />
        </Avatar>
        <Typography variant="h6">{adminName}</Typography>
        <Typography variant="body2" color="text.secondary">
          {isSuperAdmin ? 'Super Administrator' : 'System Administrator'}
        </Typography>
        <Chip
          label={isSuperAdmin ? 'Super Admin Access' : 'Admin Access'}
          color={isSuperAdmin ? 'primary' : 'secondary'}
          size="small"
          sx={{ mt: 1 }}
        />
        
        {/* Branch Selection Dropdown */}
        <Box sx={{ mt: 2, width: '100%' }}>
          <FormControl fullWidth size="small">
            <InputLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Business fontSize="small" />
                Branch
              </Box>
            </InputLabel>
            <Select
              value={getEffectiveBranch()}
              onChange={handleBranchChange}
              label="Branch"
              disabled={!isSuperAdmin}
            >
              {isSuperAdmin ? (
                branches.map((branch) => (
                  <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                ))
              ) : (
                <MenuItem value={adminBranch}>{adminBranch}</MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* Back to Employee Portal (for Manager/CEO) */}
      {hasAdminAccess && (
        <>
          <List sx={{ px: 1, py: 1 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleBackToEmployee}
                sx={{ 
                  borderRadius: 2, 
                  color: 'success.main',
                  backgroundColor: 'success.lighter',
                  '&:hover': {
                    backgroundColor: 'success.light',
                    color: 'white',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <PersonOutline />
                </ListItemIcon>
                <ListItemText primary="Back to Employee Portal" />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider sx={{ mx: 2 }} />
        </>
      )}

      {/* Logout */}
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{ borderRadius: 2, color: 'error.main' }}
          >
            <ListItemIcon sx={{ color: 'error.main' }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Bank Admin Portal
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        {children || <Outlet />}
      </Box>
    </Box>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { getEffectiveBranch, isSuperAdmin } = useBranch();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const hasFetchedRef = useRef(false);
  const previousBranchRef = useRef(null);

  // Get the current branch value
  const currentBranch = getEffectiveBranch();

  // Fetch admin dashboard stats
  useEffect(() => {
    // Only fetch if we haven't fetched yet OR if the branch has changed
    if (!hasFetchedRef.current || previousBranchRef.current !== currentBranch) {
      hasFetchedRef.current = true;
      previousBranchRef.current = currentBranch;
      fetchDashboardStats();
    }
  }, [currentBranch]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getAdminDashboardStats(currentBranch);
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" action={
            <IconButton color="inherit" size="small" onClick={fetchDashboardStats}>
              <TrendingUp />
            </IconButton>
          }>
            {error}
          </Alert>
        </Box>
      </AdminLayout>
    );
  }

  // Show message if no stats
  if (!stats) {
    return (
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="info">No dashboard data available</Alert>
        </Box>
      </AdminLayout>
    );
  }

  const quickAccessCards = [
    {
      title: 'Attendance Management',
      description: 'View and manage employee attendance',
      icon: <People sx={{ fontSize: 40, color: '#64B5F6' }} />,
      color: '#E3F2FD',
      path: '/admin/attendance',
      count: `${stats?.presentToday ?? 0}/${stats?.totalEmployees ?? 0}`,
    },
    {
      title: 'Skill Test Reports',
      description: 'Review skill assessment results',
      icon: <Assessment sx={{ fontSize: 40, color: '#81C784' }} />,
      color: '#E8F5E8',
      path: '/admin/skill-reports',
      count: `${stats?.monthlyTestAvg ?? 0}% avg`,
    },
    {
      title: 'Complaints Overview',
      description: 'Monitor and resolve complaints',
      icon: <ReportProblem sx={{ fontSize: 40, color: '#FFB74D' }} />,
      color: '#FFF3E0',
      path: '/admin/complaints',
      count: `${stats?.openComplaints ?? 0} open`,
    },
    {
      title: 'Tech Issues & Approvals',
      description: 'Approve technical issue resolutions',
      icon: <BugReport sx={{ fontSize: 40, color: '#F48FB1' }} />,
      color: '#FCE4EC',
      path: '/admin/tech-issues',
      count: `${stats?.techIssuesPending ?? 0} pending`,
    },
  ];

  const analyticsCards = [
    {
      title: 'Present Today',
      value: `${stats?.presentToday ?? 0}/${stats?.totalEmployees ?? 0}`,
      change: `${stats?.totalEmployees ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0}% attendance rate`,
      icon: <TrendingUp />,
      color: 'success',
    },
    {
      title: 'Open Issues',
      value: (stats?.openComplaints ?? 0) + (stats?.techIssuesPending ?? 0),
      change: `${stats?.leaveRequestsPending ?? 0} pending approvals`,
      icon: <Warning />,
      color: 'warning',
    },
    {
      title: 'Monthly Tests',
      value: `${stats?.monthlyTestAvg ?? 0}%`,
      change: `${stats?.attendanceRate ?? 0}% attendance`,
      icon: <Assignment />,
      color: 'primary',
    },
  ];

  return (
    <AdminLayout>
      <Box>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Admin Panel 👨‍💼
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                System overview for {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Business fontSize="small" color="primary" />
                <Typography variant="body1" fontWeight="medium">
                  {getEffectiveBranch()}
                </Typography>
              </Box>
              <Chip 
                label={isSuperAdmin ? 'Super Admin' : 'Branch Admin'} 
                color={isSuperAdmin ? 'primary' : 'secondary'}
                size="small"
                variant={isSuperAdmin ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>
        </Box>

        {/* Analytics Widgets */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {analyticsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ backgroundColor: `${card.color}.main`, mr: 2 }}>
                      {card.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{card.value}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.title}
                      </Typography>
                    </Box>
                  </Box>
                  {card.percentage && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`${card.percentage}%`}
                        color={card.color}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        attendance rate
                      </Typography>
                    </Box>
                  )}
                  {card.change && (
                    <Chip
                      label={card.change}
                      color={card.color}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Access Cards */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Quick Access
        </Typography>
        <Grid container spacing={3}>
          {quickAccessCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                }}
                onClick={() => navigate(card.path)}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          backgroundColor: card.color,
                          borderRadius: 3,
                          p: 2,
                          mr: 3,
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {card.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {card.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="primary">
                        {card.count}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard;
export { AdminLayout };