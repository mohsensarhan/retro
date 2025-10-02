-- EFB Dashboard Dynamic Schema
-- Supports CSV import, real-time updates, and schema evolution

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main dashboard metrics table - flexible structure matching CSV
CREATE TABLE dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section TEXT NOT NULL, -- Executive Summary, Financial Analytics, etc.
    category TEXT NOT NULL, -- Core Metrics, Revenue, Distribution, etc.
    field TEXT NOT NULL, -- Meals Delivered, Cost Per Meal, etc.
    value TEXT NOT NULL, -- Stored as text to handle numbers, percentages, text
    description TEXT,
    methodology TEXT,
    data_source TEXT,
    interpretation TEXT,
    significance TEXT,
    benchmarks JSONB, -- Array of benchmark strings
    recommendations JSONB, -- Array of recommendation strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination of section, category, field
    UNIQUE(section, category, field)
);

-- Dashboard schema configuration - tracks layout and field mappings
CREATE TABLE dashboard_schema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_name TEXT NOT NULL UNIQUE,
    field_mappings JSONB NOT NULL, -- Maps CSV fields to dashboard components
    layout_config JSONB, -- UI layout configuration
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Change tracking for audit trail and smart updates
CREATE TABLE data_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type TEXT NOT NULL CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
    changed_by TEXT, -- User or system identifier
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CSV upload tracking
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

-- Create indexes for performance
CREATE INDEX idx_dashboard_metrics_section ON dashboard_metrics(section);
CREATE INDEX idx_dashboard_metrics_category ON dashboard_metrics(category);
CREATE INDEX idx_dashboard_metrics_field ON dashboard_metrics(field);
CREATE INDEX idx_dashboard_metrics_updated_at ON dashboard_metrics(updated_at);
CREATE INDEX idx_data_changes_record_id ON data_changes(record_id);
CREATE INDEX idx_data_changes_timestamp ON data_changes(timestamp);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_dashboard_metrics_updated_at 
    BEFORE UPDATE ON dashboard_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_schema_updated_at 
    BEFORE UPDATE ON dashboard_schema 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log data changes
CREATE OR REPLACE FUNCTION log_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO data_changes (table_name, record_id, field_name, new_value, change_type)
        VALUES (TG_TABLE_NAME, NEW.id, 'ALL', row_to_json(NEW)::text, 'INSERT');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Log changes for each modified field
        IF OLD.value IS DISTINCT FROM NEW.value THEN
            INSERT INTO data_changes (table_name, record_id, field_name, old_value, new_value, change_type)
            VALUES (TG_TABLE_NAME, NEW.id, 'value', OLD.value, NEW.value, 'UPDATE');
        END IF;
        IF OLD.description IS DISTINCT FROM NEW.description THEN
            INSERT INTO data_changes (table_name, record_id, field_name, old_value, new_value, change_type)
            VALUES (TG_TABLE_NAME, NEW.id, 'description', OLD.description, NEW.description, 'UPDATE');
        END IF;
        -- Add more fields as needed
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO data_changes (table_name, record_id, field_name, old_value, change_type)
        VALUES (TG_TABLE_NAME, OLD.id, 'ALL', row_to_json(OLD)::text, 'DELETE');
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for change logging
CREATE TRIGGER log_dashboard_metrics_changes
    AFTER INSERT OR UPDATE OR DELETE ON dashboard_metrics
    FOR EACH ROW EXECUTE FUNCTION log_data_changes();

-- Function for smart upsert (insert or update only changed fields)
CREATE OR REPLACE FUNCTION smart_upsert_metric(
    p_section TEXT,
    p_category TEXT,
    p_field TEXT,
    p_value TEXT,
    p_description TEXT DEFAULT NULL,
    p_methodology TEXT DEFAULT NULL,
    p_data_source TEXT DEFAULT NULL,
    p_interpretation TEXT DEFAULT NULL,
    p_significance TEXT DEFAULT NULL,
    p_benchmarks JSONB DEFAULT NULL,
    p_recommendations JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    existing_record dashboard_metrics%ROWTYPE;
    record_id UUID;
    has_changes BOOLEAN := FALSE;
BEGIN
    -- Check if record exists
    SELECT * INTO existing_record 
    FROM dashboard_metrics 
    WHERE section = p_section AND category = p_category AND field = p_field;
    
    IF existing_record.id IS NULL THEN
        -- Insert new record
        INSERT INTO dashboard_metrics (
            section, category, field, value, description, methodology, 
            data_source, interpretation, significance, benchmarks, recommendations
        ) VALUES (
            p_section, p_category, p_field, p_value, p_description, p_methodology,
            p_data_source, p_interpretation, p_significance, p_benchmarks, p_recommendations
        ) RETURNING id INTO record_id;
        
        RETURN record_id;
    ELSE
        -- Check for changes and update only if different
        record_id := existing_record.id;
        
        IF existing_record.value IS DISTINCT FROM p_value OR
           existing_record.description IS DISTINCT FROM p_description OR
           existing_record.methodology IS DISTINCT FROM p_methodology OR
           existing_record.data_source IS DISTINCT FROM p_data_source OR
           existing_record.interpretation IS DISTINCT FROM p_interpretation OR
           existing_record.significance IS DISTINCT FROM p_significance OR
           existing_record.benchmarks IS DISTINCT FROM p_benchmarks OR
           existing_record.recommendations IS DISTINCT FROM p_recommendations THEN
            
            UPDATE dashboard_metrics SET
                value = p_value,
                description = COALESCE(p_description, description),
                methodology = COALESCE(p_methodology, methodology),
                data_source = COALESCE(p_data_source, data_source),
                interpretation = COALESCE(p_interpretation, interpretation),
                significance = COALESCE(p_significance, significance),
                benchmarks = COALESCE(p_benchmarks, benchmarks),
                recommendations = COALESCE(p_recommendations, recommendations)
            WHERE id = record_id;
        END IF;
        
        RETURN record_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Initialize default dashboard schema configuration
INSERT INTO dashboard_schema (section_name, field_mappings, layout_config, display_order) VALUES
('Executive Summary', '{"core_metrics": ["Meals Delivered", "People Served", "Cost Per Meal", "Program Efficiency"], "financial": ["Total Revenue", "Total Expenses", "Reserves", "Cash Position"]}', '{"type": "grid", "columns": 4}', 1),
('Financial Analytics', '{"revenue": ["Online Individual Donations", "Corporate Community", "Foundations Grants", "In-Kind Food", "Wafra Farm"], "expenses": ["Program Costs", "Fundraising", "Admin General"], "ratios": ["Operating Margin", "Admin Ratio", "Fundraising ROI"]}', '{"type": "sections", "layout": "vertical"}', 2),
('Operational Analytics', '{"distribution": ["Distribution Efficiency Rate", "Average Cost Per Beneficiary", "Geographic Coverage", "Partner Network", "Distribution Centers"]}', '{"type": "metrics_grid", "columns": 3}', 3),
('Stakeholder Analytics', '{"public_awareness": ["Overall Awareness", "Net Promoter Score", "Brand Ranking"], "volunteers": ["Total Volunteers", "Volunteer Hours", "Volunteer Satisfaction", "Volunteer Retention"], "digital_engagement": ["Facebook Growth", "Instagram Growth", "Hashtag Reach", "WhatsApp Users", "Online Donation Growth"], "media": ["Press Releases", "Press Conferences", "Major Coverage", "Media Sentiment"]}', '{"type": "category_sections"}', 4),
('Programs Analytics', '{"protection": ["Food Security", "Malnutrition Prevention", "Emergency Response"], "prevention": ["Education", "Skills Training", "Community Development"], "empowerment": ["Women Empowerment", "Youth Development", "Circular Economy"]}', '{"type": "program_grid"}', 5),
('Scenario Analysis', '{"economic_factors": ["Economic Growth", "Inflation Rate"], "donor_factors": ["Donor Sentiment", "Corporate CSR"], "operational_factors": ["Operational Efficiency", "Food Prices"], "social_factors": ["Unemployment Rate", "Government Support"]}', '{"type": "scenario_sliders"}', 6);

-- Enable Row Level Security (RLS)
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_schema ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (you can adjust these based on your needs)
CREATE POLICY "Allow authenticated users to read dashboard_metrics" ON dashboard_metrics
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to modify dashboard_metrics" ON dashboard_metrics
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read dashboard_schema" ON dashboard_schema
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to modify dashboard_schema" ON dashboard_schema
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read data_changes" ON data_changes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read csv_uploads" ON csv_uploads
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert csv_uploads" ON csv_uploads
    FOR INSERT TO authenticated WITH CHECK (true);
