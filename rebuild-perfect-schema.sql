-- PERFECT EFB DASHBOARD SCHEMA
-- This schema exactly mirrors the dashboard structure and sequence

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS dashboard_metrics CASCADE;
DROP TABLE IF EXISTS dashboard_sections CASCADE;
DROP TABLE IF EXISTS csv_uploads CASCADE;
DROP TABLE IF EXISTS data_changes CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Dashboard Sections - defines the exact structure and order
CREATE TABLE dashboard_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT NOT NULL UNIQUE, -- 'executive', 'financial', etc.
    section_name TEXT NOT NULL, -- 'Executive Summary', 'Financial Analytics'
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Dashboard Metrics - the single source of truth
CREATE TABLE dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Structure fields
    section_key TEXT NOT NULL, -- Links to dashboard_sections
    category TEXT NOT NULL, -- 'Core Metrics', 'Revenue', etc.
    metric_key TEXT NOT NULL, -- Unique identifier for programmatic access
    metric_name TEXT NOT NULL, -- Display name
    display_order INTEGER NOT NULL, -- Order within category
    
    -- Value fields
    current_value TEXT NOT NULL, -- Current value as string (handles all types)
    previous_value TEXT, -- For change calculations
    target_value TEXT, -- Target/goal value
    
    -- Metadata fields
    description TEXT,
    methodology TEXT,
    data_source TEXT,
    interpretation TEXT,
    significance TEXT,
    
    -- Additional data
    unit TEXT, -- 'people', 'meals', 'EGP', '%', etc.
    format_type TEXT DEFAULT 'number', -- 'number', 'currency', 'percentage', 'text'
    change_value TEXT, -- '+43% CAGR', '+40% YoY', etc.
    change_direction TEXT, -- 'up', 'down', 'stable'
    color_theme TEXT DEFAULT 'neutral', -- 'success', 'warning', 'danger', 'neutral'
    icon_name TEXT, -- 'Users', 'Target', 'DollarSign', etc.
    
    -- Rich data
    benchmarks JSONB, -- Array of benchmark objects
    recommendations JSONB, -- Array of recommendations
    factors JSONB, -- Array of impact factors
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(section_key, category, metric_key)
);

-- 3. CSV Upload tracking
CREATE TABLE csv_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    file_size INTEGER,
    total_rows INTEGER,
    processed_rows INTEGER,
    failed_rows INTEGER,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    error_details JSONB,
    uploaded_by TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Data change audit log
CREATE TABLE data_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type TEXT NOT NULL CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
    changed_by TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_dashboard_metrics_section ON dashboard_metrics(section_key);
CREATE INDEX idx_dashboard_metrics_category ON dashboard_metrics(category);
CREATE INDEX idx_dashboard_metrics_order ON dashboard_metrics(section_key, display_order);
CREATE INDEX idx_dashboard_sections_order ON dashboard_sections(display_order);
CREATE INDEX idx_data_changes_timestamp ON data_changes(timestamp);

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating timestamps
CREATE TRIGGER update_dashboard_metrics_updated_at 
    BEFORE UPDATE ON dashboard_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION log_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO data_changes (table_name, record_id, field_name, new_value, change_type)
        VALUES (TG_TABLE_NAME, NEW.id, 'ALL', row_to_json(NEW)::text, 'INSERT');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Log specific field changes
        IF OLD.current_value IS DISTINCT FROM NEW.current_value THEN
            INSERT INTO data_changes (table_name, record_id, field_name, old_value, new_value, change_type)
            VALUES (TG_TABLE_NAME, NEW.id, 'current_value', OLD.current_value, NEW.current_value, 'UPDATE');
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO data_changes (table_name, record_id, field_name, old_value, change_type)
        VALUES (TG_TABLE_NAME, OLD.id, 'ALL', row_to_json(OLD)::text, 'DELETE');
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create audit trigger
CREATE TRIGGER log_dashboard_metrics_changes
    AFTER INSERT OR UPDATE OR DELETE ON dashboard_metrics
    FOR EACH ROW EXECUTE FUNCTION log_data_changes();

-- Insert dashboard sections in exact order
INSERT INTO dashboard_sections (section_key, section_name, display_order) VALUES
('executive', 'Executive Summary', 1),
('financial', 'Financial Analytics', 2),
('operational', 'Operational Analytics', 3),
('programs', 'Programs Analytics', 4),
('stakeholders', 'Stakeholder Analytics', 5),
('scenarios', 'Scenario Analysis', 6);

-- Insert EXACT dashboard metrics in the EXACT order they appear
INSERT INTO dashboard_metrics (
    section_key, category, metric_key, metric_name, display_order,
    current_value, unit, format_type, change_value, change_direction, color_theme, icon_name,
    description, methodology, data_source, interpretation, significance,
    benchmarks, recommendations
) VALUES

-- EXECUTIVE SUMMARY - Core Metrics (exactly as shown in dashboard)
('executive', 'Core Metrics', 'lives_impacted', 'Lives Impacted', 1,
 '4960000', 'people', 'number', '+43% CAGR', 'up', 'success', 'Users',
 'Unique individuals reached nationwide', 
 'Unique beneficiary identification using national ID verification system',
 'National Beneficiary Database + Ministry of Social Solidarity Integration',
 '4.96M represents 4.8% of Egypt''s total population',
 'Largest humanitarian reach in Egypt''s history',
 '["UN WFP Egypt: 2.1M beneficiaries", "Government Takaful Program: 3.2M households"]',
 '["Target 6M beneficiaries by 2025", "Develop digital identity system"]'),

('executive', 'Core Metrics', 'meals_delivered', 'Meals Delivered', 2,
 '367490721', 'meals', 'number', '+40% YoY', 'up', 'neutral', 'Target',
 'Total annual food assistance',
 'Comprehensive meal equivalent calculation using WHO nutritional standards',
 'Distribution Management System + Partner Network Reports',
 '367.5M meals represents 72 meals per beneficiary annually',
 'Largest food distribution operation in MENA region',
 '["Food Banks Canada: 180M meals", "Feeding America: 6.6B meals"]',
 '["Scale to 500M meals by 2026", "Increase fresh produce distribution"]'),

('executive', 'Core Metrics', 'cost_per_meal', 'Cost Per Meal', 3,
 '6.36', 'EGP', 'currency', '83% ratio', 'stable', 'warning', 'DollarSign',
 'All-inclusive program cost',
 'Total program costs divided by verified meal equivalents',
 'Financial Management System + Supply Chain Analytics',
 'EGP 6.36 represents 40% cost reduction versus international standards',
 'Industry-leading cost efficiency',
 '["USAID humanitarian meals: $3.12", "UN WFP regional average: $2.85"]',
 '["Target EGP 5.50 per meal", "Invest in automated packaging"]'),

('executive', 'Core Metrics', 'coverage', 'Coverage', 4,
 '27', 'governorates', 'number', '100% coverage', 'up', 'danger', 'Globe',
 'Governorates reached',
 'Geographic coverage tracking and verification',
 'Distribution Management System + Geographic Analysis',
 '27 governorates represents 100% national coverage',
 'Complete geographic reach across Egypt',
 '["Target: 27 governorates", "International standard: 80% coverage"]',
 '["Maintain 100% coverage", "Improve rural area access"]'),

-- EXECUTIVE SUMMARY - Financial Overview
('executive', 'Financial Overview', 'total_revenue', 'Total Revenue', 1,
 '2199845190', 'EGP', 'currency', '+15% YoY', 'up', 'success', 'TrendingUp',
 'Total annual revenue from all sources',
 'Comprehensive revenue tracking across all channels',
 'Financial Management System + Donor Database',
 '2.2B EGP represents 15% growth year-over-year',
 'Largest humanitarian fundraising operation in Egypt',
 '["Previous year: 1.9B EGP", "Regional NGO average: 12% growth"]',
 '["Diversify revenue streams", "Expand corporate partnerships"]'),

('executive', 'Financial Overview', 'total_expenses', 'Total Expenses', 2,
 '2316248118', 'EGP', 'currency', '+18% YoY', 'up', 'warning', 'TrendingDown',
 'Total annual operational expenses',
 'Comprehensive expense tracking across all programs',
 'Financial Management System + Program Cost Allocation',
 '2.3B EGP represents 18% growth in program delivery',
 'Reflecting increased beneficiary reach and program expansion',
 '["Previous year: 1.96B EGP", "Program cost inflation: 15%"]',
 '["Optimize supply chain costs", "Implement digital tools"]'),

('executive', 'Financial Overview', 'reserves', 'Reserves', 3,
 '731200000', 'EGP', 'currency', '3.2 months', 'stable', 'success', 'Shield',
 'Financial reserves for operational continuity',
 'Reserve calculation based on 3-month operational costs',
 'Financial Management System + Reserve Policy',
 '731M EGP represents 3.2 months of operational coverage',
 'Ensuring program continuity during funding gaps',
 '["International standard: 3-6 months", "Target reserve: 900M EGP"]',
 '["Build reserves to 6-month coverage", "Create endowment"]'),

('executive', 'Financial Overview', 'cash_position', 'Cash Position', 4,
 '459800000', 'EGP', 'currency', '2-month runway', 'stable', 'warning', 'Wallet',
 'Current liquid assets available for operations',
 'Current assets minus current liabilities',
 'Financial Management System + Cash Flow Analysis',
 '460M EGP provides 2-month operational runway',
 'Ensuring smooth program delivery and vendor payments',
 '["Previous year: 380M EGP", "Target: 600M EGP"]',
 '["Improve cash flow management", "Develop working capital facility"]');

-- Enable Row Level Security
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_changes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust for production)
CREATE POLICY "Allow all operations on dashboard_metrics" ON dashboard_metrics FOR ALL USING (true);
CREATE POLICY "Allow all operations on dashboard_sections" ON dashboard_sections FOR ALL USING (true);
CREATE POLICY "Allow all operations on csv_uploads" ON csv_uploads FOR ALL USING (true);
CREATE POLICY "Allow all operations on data_changes" ON data_changes FOR ALL USING (true);

-- Verification queries
SELECT 'Schema created successfully!' as status;
SELECT section_name, COUNT(*) as metric_count FROM dashboard_sections ds
LEFT JOIN dashboard_metrics dm ON ds.section_key = dm.section_key
GROUP BY ds.section_name, ds.display_order
ORDER BY ds.display_order;

