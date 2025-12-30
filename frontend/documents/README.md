# Bank Employee Management Application

A modern, UX-focused Bank Employee Management Application built with React and Material-UI. This application provides a comprehensive platform for bank employees to manage their daily tasks, track attendance, manage skills, submit complaints, and report technical issues.

## 🌟 Features

### 🔐 Authentication
- Secure login system with bank branding
- Clean, corporate design with pastel color theme
- Demo credentials for Employee and Admin access
- Role-based navigation and access control

### 📊 Dashboard
- Welcome banner with employee information
- Quick-access cards for all major functions
- Analytics widgets showing attendance rate, tasks completed, and skill scores
- Responsive sidebar navigation

### 👤 Employee Tracking
- **Attendance Management**: One-click attendance marking with timestamp
- **Work Logging**: Add and track daily work items with hours
- **Self-Rating**: Daily productivity rating system (0-10 scale)
- **History Tracking**: View attendance history and work logs

### 🎓 Skill Management
- Monthly skill assessment system
- Progress tracking with visual indicators
- Test initiation for 3rd-party exam platforms
- Achievement tracking and reminders
- Multiple skill categories (Banking Operations, Customer Service, etc.)

### 📝 Complaint Register
- Professional complaint submission form
- Categorized complaints (HR, Workplace, IT, etc.)
- Priority levels (Low, Medium, High)
- Status tracking (Open, In Progress, Closed)
- Complete complaint history and filtering

### 🐛 Tech Issues Register
- Comprehensive technical issue reporting
- Detailed bug reporting with reproduction steps
- Impact level classification
- Category-based organization
- Expandable issue details with resolution tracking

## 🔧 **Admin Portal Features**

### 👥 Employee Management
- **Comprehensive Employee Directory**: View, search, and filter all employees
- **Add/Edit Employee**: Full employee lifecycle management
- **Role Management**: Assign Employee, Manager, Admin, or HR roles
- **Permission System**: Granular access control for system features
- **Status Management**: Activate/deactivate employee accounts
- **Activity Tracking**: Monitor employee system usage and performance
- **Photo Upload**: Optional employee profile pictures
- **Auto-generated IDs**: Automatic employee ID generation

### 📊 Advanced Analytics & Reports
- **Attendance Management**: Monitor all employee attendance with filters
- **Skill Test Reports**: Comprehensive testing analytics with charts
- **Complaint Overview**: Track and manage all employee complaints
- **Tech Issues & Approval Workflow**: Review and approve employee-reported issues
- **Excel Export**: Download detailed reports for all modules
- **Performance Trends**: Visual charts showing monthly improvements
- **Department Analytics**: Compare performance across departments

### 🏢 Branch Management System
- **Multi-Branch Support**: Support for multiple bank branches
- **Super Admin Role**: Access to all branches with branch selection dropdown
- **Branch Admin Role**: Limited access to specific branch employees
- **Branch Filtering**: All admin pages automatically filter data by selected branch
- **Branch Context**: Selected branch flows through all admin portal pages
- **Dynamic Branch Switching**: Super admins can switch between branches in real-time

### 🔒 Admin Security Features
- **Role-based Access Control**: Different permission levels for different roles
- **Audit Trails**: Track all administrative actions
- **Password Management**: Reset employee passwords
- **System Monitoring**: Overview of all system activities

## 🎨 Design System

### Color Palette
- **Primary**: Light Blue (#64B5F6) - Trust and reliability
- **Secondary**: Soft Green (#81C784) - Growth and success  
- **Background**: Very Light Blue-Gray (#F8FAFC) - Clean and professional
- **Text**: Dark Blue-Gray (#263238) - High readability

### UI Components
- **Cards**: Rounded corners (16px) with soft shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Rounded input fields with subtle backgrounds
- **Navigation**: Clean sidebar with selected state indicators

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone/Download the project**
   ```bash
   cd bank-employee-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Demo Login Credentials

#### Employee Access
- **Email**: `employee@bank.com`
- **Password**: `password123`

#### Admin Access (Branch-specific)
- **Email**: `admin@bank.com`
- **Password**: `admin123`
- **Access**: Limited to Main Branch employees and data

#### Super Admin Access (All branches)
- **Email**: `superadmin@bank.com`
- **Password**: `superadmin123`
- **Access**: Can view and manage all branches with branch selection dropdown

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)  
- Mobile devices (320px - 767px)

## 🛠️ Technology Stack

- **Frontend**: React 18.2.0
- **UI Library**: Material-UI (MUI) 5.11.10
- **Routing**: React Router DOM 6.8.1
- **Icons**: Material-UI Icons
- **Styling**: Emotion (CSS-in-JS)
- **Date Handling**: Day.js
- **Data Grid**: MUI X Data Grid (for advanced tables)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
│   ├── Login.jsx       # Authentication page (Employee + Admin)
│   ├── Dashboard.jsx   # Employee dashboard with layout
│   ├── EmployeeTracking.jsx
│   ├── SkillManagement.jsx
│   ├── ComplaintRegister.jsx
│   ├── TechIssuesRegister.jsx
│   └── admin/          # Admin Portal Pages
│       ├── AdminDashboard.jsx     # Admin home with analytics
│       ├── EmployeeManagement.jsx # Employee CRUD operations
│       ├── AddEditEmployee.jsx    # Employee form (Add/Edit)
│       ├── AttendanceManagement.jsx
│       ├── SkillTestReports.jsx
│       ├── ComplaintsOverview.jsx
│       ├── TechIssuesManagement.jsx
│       └── ReportsDownload.jsx
├── theme/              # MUI theme configuration
│   └── index.js        # Custom theme with banking colors
├── App.js              # Main app component with routing
└── index.js            # Application entry point
```

## ✨ Key Features Implementation

### 1. Attendance System
- Single-click attendance marking
- Automatic timestamp capture
- Local storage persistence
- Historical tracking

### 2. Work Tracking
- Add work items with title, description, and hours
- Visual progress indicators
- Daily summary calculations

### 3. Skill Assessments
- Multiple skill categories
- Progress visualization with linear progress bars
- Test initiation simulation (connects to 3rd-party platforms)
- Achievement system

### 4. Issue Management
- Structured complaint and tech issue forms
- Status workflow (Open → In Progress → Closed)
- Filtering and search capabilities
- Detailed issue tracking

## 🔒 Security Features

- Route protection with authentication checks
- Local storage for session management
- Input validation on all forms
- Secure navigation between protected routes

## 🎯 Future Enhancements

- **Backend Integration**: Connect to real banking APIs
- **Real-time Notifications**: Push notifications for updates
- **Advanced Analytics**: Detailed reporting and charts
- **Mobile App**: Native mobile application
- **SSO Integration**: Single Sign-On with bank systems
- **File Attachments**: Support for documents and images
- **Advanced Filtering**: More sophisticated search and filter options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Review the documentation

---

**Built with ❤️ for banking professionals**