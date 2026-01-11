-- SQL Script to Add Employee Role Permissions
-- This script assigns basic employee permissions to all roles
-- Admin (role_id = 1), SuperAdmin (role_id = 2), and Employee (role_id = 3)

-- Insert role permissions for Admin role (role_id = 1)
-- Admin already has permissions 7-16, now adding employee permissions 1-6
INSERT INTO role_permissions (role_id, permission_id, created_at)
VALUES
    (1, 1, NOW()),  -- dashboard.view
    (1, 2, NOW()),  -- employee.view
    (1, 3, NOW()),  -- leave.request
    (1, 4, NOW()),  -- skill.manage
    (1, 5, NOW()),  -- complaint.create
    (1, 6, NOW());  -- techissue.create

-- Insert role permissions for SuperAdmin role (role_id = 2)
-- SuperAdmin already has permissions 7-16, now adding employee permissions 1-6
INSERT INTO role_permissions (role_id, permission_id, created_at)
VALUES
    (2, 1, NOW()),  -- dashboard.view
    (2, 2, NOW()),  -- employee.view
    (2, 3, NOW()),  -- leave.request
    (2, 4, NOW()),  -- skill.manage
    (2, 5, NOW()),  -- complaint.create
    (2, 6, NOW());  -- techissue.create

-- Insert role permissions for Employee role (role_id = 3)
INSERT INTO role_permissions (role_id, permission_id, created_at)
VALUES
    (3, 1, NOW()),  -- dashboard.view
    (3, 2, NOW()),  -- employee.view
    (3, 3, NOW()),  -- leave.request
    (3, 4, NOW()),  -- skill.manage
    (3, 5, NOW()),  -- complaint.create
    (3, 6, NOW());  -- techissue.create

-- Verify the insertions for all roles
SELECT 
    r.name AS role_name,
    p.name AS permission_name,
    p.display_name,
    p.category,
    rp.created_at
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name IN ('Admin', 'SuperAdmin', 'Employee')
ORDER BY r.name, p.id;

-- Count permissions per role
SELECT 
    r.name AS role_name,
    COUNT(*) AS total_permissions
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
WHERE r.name IN ('Admin', 'SuperAdmin', 'Employee')
GROUP BY r.name
ORDER BY r.name;

-- Success message
SELECT 'All role permissions assigned successfully!' as status;
