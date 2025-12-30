import React, { useState } from 'react';
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
  LinearProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  PersonOutline,
  AccessTime,
  School,
  ReportProblem,
  BugReport,
  Logout,
  TrendingUp,
  Assignment,
  Stars,
  Notifications,
  AdminPanelSettings,
  EventAvailable,
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const employeeName = localStorage.getItem('employeeName') || 'John Doe';
  const employeeId = localStorage.getItem('employeeId') || 'EMP001';
  const hasAdminAccess = localStorage.getItem('hasAdminAccess') === 'true';
  const adminRole = localStorage.getItem('adminRole');

  const handleSwitchToAdmin = () => {
    localStorage.setItem('userRole', 'admin');
    navigate('/admin/dashboard');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Employee Tracking', icon: <PersonOutline />, path: '/employee-tracking' },
    { text: 'Leave Request', icon: <EventAvailable />, path: '/leave-request' },
    { text: 'Skill Management', icon: <School />, path: '/skill-management' },
    { text: 'Complaint Register', icon: <ReportProblem />, path: '/complaint-register' },
    { text: 'Tech Issues Register', icon: <BugReport />, path: '/tech-issues' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const drawer = (
    <Box>
      {/* Profile Section */}
      <Box sx={{ p: 3, textAlign: 'center', backgroundColor: '#F8FAFC' }}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #64B5F6, #42A5F5)',
          }}
        >
          {employeeName.split(' ').map(n => n[0]).join('')}
        </Avatar>
        <Typography variant="h6">{employeeName}</Typography>
        <Typography variant="body2" color="text.secondary">
          {employeeId}
        </Typography>
        <Chip
          label="Active"
          color="success"
          size="small"
          sx={{ mt: 1 }}
        />
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

      {/* Switch to Admin Panel (for Manager/CEO) */}
      {hasAdminAccess && (
        <>
          <List sx={{ px: 1, py: 1 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleSwitchToAdmin}
                sx={{ 
                  borderRadius: 2, 
                  color: 'primary.main',
                  backgroundColor: 'primary.lighter',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <AdminPanelSettings />
                </ListItemIcon>
                <ListItemText 
                  primary="Switch to Admin Panel" 
                  secondary={adminRole === 'superadmin' ? 'Super Admin Access' : 'Admin Access'}
                />
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
            Bank Employee Management
          </Typography>
          <IconButton color="inherit">
            <Notifications />
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

const Dashboard = () => {
  const navigate = useNavigate();
  const employeeName = localStorage.getItem('employeeName') || 'John Doe';

  const quickAccessCards = [
    {
      title: 'Attendance',
      description: 'Mark your daily attendance',
      icon: <AccessTime sx={{ fontSize: 40, color: '#64B5F6' }} />,
      color: '#E3F2FD',
      path: '/employee-tracking',
    },
    {
      title: 'Employee Tracking',
      description: 'Track work progress & ratings',
      icon: <PersonOutline sx={{ fontSize: 40, color: '#81C784' }} />,
      color: '#E8F5E8',
      path: '/employee-tracking',
    },
    {
      title: 'Skill Management',
      description: 'Take skill assessments',
      icon: <School sx={{ fontSize: 40, color: '#FFB74D' }} />,
      color: '#FFF3E0',
      path: '/skill-management',
    },
    {
      title: 'Complaint Register',
      description: 'Submit workplace complaints',
      icon: <ReportProblem sx={{ fontSize: 40, color: '#F48FB1' }} />,
      color: '#FCE4EC',
      path: '/complaint-register',
    },
    {
      title: 'Tech Issues Register',
      description: 'Report technical problems',
      icon: <BugReport sx={{ fontSize: 40, color: '#CE93D8' }} />,
      color: '#F3E5F5',
      path: '/tech-issues',
    },
  ];

  const analyticsCards = [
    {
      title: 'Attendance Rate',
      value: '92%',
      change: '+5%',
      icon: <TrendingUp />,
      color: 'success',
    },
    {
      title: 'Tasks Completed',
      value: '24',
      change: '+12%',
      icon: <Assignment />,
      color: 'primary',
    },
    {
      title: 'Skill Score',
      value: '8.5/10',
      change: '+0.5',
      icon: <Stars />,
      color: 'warning',
    },
  ];

  return (
    <Layout>
      <Box>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {employeeName.split(' ')[0]}! 👋
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Here's your overview for today, {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
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
                  <Chip
                    label={card.change}
                    color={card.color}
                    size="small"
                    variant="outlined"
                  />
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
            <Grid item xs={12} sm={6} md={4} key={index}>
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
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: card.color,
                        borderRadius: 3,
                        p: 2,
                        mr: 2,
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
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard;
export { Layout };