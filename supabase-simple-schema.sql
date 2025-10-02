-- Simple EFB Dashboard Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Create the main dashboard metrics table
CREATE TABLE IF NOT EXISTS dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    
    -- Ensure unique combination of section, category, field
    UNIQUE(section, category, field)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_section ON dashboard_metrics(section);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_category ON dashboard_metrics(category);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_field ON dashboard_metrics(field);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_updated_at ON dashboard_metrics(updated_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_dashboard_metrics_updated_at ON dashboard_metrics;
CREATE TRIGGER update_dashboard_metrics_updated_at 
    BEFORE UPDATE ON dashboard_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create CSV upload tracking table
CREATE TABLE IF NOT EXISTS csv_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create data changes audit table
CREATE TABLE IF NOT EXISTS data_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type TEXT NOT NULL CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
    changed_by TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit table
CREATE INDEX IF NOT EXISTS idx_data_changes_record_id ON data_changes(record_id);
CREATE INDEX IF NOT EXISTS idx_data_changes_timestamp ON data_changes(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_changes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust these based on your security needs)
-- For now, allowing all operations for testing

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on dashboard_metrics" ON dashboard_metrics;
DROP POLICY IF EXISTS "Allow all operations on csv_uploads" ON csv_uploads;
DROP POLICY IF EXISTS "Allow all operations on data_changes" ON data_changes;

-- Create new policies
CREATE POLICY "Allow all operations on dashboard_metrics" ON dashboard_metrics
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on csv_uploads" ON csv_uploads
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on data_changes" ON data_changes
    FOR ALL USING (true);

-- Insert some sample data to test the setup
INSERT INTO dashboard_metrics (section, category, field, value, description) VALUES
('Executive Summary', 'Core Metrics', 'Meals Delivered', '367490721', 'Total annual food assistance across all programs'),
('Executive Summary', 'Core Metrics', 'People Served', '4960000', '4.96 million unique individuals reached nationwide'),
('Executive Summary', 'Core Metrics', 'Cost Per Meal', '6.36', 'Industry-leading cost efficiency through supply chain innovation'),
('Executive Summary', 'Core Metrics', 'Program Efficiency', '83', 'Exceptional operational efficiency ensuring maximum resources reach beneficiaries')
ON CONFLICT (section, category, field) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Verify the setup
SELECT 'Setup completed successfully!' as status;
SELECT COUNT(*) as total_metrics FROM dashboard_metrics;
SELECT section, category, field, value FROM dashboard_metrics LIMIT 5;
