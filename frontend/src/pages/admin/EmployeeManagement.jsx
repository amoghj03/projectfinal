import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  TablePagination,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
} from '@mui/material';
import { useBranch } from '../../contexts/BranchContext';
import {
  Add,
  FilterList,
  Edit,
  Visibility,
  PersonOff,
  Person,
  Email,
  Phone,
  Business,
  CalendarToday,
  AdminPanelSettings,
  ManageAccounts,
  Work,
  Badge,
  PhotoCamera,
  Save,
  Cancel,
  Security,
  History,
  LockReset,
  AttachMoney,
} from '@mui/icons-material';
import { AdminLayout } from './AdminDashboard';
import { useNavigate } from 'react-router-dom';

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const { getEffectiveBranch, isSuperAdmin } = useBranch();
  const [showInactiveEmployees, setShowInactiveEmployees] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterEmployeeId, setFilterEmployeeId] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);

  // Mock employee data
  const [employees] = useState([
    {
      employeeId: 'EMP001',
      fullName: 'John Doe',
      email: 'john.doe@securebank.com',
      phone: '+1-555-0123',
      gender: 'Male',
      dateOfBirth: '1985-06-15',
      department: 'Customer Service',
      branch: 'Main Branch',
      role: 'Employee',
      status: 'Active',
      joinDate: '2020-01-15',
      salary: 45000,
      photo: null,
      lastLogin: '2024-11-22 09:15',
      assignedRoles: [] // No admin roles - regular employee
    },
    {
      employeeId: 'EMP002',
      fullName: 'Jane Smith',
      email: 'jane.smith@securebank.com',
      phone: '+1-555-0124',
      gender: 'Female',
      dateOfBirth: '1988-03-22',
      department: 'IT Support',
      branch: 'Tech Center',
      role: 'Manager',
      status: 'Active',
      joinDate: '2019-08-10',
      salary: 65000,
      photo: null,
      lastLogin: '2024-11-22 08:45',
      assignedRoles: [2] // Branch Admin role
    },
    {
      employeeId: 'EMP003',
      fullName: 'Mike Johnson',
      email: 'mike.johnson@securebank.com',
      phone: '+1-555-0125',
      gender: 'Male',
      dateOfBirth: '1982-11-08',
      department: 'Accounts',
      branch: 'Downtown Branch',
      role: 'Employee',
      status: 'Active',
      joinDate: '2021-03-05',
      salary: 48000,
      photo: null,
      lastLogin: '2024-11-21 16:30',
      assignedRoles: [] // No admin roles - regular employee
    },
    {
      employeeId: 'EMP004',
      fullName: 'Sarah Wilson',
      email: 'sarah.wilson@securebank.com',
      phone: '+1-555-0126',
      gender: 'Female',
      dateOfBirth: '1990-07-12',
      department: 'HR',
      branch: 'Main Branch',
      role: 'HR',
      status: 'Active',
      joinDate: '2018-11-20',
      salary: 58000,
      photo: null,
      lastLogin: '2024-11-22 10:00',
      assignedRoles: [3] // HR Manager role
    },
    {
      employeeId: 'EMP005',
      fullName: 'David Brown',
      email: 'david.brown@securebank.com',
      phone: '+1-555-0127',
      gender: 'Male',
      dateOfBirth: '1987-01-30',
      department: 'Security',
      branch: 'Main Branch',
      role: 'Manager',
      status: 'Active',
      joinDate: '2017-05-15',
      salary: 72000,
      photo: null,
      lastLogin: '2024-11-22 07:30',
      assignedRoles: [4] // Operations Manager role
    },
    {
      employeeId: 'EMP006',
      fullName: 'Lisa Garcia',
      email: 'lisa.garcia@securebank.com',
      phone: '+1-555-0128',
      gender: 'Female',
      dateOfBirth: '1992-04-18',
      department: 'Customer Service',
      branch: 'West Branch',
      role: 'Employee',
      status: 'Inactive',
      joinDate: '2022-01-10',
      salary: 42000,
      photo: null,
      lastLogin: '2024-10-15 14:22',
      assignedRoles: [] // No admin roles - regular employee
    }
  ]);

  // Available roles - should match RoleManagement
  const availableRoles = [
    { id: 1, name: 'Super Admin', color: 'error' },
    { id: 2, name: 'Branch Admin', color: 'error' },
    { id: 3, name: 'HR Manager', color: 'warning' },
    { id: 4, name: 'Operations Manager', color: 'info' },
  ];

  const roles = [
    { value: 'Employee', label: 'Employee', color: 'primary' },
    { value: 'Manager', label: 'Manager (Admin Access)', color: 'info' },
    { value: 'Admin', label: 'Admin', color: 'error' },
    { value: 'HR', label: 'HR', color: 'warning' },
    { value: 'CEO', label: 'CEO (Super Admin)', color: 'secondary' }
  ];

  const departments = [
    'Customer Service',
    'IT Support', 
    'Accounts',
    'HR',
    'Security',
    'Management',
    'Operations'
  ];

  const branches = [
    'Main Branch',
    'Downtown Branch',
    'West Branch',
    'East Branch',
    'Tech Center'
  ];

  const getRoleColor = (role) => {
    const roleInfo = roles.find(r => r.value === role);
    return roleInfo ? roleInfo.color : 'default';
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'error';
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesToggle = showInactiveEmployees || emp.status === 'Active';
    const matchesName = filterName === '' || 
      emp.fullName.toLowerCase().includes(filterName.toLowerCase());
    const matchesId = filterEmployeeId === '' || 
      emp.employeeId.toLowerCase().includes(filterEmployeeId.toLowerCase());
    const matchesRole = filterRole === '' || emp.role === filterRole;
    const matchesDepartment = filterDepartment === '' || emp.department === filterDepartment;
    const matchesStatus = filterStatus === '' || emp.status === filterStatus;
    
    // Branch filtering - Super admin sees all branches, regular admin sees only their branch
    const currentBranch = getEffectiveBranch();
    const matchesBranch = isSuperAdmin && currentBranch === 'All Branches' 
      ? true 
      : emp.branch === currentBranch;

    return matchesToggle && matchesName && matchesId && matchesRole && 
           matchesDepartment && matchesStatus && matchesBranch;
  });

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setViewDialog(true);
  };

  const handleEditEmployee = (employee) => {
    navigate('/admin/employee-management/edit', { state: { employee } });
  };

  const stats = {
    total: filteredEmployees.length,
    active: filteredEmployees.filter(emp => emp.status === 'Active').length,
    inactive: filteredEmployees.filter(emp => emp.status === 'Inactive').length,
    admins: filteredEmployees.filter(emp => emp.role === 'Admin').length,
    managers: filteredEmployees.filter(emp => emp.role === 'Manager').length,
    employees: filteredEmployees.filter(emp => emp.role === 'Employee').length
  };

  return (
    <AdminLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4">
              Employee Management
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Business fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">
                Viewing: {getEffectiveBranch()}
              </Typography>
              {!isSuperAdmin && (
                <Chip 
                  label="Branch Admin" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/employee-management/add')}
            sx={{ background: 'linear-gradient(135deg, #64B5F6, #42A5F5)' }}
          >
            Add New Employee
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'primary.main', mr: 2 }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.total}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'success.main', mr: 2 }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.active}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'error.main', mr: 2 }}>
                    <AdminPanelSettings />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.admins}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Admins
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'info.main', mr: 2 }}>
                    <ManageAccounts />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.managers}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Managers
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'warning.main', mr: 2 }}>
                    <Work />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.employees}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Staff
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'grey.500', mr: 2 }}>
                    <PersonOff />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.inactive}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Inactive
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Active/Inactive Toggle */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showInactiveEmployees}
                    onChange={(e) => setShowInactiveEmployees(e.target.checked)}
                    color="primary"
                  />
                }
                label="Show Inactive Employees"
              />
              <Typography variant="body2" color="text.secondary">
                Showing {filteredEmployees.length} of {employees.length} employees
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <FilterList />
              <TextField
                label="Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
              />
              <TextField
                label="Employee ID"
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  label="Role"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  label="Department"
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Employee Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Admin Roles</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Salary</TableCell>
                    <TableCell>Join Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((employee) => (
                      <TableRow key={employee.employeeId}>
                        <TableCell>{employee.employeeId}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: 14 }}>
                              {employee.fullName.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            {employee.fullName}
                          </Box>
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.phone}</TableCell>
                        <TableCell>
                          <Chip
                            label={employee.role}
                            color={getRoleColor(employee.role)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {employee.assignedRoles && employee.assignedRoles.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {employee.assignedRoles.map((roleId) => {
                                const role = availableRoles.find((r) => r.id === roleId);
                                return role ? (
                                  <Chip
                                    key={roleId}
                                    label={role.name}
                                    color={role.color}
                                    size="small"
                                    icon={<Security fontSize="small" />}
                                  />
                                ) : null;
                              })}
                            </Box>
                          ) : (
                            <Chip label="No Admin Access" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>₹{employee.salary ? employee.salary.toLocaleString() : 'N/A'}</TableCell>
                        <TableCell>{employee.joinDate}</TableCell>
                        <TableCell>
                          <Chip
                            label={employee.status}
                            color={getStatusColor(employee.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewEmployee(employee)}
                              title="View Details"
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEditEmployee(employee)}
                              title="Edit Employee"
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              color={employee.status === 'Active' ? 'error' : 'success'}
                              title={employee.status === 'Active' ? 'Disable' : 'Enable'}
                            >
                              {employee.status === 'Active' ? <PersonOff /> : <Person />}
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredEmployees.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </CardContent>
        </Card>

        {/* View Employee Details Dialog */}
        <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
          {selectedEmployee && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 48, height: 48 }}>
                    {selectedEmployee.fullName.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedEmployee.fullName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEmployee.employeeId} • {selectedEmployee.department}
                    </Typography>
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Personal Information</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><Email /></ListItemIcon>
                        <ListItemText 
                          primary="Email" 
                          secondary={selectedEmployee.email} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Phone /></ListItemIcon>
                        <ListItemText 
                          primary="Phone" 
                          secondary={selectedEmployee.phone} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Person /></ListItemIcon>
                        <ListItemText 
                          primary="Gender" 
                          secondary={selectedEmployee.gender} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CalendarToday /></ListItemIcon>
                        <ListItemText 
                          primary="Date of Birth" 
                          secondary={selectedEmployee.dateOfBirth} 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Professional Details</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><Business /></ListItemIcon>
                        <ListItemText 
                          primary="Department" 
                          secondary={selectedEmployee.department} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Business /></ListItemIcon>
                        <ListItemText 
                          primary="Branch" 
                          secondary={selectedEmployee.branch} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Badge /></ListItemIcon>
                        <ListItemText 
                          primary="Role" 
                          secondary={
                            <Chip 
                              label={selectedEmployee.role} 
                              color={getRoleColor(selectedEmployee.role)}
                              size="small"
                            />
                          } 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CalendarToday /></ListItemIcon>
                        <ListItemText 
                          primary="Join Date" 
                          secondary={selectedEmployee.joinDate} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><AttachMoney /></ListItemIcon>
                        <ListItemText 
                          primary="Annual Salary" 
                          secondary={selectedEmployee.salary ? `₹${selectedEmployee.salary.toLocaleString()}` : 'Not specified'} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><History /></ListItemIcon>
                        <ListItemText 
                          primary="Last Login" 
                          secondary={selectedEmployee.lastLogin} 
                        />
                      </ListItem>
                    </List>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettings />
                        Assigned Roles
                      </Box>
                    </Typography>
                    {selectedEmployee.assignedRoles && selectedEmployee.assignedRoles.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedEmployee.assignedRoles.map((roleId) => {
                          const role = availableRoles.find((r) => r.id === roleId);
                          return role ? (
                            <Chip
                              key={roleId}
                              label={role.name}
                              color={role.color}
                              icon={<Security />}
                              sx={{ fontWeight: 'bold' }}
                            />
                          ) : null;
                        })}
                      </Box>
                    ) : (
                      <Alert severity="info">
                        <Typography variant="body2">
                          No admin roles assigned. This user has standard employee access only.
                        </Typography>
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setViewDialog(false)}>Close</Button>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    setViewDialog(false);
                    handleEditEmployee(selectedEmployee);
                  }}
                >
                  Edit Employee
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default EmployeeManagement;