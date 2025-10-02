-- FINAL WORKING SCHEMA - SINGLE SOURCE OF TRUTH
-- This will fix all data flow issues between Supabase, admin panel, and dashboard

-- Drop existing tables
DROP TABLE IF EXISTS dashboard_metrics CASCADE;
DROP TABLE IF EXISTS dashboard_sections CASCADE;
DROP TABLE IF EXISTS csv_uploads CASCADE;
DROP TABLE IF EXISTS data_changes CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dashboard Metrics - Simple and working
CREATE TABLE dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section TEXT NOT NULL,
    category TEXT NOT NULL,
    field TEXT NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    methodology TEXT,
    data_source TEXT,
    interpretation TEXT,
    significance TEXT,
    benchmarks JSONB,
    recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(section, category, field)
);

-- CSV Upload tracking
CREATE TABLE csv_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    total_rows INTEGER,
    processed_rows INTEGER,
    status TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data change audit
CREATE TABLE data_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dashboard_metrics_section ON dashboard_metrics(section);
CREATE INDEX idx_dashboard_metrics_category ON dashboard_metrics(category);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dashboard_metrics_updated_at 
    BEFORE UPDATE ON dashboard_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert the essential executive metrics that MUST work
INSERT INTO dashboard_metrics (section, category, field, value, description, methodology, data_source, interpretation, significance) VALUES
('Executive Summary', 'Core Metrics', 'People Served', '4960000', 'Unique individuals reached nationwide', 'National ID verification system', 'National Beneficiary Database', '4.96M represents 4.8% of Egypt total population', 'Largest humanitarian reach in Egypt history'),
('Executive Summary', 'Core Metrics', 'Meals Delivered', '500000000', 'Total annual food assistance', 'WHO nutritional standards calculation', 'Distribution Management System', '500M meals represents 100 meals per beneficiary annually', 'Largest food distribution operation in MENA region'),
('Executive Summary', 'Core Metrics', 'Cost Per Meal', '11', 'All-inclusive program cost', 'Activity-based costing system', 'ERP Financial System', 'EGP 11 represents world-class efficiency', 'Exceptional cost efficiency maximizes donor impact'),
('Executive Summary', 'Core Metrics', 'Program Efficiency', '83', 'Overall program effectiveness', 'Composite efficiency scoring', 'Internal Analytics', '83% efficiency rating', 'High efficiency enables sustainable scale'),
('Executive Summary', 'Financial', 'Total Revenue', '2200000000', 'Annual revenue', 'Financial reporting', 'Financial System', 'EGP 2.2B annual revenue', 'Strong revenue base'),
('Executive Summary', 'Financial', 'Total Expenses', '2316000000', 'Annual expenses', 'Financial reporting', 'Financial System', 'EGP 2.316B annual expenses', 'Strategic deficit for crisis response'),
('Executive Summary', 'Financial', 'Reserves', '731200000', 'Financial reserves', 'Financial reporting', 'Financial System', 'EGP 731M reserves', 'Strong financial position'),
('Executive Summary', 'Financial', 'Cash Position', '459800000', 'Current cash position', 'Financial reporting', 'Financial System', 'EGP 459M cash', 'Healthy cash flow');

-- Enable RLS (Row Level Security) for Supabase
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_changes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Enable read access for all users" ON dashboard_metrics FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON dashboard_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON dashboard_metrics FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON dashboard_metrics FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON csv_uploads FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON csv_uploads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON csv_uploads FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON data_changes FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON data_changes FOR INSERT WITH CHECK (true);
