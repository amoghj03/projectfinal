

"id"	"tenant_id"	"branch_id"	"date"	"name"	"description"	"created_by"	"created_at"	"updated_at"
1	1	null	"2026-01-01 00:00:00"	"New Year's Day"	"New Year celebration - All branches"	1	"2026-01-27 11:41:21.016364"	"2026-01-27 12:28:35.474862"
2	1	null	"2026-07-04 00:00:00"	"Independence Day"	"National Independence Day - All branches"	1	"2026-01-27 11:41:21.016364"	"2026-01-27 12:28:35.474862"
3	1	null	"2026-12-25 00:00:00"	"Christmas Day"	"Christmas celebration - All branches"	1	"2026-01-27 11:41:21.016364"	"2026-01-27 12:28:35.474862"
4	1	null	"2026-11-28 00:00:00"	"Thanksgiving"	"Thanksgiving Day - All branches"	1	"2026-01-27 11:41:21.016364"	"2026-01-27 12:28:35.474862"
5	1	null	"2026-09-07 00:00:00"	"Labor Day"	"Labor Day holiday - All branches"	1	"2026-01-27 11:41:21.016364"	"2026-01-27 12:28:35.474862"

-- Create Holidays table for storing company holidays
-- This script creates the holidays table and related constraints/indexes

-- Drop table if exists (for development/testing purposes)
-- DROP TABLE IF EXISTS holidays;

-- Create the holidays table
CREATE TABLE holidays (
    id SERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    branch_id BIGINT NULL,
    date TIMESTAMP NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
-- Note: Adjust table names if your schema uses different naming conventions
ALTER TABLE holidays 
ADD CONSTRAINT fk_holidays_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE holidays 
ADD CONSTRAINT fk_holidays_branch 
FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;

ALTER TABLE holidays 
ADD CONSTRAINT fk_holidays_created_by 
FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX idx_holidays_tenant_id ON holidays(tenant_id);
CREATE INDEX idx_holidays_branch_id ON holidays(branch_id);
CREATE INDEX idx_holidays_date ON holidays(date);
CREATE INDEX idx_holidays_tenant_date ON holidays(tenant_id, date);

-- Create unique constraint to prevent duplicate holidays for same date/branch/tenant
-- This allows:
-- 1. One holiday per date for all branches (branch_id = NULL)
-- 2. One holiday per date per specific branch
-- But prevents duplicates
ALTER TABLE holidays 
ADD CONSTRAINT uk_holidays_tenant_branch_date 
UNIQUE (tenant_id, branch_id, date);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_holidays_updated_at 
    BEFORE UPDATE ON holidays 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample holidays (adjust tenant_id as needed)
-- Replace tenant_id = 1 with appropriate tenant ID from your system
INSERT INTO holidays (tenant_id, branch_id, date, name, description) VALUES 
    (1, NULL, '2026-01-01', 'New Year''s Day', 'New Year celebration - All branches'),
    (1, NULL, '2026-07-04', 'Independence Day', 'National Independence Day - All branches'),
    (1, NULL, '2026-12-25', 'Christmas Day', 'Christmas celebration - All branches'),
    (1, NULL, '2026-11-28', 'Thanksgiving', 'Thanksgiving Day - All branches'),
    (1, NULL, '2026-09-07', 'Labor Day', 'Labor Day holiday - All branches');