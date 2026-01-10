-- PostgreSQL Database Initialization Script for HRMS
-- Run this script to create tables and initial data

-- Drop existing tables if they exist (use with caution in production)
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS payslips CASCADE;
-- DROP TABLE IF EXISTS tech_issues CASCADE;
-- DROP TABLE IF EXISTS complaints CASCADE;
-- DROP TABLE IF EXISTS employee_skill_tests CASCADE;
-- DROP TABLE IF EXISTS skill_tests CASCADE;
-- DROP TABLE IF EXISTS skills CASCADE;
-- DROP TABLE IF EXISTS work_logs CASCADE;
-- DROP TABLE IF EXISTS leave_balances CASCADE;
-- DROP TABLE IF EXISTS leave_requests CASCADE;
-- DROP TABLE IF EXISTS leave_types CASCADE;
-- DROP TABLE IF EXISTS attendance CASCADE;
-- DROP TABLE IF EXISTS employee_roles CASCADE;
-- DROP TABLE IF EXISTS role_permissions CASCADE;
-- DROP TABLE IF EXISTS permissions CASCADE;
-- DROP TABLE IF EXISTS roles CASCADE;
-- DROP TABLE IF EXISTS employees CASCADE;
-- DROP TABLE IF EXISTS branches CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS tenants CASCADE;

-- Create tables
CREATE TABLE tenants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    subdomain VARCHAR(100) UNIQUE,
    logo_url TEXT,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    timezone VARCHAR(100) DEFAULT 'UTC',
    currency VARCHAR(10) DEFAULT 'USD',
    settings JSONB DEFAULT '{}',
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    subscription_status VARCHAR(50) DEFAULT 'trial',
    subscription_expires_at TIMESTAMP,
    max_employees INT DEFAULT 50,
    max_branches INT DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    onboarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, email)
);

CREATE TABLE branches (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, code)
);

CREATE TABLE employees (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    gender VARCHAR(50),
    date_of_birth DATE,
    photo_url TEXT,
    department VARCHAR(100) NOT NULL,
    branch_id BIGINT REFERENCES branches(id),
    job_role VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    join_date DATE NOT NULL,
    salary DECIMAL(12,2),
    address TEXT,
    emergency_contact VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, employee_id),
    UNIQUE (tenant_id, email)
);

CREATE TABLE roles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, name)
);

CREATE TABLE permissions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (role_id, permission_id)
);

CREATE TABLE employee_roles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by BIGINT REFERENCES employees(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (employee_id, role_id)
);

CREATE TABLE attendance (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    status VARCHAR(50),
    work_hours DECIMAL(4,2),
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, employee_id, date)
);

CREATE TABLE leave_types (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_days_per_year INT,
    requires_approval BOOLEAN DEFAULT true,
    is_paid BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, name)
);

CREATE TABLE leave_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id BIGINT REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(3,1) NOT NULL,
    is_half_day BOOLEAN DEFAULT false,
    half_day_period VARCHAR(20),
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by BIGINT REFERENCES employees(id),
    reviewed_at TIMESTAMP,
    review_remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leave_balances (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id BIGINT REFERENCES leave_types(id),
    year INT NOT NULL,
    total_allocated DECIMAL(4,1) NOT NULL,
    used DECIMAL(4,1) DEFAULT 0,
    pending DECIMAL(4,1) DEFAULT 0,
    available DECIMAL(4,1) GENERATED ALWAYS AS (total_allocated - used - pending) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (employee_id, leave_type_id, year)
);

CREATE TABLE work_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    hours DECIMAL(4,2) NOT NULL,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, name)
);

CREATE TABLE skill_tests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    skill_id BIGINT REFERENCES skills(id),
    description TEXT,
    total_questions INT,
    passing_score INT,
    duration_minutes INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employee_skill_tests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    skill_test_id BIGINT REFERENCES skill_tests(id),
    score INT NOT NULL,
    max_score INT NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS ((score::DECIMAL / max_score::DECIMAL) * 100) STORED,
    status VARCHAR(50),
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE complaints (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    complaint_number VARCHAR(50) NOT NULL,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Open',
    assigned_to BIGINT REFERENCES employees(id),
    resolved_at TIMESTAMP,
    requires_approval BOOLEAN DEFAULT true,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, complaint_number)
);

CREATE TABLE tech_issues (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    issue_number VARCHAR(50) NOT NULL,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Pending',
    requires_approval BOOLEAN DEFAULT true,
    approved_by BIGINT REFERENCES employees(id),
    approved_at TIMESTAMP,
    assigned_to BIGINT REFERENCES employees(id),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, issue_number)
);

CREATE TABLE payslips (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    month INT NOT NULL,
    year INT NOT NULL,
    basic_salary DECIMAL(12,2) NOT NULL,
    allowances JSONB,
    deductions JSONB,
    gross_salary DECIMAL(12,2) NOT NULL,
    net_salary DECIMAL(12,2) NOT NULL,
    working_days INT,
    present_days INT,
    leave_days DECIMAL(3,1),
    status VARCHAR(50) DEFAULT 'Generated',
    generated_by BIGINT REFERENCES employees(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    acknowledged_at TIMESTAMP,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (employee_id, month, year)
);

CREATE TABLE notifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    category VARCHAR(50),
    reference_id BIGINT,
    reference_type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),
    employee_id BIGINT REFERENCES employees(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    changes JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE settings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT NOT NULL
        REFERENCES tenants(id) ON DELETE CASCADE,
    key VARCHAR(150) NOT NULL,
    value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, key)
);

INSERT INTO settings (tenant_id, key, value)
VALUES
(1, 'RequireComplaintApproval', 'true'),(1, 'TechIssueApproval', 'true');



-- Insert initial data
INSERT INTO tenants (name, slug, subdomain, contact_email, country, timezone, subscription_plan, subscription_status, max_employees)
VALUES ('Acme Corporation','acme','acme','admin@acme.com','USA','America/New_York','premium','active',200);

INSERT INTO users (tenant_id, email, password_hash, role) VALUES
(1, 'admin@acme.com','$2a$11$hashed_password_here','admin'),
(1, 'john@acme.com','$2a$11$hashed_password_here','employee'),
(1, 'hr@acme.com','$2a$11$hashed_password_here','employee');

INSERT INTO branches (tenant_id, name, code, city, country) VALUES
(1,'Head Office','HO','New York','USA'),
(1,'West Branch','WB','San Francisco','USA');

INSERT INTO employees (tenant_id, user_id, employee_id, full_name, email, department, branch_id, job_role, join_date, salary) VALUES
(1,1,'EMP-ACME-001','Admin User','admin@acme.com','Management',1,'Admin','2023-01-01',120000),
(1,2,'EMP-ACME-002','John Doe','john@acme.com','Engineering',1,'Software Engineer','2023-03-01',90000),
(1,3,'EMP-ACME-003','HR Manager','hr@acme.com','HR',2,'HR Manager','2023-02-01',80000);

INSERT INTO roles (tenant_id, name, description, is_system) VALUES
(1,'Admin','System Administrator',true),
(1,'SUPER_ADMIN','Human Resources',true),
(1,'Employee','Regular Employee',true);

INSERT INTO permissions (name, display_name, description, category) VALUES
('dashboard.view', 'View Dashboard', 'Access main dashboard', 'core'),
('employee.view', 'View Employee Profile', 'View own employee details', 'core'),
('leave.request', 'Request Leave', 'Submit leave request', 'core'),
('skill.manage', 'Manage Skills', 'Add or update skills', 'core'),
('complaint.create', 'Raise Complaint', 'Register a complaint', 'support'),
('techissue.create', 'Raise Tech Issue', 'Register technical issues', 'support'),
('admin.dashboard.view', 'View Admin Dashboard', 'Access admin dashboard', 'admin'),
('employee.manage', 'Manage Employees', 'Create, update, deactivate employees', 'management'),
('role.manage', 'Manage Roles & Permissions', 'Assign permissions to roles', 'admin'),
('leave.approve', 'Approve Leave', 'Approve or reject leave requests', 'management'),
('attendance.manage', 'Manage Attendance', 'Edit and manage attendance records', 'management'),
('payslip.generate', 'Generate Payslips', 'Generate and publish payslips', 'payroll'),
('skill.report.view', 'View Skill Reports', 'View skill assessment reports', 'reports'),
('complaint.manage', 'Manage Complaints', 'View and resolve complaints', 'support'),
('techissue.manage', 'Manage Tech Issues', 'Approve and resolve tech issues', 'support'),
('report.download', 'Download Reports', 'Download system reports', 'reports');


INSERT INTO
	ROLE_PERMISSIONS (ROLE_ID, PERMISSION_ID, CREATED_AT)
VALUES
	(1, 8, NOW()),
	(1, 7, NOW()),
	(1, 9, NOW()),
	(1, 10, NOW()),
	(1, 11, NOW()),
	(1, 12, NOW()),
	(1, 13, NOW()),
	(1, 14, NOW()),
	(1, 15, NOW()),
	(1, 16, NOW());

INSERT INTO employee_roles (employee_id, role_id, assigned_by) VALUES
(1,1,1),
(3,2,1),
(2,3,1);

INSERT INTO leave_types (tenant_id, name, max_days_per_year) VALUES
(1,'Sick Leave',10),
(1,'Casual Leave',12),
(1,'Annual Leave',15);

INSERT INTO leave_balances (tenant_id, employee_id, leave_type_id, year, total_allocated)
VALUES 
(1,1,1,2025,10),(1,1,2,2025,12),(1,1,3,2025,15),
(1,2,1,2025,10),(1,2,2,2025,12),(1,2,3,2025,15),
(1,3,1,2025,10),(1,3,2,2025,12),(1,3,3,2025,15);

INSERT INTO attendance (
    tenant_id, employee_id, date,
    check_in_time, check_out_time,
    status, work_hours
) VALUES (
    1, 2, CURRENT_DATE,
    CURRENT_TIMESTAMP - INTERVAL '8 hours',
    CURRENT_TIMESTAMP,
    'Present',
    8
);

INSERT INTO leave_requests (
    tenant_id, employee_id, leave_type_id,
    start_date, end_date, total_days, reason
) VALUES (
    1, 2, 1,
    CURRENT_DATE + 1,
    CURRENT_DATE + 2,
    2,
    'Medical leave'
);

INSERT INTO work_logs (
    tenant_id, employee_id, date,
    task_name, hours
) VALUES (
    1, 2, CURRENT_DATE,
    'API Development',
    6
);

INSERT INTO skills (
    tenant_id, name
) VALUES (
    1, 'PostgreSQL'
);

INSERT INTO skill_tests (
    tenant_id, title, skill_id, passing_score
) VALUES (
    1, 'PostgreSQL Basics', 1, 60
);


INSERT INTO employee_skill_tests (
    tenant_id, employee_id, skill_test_id,
    score, max_score, status
) VALUES (
    1, 2, 1,
    75, 100, 'Passed'
);
=
INSERT INTO complaints (
    tenant_id, complaint_number, employee_id,
    category, subject, description
) VALUES (
    1, 'CMP-ACME-001', 2,
    'Workplace',
    'AC not working',
    'Air conditioning issue in office'
);

INSERT INTO tech_issues (
    tenant_id, issue_number, employee_id,
    category, title, description
) VALUES (
    1, 'TECH-ACME-001', 2,
    'Hardware',
    'Laptop overheating',
    'Laptop shuts down frequently'
);

INSERT INTO payslips (
    tenant_id, employee_id,
    month, year,
    basic_salary, gross_salary, net_salary
) VALUES (
    1, 2,
    1, 2025,
    90000, 95000, 88000
);

INSERT INTO notifications (
    tenant_id, employee_id,
    title, message, type
) VALUES (
    1, 2,
    'Leave Submitted',
    'Your leave request has been submitted',
    'info'
);

INSERT INTO audit_logs (
    tenant_id, user_id, employee_id,
    action, entity_type
) VALUES (
    1, 2, 2,
    'CREATE', 'leave_request'
);


-- Success message
SELECT 'Database initialized successfully!' as status;
