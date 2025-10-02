-- COMPLETE EFB DASHBOARD SCHEMA
-- Generated automatically from dashboard component analysis
-- This schema contains EVERY field displayed across ALL dashboard sections

-- Drop existing tables
DROP TABLE IF EXISTS dashboard_metrics CASCADE;
DROP TABLE IF EXISTS dashboard_sections CASCADE;
DROP TABLE IF EXISTS csv_uploads CASCADE;
DROP TABLE IF EXISTS data_changes CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dashboard Sections
CREATE TABLE dashboard_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT NOT NULL UNIQUE,
    section_name TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard Metrics - Complete schema
CREATE TABLE dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Structure fields
    section_key TEXT NOT NULL,
    category TEXT NOT NULL,
    metric_key TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    
    -- Value fields
    current_value TEXT NOT NULL,
    previous_value TEXT,
    target_value TEXT,
    
    -- Display fields
    unit TEXT,
    format_type TEXT DEFAULT 'number',
    change_value TEXT,
    change_direction TEXT,
    color_theme TEXT DEFAULT 'neutral',
    icon_name TEXT,
    
    -- Documentation fields
    description TEXT,
    methodology TEXT,
    data_source TEXT,
    interpretation TEXT,
    significance TEXT,
    
    -- Rich data
    benchmarks JSONB,
    recommendations JSONB,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(section_key, metric_key)
);

-- CSV Upload tracking
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

-- Data change audit log
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

-- Indexes
CREATE INDEX idx_dashboard_metrics_section ON dashboard_metrics(section_key);
CREATE INDEX idx_dashboard_metrics_category ON dashboard_metrics(category);
CREATE INDEX idx_dashboard_metrics_order ON dashboard_metrics(section_key, display_order);
CREATE INDEX idx_dashboard_sections_order ON dashboard_sections(display_order);
CREATE INDEX idx_data_changes_timestamp ON data_changes(timestamp);

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Trigger for auto-updating timestamps
CREATE TRIGGER update_dashboard_metrics_updated_at 
    BEFORE UPDATE ON dashboard_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION log_data_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO data_changes(table_name, record_id, field_name, new_value, change_type, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id::uuid, '_record', NULL, 'INSERT', current_user::text);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO data_changes(table_name, record_id, field_name, old_value, new_value, change_type, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id::uuid, '_record', NULL, NULL, 'UPDATE', current_user::text);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO data_changes(table_name, record_id, field_name, new_value, change_type, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id::uuid, '_record', NULL, 'DELETE', current_user::text);
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

-- Audit trigger
CREATE TRIGGER dashboard_metrics_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON dashboard_metrics
    FOR EACH ROW EXECUTE FUNCTION log_data_changes();

-- Insert sections
INSERT INTO dashboard_sections (section_key, section_name, display_order, is_active) 
   VALUES ('executive', 'Executive Summary', 1, true);
INSERT INTO dashboard_sections (section_key, section_name, display_order, is_active) 
   VALUES ('financial', 'Financial Analytics', 2, true);
INSERT INTO dashboard_sections (section_key, section_name, display_order, is_active) 
   VALUES ('operational', 'Operational Analytics', 3, true);
INSERT INTO dashboard_sections (section_key, section_name, display_order, is_active) 
   VALUES ('programs', 'Programs Analytics', 4, true);
INSERT INTO dashboard_sections (section_key, section_name, display_order, is_active) 
   VALUES ('stakeholders', 'Stakeholder Analytics', 5, true);
INSERT INTO dashboard_sections (section_key, section_name, display_order, is_active) 
   VALUES ('scenarios', 'Scenario Analysis', 6, true);
INSERT INTO dashboard_sections (section_key, section_name, display_order, is_active) 
   VALUES ('global_signals', 'Global Signals', 7, true);

-- Insert all metrics
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'executive',
      'Core Metrics',
      'people_served',
      'Lives Impacted',
      1,
      '4960000',
      NULL,
      NULL,
      'people',
      'number',
      '+43% CAGR',
      'up',
      'success',
      'Users',
      'Unique individuals reached nationwide',
      'Unique beneficiary identification using national ID verification system, preventing double-counting across multiple programs and time periods.',
      'National Beneficiary Database + Ministry of Social Solidarity Integration',
      '4.96M represents 4.8% of Egypt''s total population, focusing on most vulnerable households identified through poverty mapping',
      'Largest humanitarian reach in Egypt''s history, exceeding government social protection programs in coverage and efficiency'
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'executive',
      'Core Metrics',
      'meals_delivered',
      'Meals Delivered',
      2,
      '367490721',
      NULL,
      NULL,
      'meals',
      'number',
      '+40% YoY',
      'up',
      'neutral',
      'Target',
      'Total annual food assistance',
      'Comprehensive meal equivalent calculation using WHO nutritional standards, verified through biometric distribution tracking and partner reporting.',
      'Distribution Management System + Partner Network Reports + Field Verification',
      '367.5M meals represents 72 meals per beneficiary annually, equivalent to providing complete nutrition for 1 million people daily',
      'Largest food distribution operation in MENA region, preventing acute malnutrition crisis during economic downturn'
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'executive',
      'Core Metrics',
      'cost_per_meal',
      'Cost Per Meal',
      3,
      '6.36',
      NULL,
      NULL,
      'EGP',
      'currency',
      '83% ratio',
      'stable',
      'warning',
      'DollarSign',
      'All-inclusive program cost',
      'Activity-based costing system allocating all organizational expenses across meals delivered, including overhead, quality assurance, and impact measurement.',
      'ERP Financial System + Time-Driven Activity Based Costing Model',
      'EGP 6.36 (~$0.21 USD) per meal represents world-class efficiency, 70% below global humanitarian sector average',
      'Exceptional cost efficiency maximizes donor impact and enables sustainable scale expansion during economic challenges'
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'executive',
      'Core Metrics',
      'coverage',
      'Coverage',
      4,
      '27',
      NULL,
      NULL,
      '/27',
      'simple',
      '100% coverage',
      'up',
      'danger',
      'Globe',
      'Governorates reached',
      'Geographic Information Systems mapping of service delivery points combined with population density analysis and accessibility metrics.',
      'Partner Network Database + Government Administrative Records + Field Operations',
      '100% governorate coverage with 87% average population accessibility represents unmatched humanitarian reach',
      'Universal coverage ensures equitable access regardless of geographic location, critical for national food security'
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'financial',
      'Revenue',
      'total_revenue',
      'Total Revenue',
      1,
      '2199845190',
      NULL,
      NULL,
      'EGP',
      'currency',
      '+3.4% YoY',
      'up',
      'success',
      'TrendingUp',
      'Total annual revenue across all sources',
      NULL,
      'ERP Financial System',
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'financial',
      'Revenue',
      'online_individual_donations',
      'Online Individual Donations',
      2,
      '749110274',
      NULL,
      NULL,
      'EGP',
      'currency',
      NULL,
      NULL,
      'success',
      NULL,
      'Individual donations through online channels',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'financial',
      'Revenue',
      'corporate_community_donations',
      'Corporate & Community Donations',
      3,
      '329522158',
      NULL,
      NULL,
      'EGP',
      'currency',
      NULL,
      NULL,
      'success',
      NULL,
      'Corporate partnerships and community fundraising',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'financial',
      'Revenue',
      'foundations_grants',
      'Foundations & Grants',
      4,
      '293228838',
      NULL,
      NULL,
      'EGP',
      'currency',
      NULL,
      NULL,
      'success',
      NULL,
      'Institutional grants and foundation funding',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'financial',
      'Revenue',
      'in_kind_food',
      'In-Kind Food Donations',
      5,
      '210942385',
      NULL,
      NULL,
      'EGP',
      'currency',
      NULL,
      NULL,
      'success',
      NULL,
      'Value of donated food items',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'financial',
      'Revenue',
      'wafra_farm',
      'Wafra Farm Revenue',
      6,
      '186915672',
      NULL,
      NULL,
      'EGP',
      'currency',
      NULL,
      NULL,
      'success',
      NULL,
      'Revenue from agricultural operations',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'financial',
      'Expenses',
      'total_expenses',
      'Total Expenses',
      7,
      '2316248118',
      NULL,
      NULL,
      'EGP',
      'currency',
      '+18% YoY',
      'up',
      'warning',
      'DollarSign',
      'Total annual operational expenses',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'financial',
      'Expenses',
      'program_costs',
      'Program Costs',
      8,
      '1937854454',
      NULL,
      NULL,
      'EGP',
      'currency',
      NULL,
      NULL,
      'primary',
      NULL,
      'Direct program implementation costs',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'financial',
      'Expenses',
      'fundraising_costs',
      'Fundraising Costs',
      9,
      '289218262',
      NULL,
      NULL,
      'EGP',
      'currency',
      NULL,
      NULL,
      'warning',
      NULL,
      'Fundraising and donor acquisition costs',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'financial',
      'Expenses',
      'admin_general_costs',
      'Administrative & General Costs',
      10,
      '109448326',
      NULL,
      NULL,
      'EGP',
      'currency',
      NULL,
      NULL,
      'neutral',
      NULL,
      'Administrative and overhead expenses',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'financial',
      'Financial Health',
      'operating_deficit',
      'Operating Deficit',
      11,
      '116402928',
      NULL,
      NULL,
      'EGP',
      'currency',
      NULL,
      NULL,
      'danger',
      NULL,
      'Annual operating deficit (expenses - revenue)',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'financial',
      'Financial Health',
      'program_ratio',
      'Program Efficiency Ratio',
      12,
      '83',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'success',
      NULL,
      'Percentage of expenses going directly to programs',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'financial',
      'Financial Health',
      'fundraising_efficiency',
      'Fundraising Efficiency',
      13,
      '7.6',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'success',
      NULL,
      'Fundraising costs as percentage of total expenses',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'financial',
      'Financial Health',
      'reserves',
      'Reserves',
      14,
      '731200000',
      NULL,
      NULL,
      'EGP',
      'currency',
      NULL,
      NULL,
      'primary',
      'Shield',
      'Total organizational reserves',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'financial',
      'Financial Health',
      'cash_position',
      'Cash Position',
      15,
      '459800000',
      NULL,
      NULL,
      'EGP',
      'currency',
      NULL,
      NULL,
      'primary',
      NULL,
      'Current liquid cash position',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'operational',
      'Logistics',
      'distribution_efficiency_rate',
      'Distribution Efficiency Rate',
      1,
      '94.7',
      NULL,
      NULL,
      '%',
      'percentage',
      '+2.3% vs target',
      'up',
      'success',
      'Truck',
      'Percentage of food boxes successfully delivered to intended beneficiaries',
      'Calculated as (Successfully Delivered Boxes ÷ Total Dispatched Boxes) × 100. Success defined as verified delivery to correct beneficiary within planned timeframe.',
      'EFB Logistics Management System + Partner Organization Reports',
      '94.7% efficiency indicates world-class distribution capability, exceeding UN WFP benchmark of 92%',
      'Critical operational KPI showing EFB''s ability to execute at scale while maintaining quality'
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'operational',
      'Cost Management',
      'average_cost_per_beneficiary',
      'Average Cost Per Beneficiary',
      2,
      '459',
      NULL,
      NULL,
      'EGP',
      'currency',
      '-8.2% cost reduction',
      'down',
      'success',
      'Users',
      'Total annual cost per unique individual served across all programs',
      'Total Program Expenses ÷ Unique Beneficiaries Served. Includes direct food costs, logistics, administrative overhead allocated by time-driven activity-based costing.',
      'ERP Financial System + Beneficiary Database Integration',
      'EGP 459 (~$15 USD) per person annually represents exceptional cost efficiency in humanitarian sector',
      'Demonstrates EFB''s operational excellence and scalability, enabling maximum impact per donor dollar'
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'operational',
      'Logistics',
      'warehouse_utilization',
      'Warehouse Utilization',
      3,
      '87',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'success',
      NULL,
      '20 strategic distribution centers operating at optimal capacity',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'operational',
      'Logistics',
      'delivery_time_accuracy',
      'Delivery Time Accuracy',
      4,
      '91',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'success',
      NULL,
      'On-time delivery within ±2 days of scheduled date',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'operational',
      'Logistics',
      'inventory_turnover',
      'Inventory Turnover',
      5,
      '24',
      NULL,
      NULL,
      'times/year',
      'number',
      NULL,
      NULL,
      'success',
      NULL,
      '15-day average inventory holding period',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'operational',
      'Partnerships',
      'partner_network_reliability',
      'Partner Network Reliability',
      6,
      '96',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'success',
      NULL,
      '5,000 partners maintaining quality standards',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'programs',
      'Health Outcomes',
      'stunting_prevention_impact',
      'Stunting Prevention Impact',
      1,
      '14% → 2%',
      NULL,
      NULL,
      'reduction',
      'text',
      NULL,
      NULL,
      'success',
      'Award',
      'Reduction in child stunting rates in targeted communities',
      'Longitudinal cohort study tracking 12,847 children over 24 months using WHO growth standards. Pre/post intervention comparison with control groups.',
      'Ministry of Health Partnership + EFB Field Monitoring Teams',
      '86% relative reduction in stunting demonstrates exceptional program effectiveness, surpassing global best practices',
      'This outcome represents prevention of 15,647 cases of chronic malnutrition, with lifetime economic value of EGP 2.1B'
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'programs',
      'Education',
      'school_feeding_coverage',
      'School Feeding Coverage',
      2,
      '125000',
      NULL,
      NULL,
      'students',
      'number',
      NULL,
      NULL,
      'success',
      NULL,
      'Students receiving daily nutritious meals in targeted schools',
      'Direct count of enrolled students in 512 participating schools across 15 governorates, verified through biometric attendance systems.',
      'Ministry of Education Partnership + School Attendance Records',
      '125K students represent 3.2% of Egypt''s total primary school population, with 94% attendance improvement in participating schools',
      'Program demonstrates 23% improvement in learning outcomes and 31% reduction in dropout rates'
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'programs',
      'Program Reach',
      'protection_program_beneficiaries',
      'Protection Programs Beneficiaries',
      3,
      '4890000',
      NULL,
      NULL,
      'people',
      'number',
      NULL,
      NULL,
      'success',
      NULL,
      'Emergency food assistance and monthly food boxes',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'programs',
      'Program Reach',
      'prevention_program_beneficiaries',
      'Prevention Programs Beneficiaries',
      4,
      '72000',
      NULL,
      NULL,
      'people',
      'number',
      NULL,
      NULL,
      'warning',
      NULL,
      'Nutrition education and health promotion',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'programs',
      'Program Reach',
      'empowerment_program_beneficiaries',
      'Empowerment Programs Beneficiaries',
      5,
      '6400',
      NULL,
      NULL,
      'people',
      'number',
      NULL,
      NULL,
      'primary',
      NULL,
      'Skills training and income generation',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'programs',
      'Impact Measurements',
      'dietary_diversity_score',
      'Dietary Diversity Score',
      6,
      '6.8',
      '3.2',
      NULL,
      'food groups',
      'number',
      NULL,
      NULL,
      'success',
      NULL,
      'Average number of food groups consumed by beneficiaries',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'programs',
      'Impact Measurements',
      'food_security_score',
      'Food Security Score',
      7,
      '78',
      '42',
      NULL,
      'index points',
      'number',
      NULL,
      NULL,
      'success',
      NULL,
      'Composite food security index for beneficiary households',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'programs',
      'Impact Measurements',
      'child_malnutrition_rate',
      'Child Malnutrition Rate',
      8,
      '8.4',
      '23.1',
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'success',
      NULL,
      'Percentage of children under 5 showing signs of malnutrition',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'programs',
      'Impact Measurements',
      'household_resilience_index',
      'Household Resilience Index',
      9,
      '7.2',
      '2.8',
      NULL,
      'resilience score',
      'number',
      NULL,
      NULL,
      'success',
      NULL,
      'Household ability to cope with economic shocks',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Public Awareness',
      'overall_awareness',
      'Overall Public Awareness',
      1,
      '84',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'success',
      NULL,
      'Percentage of Egyptian population aware of EFB',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Public Awareness',
      'brand_ranking',
      'Brand Ranking',
      2,
      '4',
      NULL,
      NULL,
      'rank',
      'number',
      NULL,
      NULL,
      'success',
      NULL,
      'Ranking among Egyptian charitable organizations',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Public Awareness',
      'net_promoter_score',
      'Net Promoter Score',
      3,
      '41',
      NULL,
      NULL,
      'score',
      'number',
      NULL,
      NULL,
      'success',
      NULL,
      'Likelihood of recommending EFB to others',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Public Awareness',
      'ad_recall',
      'Advertisement Recall',
      4,
      '48',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'warning',
      NULL,
      'Percentage recalling EFB advertisements',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Public Awareness',
      'likeability',
      'Brand Likeability',
      5,
      '86',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'success',
      NULL,
      'Positive sentiment towards EFB brand',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Volunteer Engagement',
      'total_volunteers',
      'Total Volunteers',
      6,
      '13000',
      NULL,
      NULL,
      'people',
      'number',
      NULL,
      NULL,
      'primary',
      NULL,
      'Direct EFB volunteers',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Volunteer Engagement',
      'volunteer_hours',
      'Volunteer Hours',
      7,
      '200000',
      NULL,
      NULL,
      'hours',
      'number',
      NULL,
      NULL,
      'primary',
      NULL,
      'Annual volunteer hours contributed',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Volunteer Engagement',
      'volunteer_monetary_value',
      'Volunteer Monetary Value',
      8,
      '10000000',
      NULL,
      NULL,
      'EGP',
      'currency',
      NULL,
      NULL,
      'success',
      NULL,
      'Economic value of volunteer contributions',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Volunteer Engagement',
      'volunteer_satisfaction',
      'Volunteer Satisfaction',
      9,
      '95',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'success',
      NULL,
      'Volunteer satisfaction rate',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Volunteer Engagement',
      'volunteer_retention',
      'Volunteer Retention',
      10,
      '89',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'success',
      NULL,
      'Annual volunteer retention rate',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Volunteer Engagement',
      'partner_volunteers',
      'Partner Volunteers',
      11,
      '80000',
      NULL,
      NULL,
      'people',
      'number',
      NULL,
      NULL,
      'success',
      NULL,
      'Volunteers from partner organizations',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Digital Engagement',
      'facebook_growth',
      'Facebook Growth',
      12,
      '22',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'success',
      NULL,
      'Annual Facebook follower growth',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Digital Engagement',
      'instagram_growth',
      'Instagram Growth',
      13,
      '45',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'success',
      NULL,
      'Annual Instagram follower growth',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Digital Engagement',
      'hashtag_reach',
      'Hashtag Reach',
      14,
      '3000000',
      NULL,
      NULL,
      'impressions',
      'number',
      NULL,
      NULL,
      'success',
      NULL,
      'Total hashtag impressions across platforms',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Digital Engagement',
      'whatsapp_users',
      'WhatsApp Users',
      15,
      '10000',
      NULL,
      NULL,
      'users',
      'number',
      NULL,
      NULL,
      'primary',
      NULL,
      'Active WhatsApp community members',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'stakeholders',
      'Digital Engagement',
      'online_donation_growth',
      'Online Donation Growth',
      16,
      '51',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'success',
      NULL,
      'Growth in online donation volume',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'scenarios',
      'Economic Factors',
      'economic_growth_factor',
      'GDP Growth Rate',
      1,
      '4.2',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'neutral',
      NULL,
      'Egypt''s real GDP growth rate impact factor',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'scenarios',
      'Economic Factors',
      'inflation_rate_factor',
      'Food Inflation Rate',
      2,
      '7',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'warning',
      NULL,
      'Annual food price inflation factor',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'scenarios',
      'Economic Factors',
      'donor_sentiment_factor',
      'Donor Confidence Index',
      3,
      '0',
      NULL,
      NULL,
      'pts',
      'number',
      NULL,
      NULL,
      'neutral',
      NULL,
      'Public trust in charitable organizations',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'scenarios',
      'Economic Factors',
      'operational_efficiency_factor',
      'Process Optimization',
      4,
      '0',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'neutral',
      NULL,
      'Digital transformation and logistics gains',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'scenarios',
      'Economic Factors',
      'food_prices_factor',
      'Global Commodity Prices',
      5,
      '0',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'neutral',
      NULL,
      'FAO Food Price Index impact',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'scenarios',
      'Economic Factors',
      'unemployment_rate_factor',
      'Unemployment Rate',
      6,
      '7.4',
      NULL,
      NULL,
      'pts',
      'number',
      NULL,
      NULL,
      'warning',
      NULL,
      'Egypt labor market conditions',
      NULL,
      NULL,
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'global_signals',
      'Global Indicators',
      'fao_food_price_index',
      'FAO Food Price Index',
      1,
      '120.5',
      NULL,
      NULL,
      'index',
      'number',
      NULL,
      NULL,
      'warning',
      NULL,
      'Measures global food commodity price changes. Index value where 2014-2016 average = 100.',
      NULL,
      'FAO',
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'global_signals',
      'Global Indicators',
      'usd_egp_exchange_rate',
      'USD/EGP Exchange Rate',
      2,
      '30.85',
      NULL,
      NULL,
      'EGP per USD',
      'number',
      NULL,
      NULL,
      'danger',
      NULL,
      'How many Egyptian Pounds needed to buy 1 US Dollar.',
      NULL,
      'Central Bank of Egypt',
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'global_signals',
      'Global Indicators',
      'cost_of_healthy_diet',
      'Cost of Healthy Diet',
      3,
      '3.85',
      NULL,
      NULL,
      'int-$/day',
      'number',
      NULL,
      NULL,
      'warning',
      NULL,
      'Daily cost for one person to afford the least expensive healthy diet in Egypt.',
      NULL,
      'Our World in Data',
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'global_signals',
      'Global Indicators',
      'food_insecurity_fies',
      'Food Insecurity (FIES)',
      4,
      '28.5',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'danger',
      NULL,
      'Percentage of Egypt''s population experiencing moderate or severe food insecurity.',
      NULL,
      'Our World in Data',
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'global_signals',
      'Egypt Indicators',
      'egypt_cpi_yoy',
      'Egypt CPI YoY',
      5,
      '25.8',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'danger',
      NULL,
      'Egypt''s official annual inflation rate from the Central Bank of Egypt.',
      NULL,
      'Central Bank of Egypt',
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'global_signals',
      'Egypt Indicators',
      'cbe_food_inflation',
      'CBE Food Inflation',
      6,
      '32.1',
      NULL,
      NULL,
      '%',
      'percentage',
      NULL,
      NULL,
      'danger',
      NULL,
      'Egypt''s food-specific inflation rate from Central Bank of Egypt.',
      NULL,
      'CBE Food Prices',
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'global_signals',
      'Egypt Indicators',
      'rain_et0_anomaly',
      'Rain - ET₀ Anomaly',
      7,
      '2.3',
      NULL,
      NULL,
      'mm/day',
      'number',
      NULL,
      NULL,
      'warning',
      NULL,
      '7-day average reference evapotranspiration anomaly in Egypt.',
      NULL,
      'Open-Meteo',
      NULL,
      NULL
    );
INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      'global_signals',
      'Egypt Indicators',
      'refugees_in_egypt',
      'Refugees in Egypt',
      8,
      '280000',
      NULL,
      NULL,
      'people',
      'number',
      NULL,
      NULL,
      'warning',
      NULL,
      'Total number of refugees and asylum-seekers registered with UNHCR in Egypt.',
      NULL,
      'UNHCR',
      NULL,
      NULL
    );

-- Verification queries
SELECT 'SCHEMA VERIFICATION' as status;
SELECT section_key, count(*) as metric_count FROM dashboard_metrics GROUP BY section_key ORDER BY section_key;
SELECT count(*) as total_metrics FROM dashboard_metrics;
SELECT count(*) as total_sections FROM dashboard_sections;
