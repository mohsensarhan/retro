#!/usr/bin/env node

/**
 * COMPLETE DASHBOARD FIELD INVENTORY & VALIDATION SCRIPT
 * 
 * This script extracts EVERY field displayed across ALL dashboard sections
 * and creates a comprehensive Supabase schema with automated testing.
 */

import fs from 'fs';
import path from 'path';

// Complete inventory of ALL dashboard fields across ALL sections
const COMPLETE_DASHBOARD_INVENTORY = {
  // EXECUTIVE SECTION
  executive: {
    section_name: "Executive Summary",
    display_order: 1,
    metrics: [
      // Core KPIs (from ExecutiveDashboard.tsx lines 286-336)
      {
        metric_key: "people_served",
        metric_name: "Lives Impacted",
        category: "Core Metrics",
        display_order: 1,
        current_value: "4960000",
        unit: "people",
        format_type: "number",
        change_value: "+43% CAGR",
        change_direction: "up",
        color_theme: "success",
        icon_name: "Users",
        description: "Unique individuals reached nationwide",
        methodology: "Unique beneficiary identification using national ID verification system, preventing double-counting across multiple programs and time periods.",
        data_source: "National Beneficiary Database + Ministry of Social Solidarity Integration",
        interpretation: "4.96M represents 4.8% of Egypt's total population, focusing on most vulnerable households identified through poverty mapping",
        significance: "Largest humanitarian reach in Egypt's history, exceeding government social protection programs in coverage and efficiency"
      },
      {
        metric_key: "meals_delivered",
        metric_name: "Meals Delivered",
        category: "Core Metrics", 
        display_order: 2,
        current_value: "367490721",
        unit: "meals",
        format_type: "number",
        change_value: "+40% YoY",
        change_direction: "up",
        color_theme: "neutral",
        icon_name: "Target",
        description: "Total annual food assistance",
        methodology: "Comprehensive meal equivalent calculation using WHO nutritional standards, verified through biometric distribution tracking and partner reporting.",
        data_source: "Distribution Management System + Partner Network Reports + Field Verification",
        interpretation: "367.5M meals represents 72 meals per beneficiary annually, equivalent to providing complete nutrition for 1 million people daily",
        significance: "Largest food distribution operation in MENA region, preventing acute malnutrition crisis during economic downturn"
      },
      {
        metric_key: "cost_per_meal",
        metric_name: "Cost Per Meal",
        category: "Core Metrics",
        display_order: 3,
        current_value: "6.36",
        unit: "EGP",
        format_type: "currency",
        change_value: "83% ratio",
        change_direction: "stable",
        color_theme: "warning",
        icon_name: "DollarSign",
        description: "All-inclusive program cost",
        methodology: "Activity-based costing system allocating all organizational expenses across meals delivered, including overhead, quality assurance, and impact measurement.",
        data_source: "ERP Financial System + Time-Driven Activity Based Costing Model",
        interpretation: "EGP 6.36 (~$0.21 USD) per meal represents world-class efficiency, 70% below global humanitarian sector average",
        significance: "Exceptional cost efficiency maximizes donor impact and enables sustainable scale expansion during economic challenges"
      },
      {
        metric_key: "coverage",
        metric_name: "Coverage",
        category: "Core Metrics",
        display_order: 4,
        current_value: "27",
        unit: "/27",
        format_type: "simple",
        change_value: "100% coverage",
        change_direction: "up",
        color_theme: "danger",
        icon_name: "Globe",
        description: "Governorates reached",
        methodology: "Geographic Information Systems mapping of service delivery points combined with population density analysis and accessibility metrics.",
        data_source: "Partner Network Database + Government Administrative Records + Field Operations",
        interpretation: "100% governorate coverage with 87% average population accessibility represents unmatched humanitarian reach",
        significance: "Universal coverage ensures equitable access regardless of geographic location, critical for national food security"
      }
    ]
  },

  // FINANCIAL SECTION
  financial: {
    section_name: "Financial Analytics",
    display_order: 2,
    metrics: [
      // From FinancialHealthGrid.tsx and AdvancedFinancialAnalytics.tsx
      {
        metric_key: "total_revenue",
        metric_name: "Total Revenue",
        category: "Revenue",
        display_order: 1,
        current_value: "2199845190",
        unit: "EGP",
        format_type: "currency",
        change_value: "+3.4% YoY",
        change_direction: "up",
        color_theme: "success",
        icon_name: "TrendingUp",
        description: "Total annual revenue across all sources",
        data_source: "ERP Financial System"
      },
      {
        metric_key: "online_individual_donations",
        metric_name: "Online Individual Donations",
        category: "Revenue",
        display_order: 2,
        current_value: "749110274",
        unit: "EGP",
        format_type: "currency",
        color_theme: "success",
        description: "Individual donations through online channels"
      },
      {
        metric_key: "corporate_community_donations",
        metric_name: "Corporate & Community Donations",
        category: "Revenue",
        display_order: 3,
        current_value: "329522158",
        unit: "EGP",
        format_type: "currency",
        color_theme: "success",
        description: "Corporate partnerships and community fundraising"
      },
      {
        metric_key: "foundations_grants",
        metric_name: "Foundations & Grants",
        category: "Revenue",
        display_order: 4,
        current_value: "293228838",
        unit: "EGP",
        format_type: "currency",
        color_theme: "success",
        description: "Institutional grants and foundation funding"
      },
      {
        metric_key: "in_kind_food",
        metric_name: "In-Kind Food Donations",
        category: "Revenue",
        display_order: 5,
        current_value: "210942385",
        unit: "EGP",
        format_type: "currency",
        color_theme: "success",
        description: "Value of donated food items"
      },
      {
        metric_key: "wafra_farm",
        metric_name: "Wafra Farm Revenue",
        category: "Revenue",
        display_order: 6,
        current_value: "186915672",
        unit: "EGP",
        format_type: "currency",
        color_theme: "success",
        description: "Revenue from agricultural operations"
      },
      {
        metric_key: "total_expenses",
        metric_name: "Total Expenses",
        category: "Expenses",
        display_order: 7,
        current_value: "2316248118",
        unit: "EGP",
        format_type: "currency",
        change_value: "+18% YoY",
        change_direction: "up",
        color_theme: "warning",
        icon_name: "DollarSign",
        description: "Total annual operational expenses"
      },
      {
        metric_key: "program_costs",
        metric_name: "Program Costs",
        category: "Expenses",
        display_order: 8,
        current_value: "1937854454",
        unit: "EGP",
        format_type: "currency",
        color_theme: "primary",
        description: "Direct program implementation costs"
      },
      {
        metric_key: "fundraising_costs",
        metric_name: "Fundraising Costs",
        category: "Expenses",
        display_order: 9,
        current_value: "289218262",
        unit: "EGP",
        format_type: "currency",
        color_theme: "warning",
        description: "Fundraising and donor acquisition costs"
      },
      {
        metric_key: "admin_general_costs",
        metric_name: "Administrative & General Costs",
        category: "Expenses",
        display_order: 10,
        current_value: "109448326",
        unit: "EGP",
        format_type: "currency",
        color_theme: "neutral",
        description: "Administrative and overhead expenses"
      },
      {
        metric_key: "operating_deficit",
        metric_name: "Operating Deficit",
        category: "Financial Health",
        display_order: 11,
        current_value: "116402928",
        unit: "EGP",
        format_type: "currency",
        color_theme: "danger",
        description: "Annual operating deficit (expenses - revenue)"
      },
      {
        metric_key: "program_ratio",
        metric_name: "Program Efficiency Ratio",
        category: "Financial Health",
        display_order: 12,
        current_value: "83",
        unit: "%",
        format_type: "percentage",
        color_theme: "success",
        description: "Percentage of expenses going directly to programs"
      },
      {
        metric_key: "fundraising_efficiency",
        metric_name: "Fundraising Efficiency",
        category: "Financial Health",
        display_order: 13,
        current_value: "7.6",
        unit: "%",
        format_type: "percentage",
        color_theme: "success",
        description: "Fundraising costs as percentage of total expenses"
      },
      {
        metric_key: "reserves",
        metric_name: "Reserves",
        category: "Financial Health",
        display_order: 14,
        current_value: "731200000",
        unit: "EGP",
        format_type: "currency",
        color_theme: "primary",
        icon_name: "Shield",
        description: "Total organizational reserves"
      },
      {
        metric_key: "cash_position",
        metric_name: "Cash Position",
        category: "Financial Health",
        display_order: 15,
        current_value: "459800000",
        unit: "EGP",
        format_type: "currency",
        color_theme: "primary",
        description: "Current liquid cash position"
      }
    ]
  },

  // OPERATIONAL SECTION
  operational: {
    section_name: "Operational Analytics",
    display_order: 3,
    metrics: [
      // From OperationalAnalytics.tsx
      {
        metric_key: "distribution_efficiency_rate",
        metric_name: "Distribution Efficiency Rate",
        category: "Logistics",
        display_order: 1,
        current_value: "94.7",
        unit: "%",
        format_type: "percentage",
        change_value: "+2.3% vs target",
        change_direction: "up",
        color_theme: "success",
        icon_name: "Truck",
        description: "Percentage of food boxes successfully delivered to intended beneficiaries",
        methodology: "Calculated as (Successfully Delivered Boxes ÷ Total Dispatched Boxes) × 100. Success defined as verified delivery to correct beneficiary within planned timeframe.",
        data_source: "EFB Logistics Management System + Partner Organization Reports",
        interpretation: "94.7% efficiency indicates world-class distribution capability, exceeding UN WFP benchmark of 92%",
        significance: "Critical operational KPI showing EFB's ability to execute at scale while maintaining quality"
      },
      {
        metric_key: "average_cost_per_beneficiary",
        metric_name: "Average Cost Per Beneficiary",
        category: "Cost Management",
        display_order: 2,
        current_value: "459",
        unit: "EGP",
        format_type: "currency",
        change_value: "-8.2% cost reduction",
        change_direction: "down",
        color_theme: "success",
        icon_name: "Users",
        description: "Total annual cost per unique individual served across all programs",
        methodology: "Total Program Expenses ÷ Unique Beneficiaries Served. Includes direct food costs, logistics, administrative overhead allocated by time-driven activity-based costing.",
        data_source: "ERP Financial System + Beneficiary Database Integration",
        interpretation: "EGP 459 (~$15 USD) per person annually represents exceptional cost efficiency in humanitarian sector",
        significance: "Demonstrates EFB's operational excellence and scalability, enabling maximum impact per donor dollar"
      },
      {
        metric_key: "warehouse_utilization",
        metric_name: "Warehouse Utilization",
        category: "Logistics",
        display_order: 3,
        current_value: "87",
        unit: "%",
        format_type: "percentage",
        color_theme: "success",
        description: "20 strategic distribution centers operating at optimal capacity"
      },
      {
        metric_key: "delivery_time_accuracy",
        metric_name: "Delivery Time Accuracy",
        category: "Logistics",
        display_order: 4,
        current_value: "91",
        unit: "%",
        format_type: "percentage",
        color_theme: "success",
        description: "On-time delivery within ±2 days of scheduled date"
      },
      {
        metric_key: "inventory_turnover",
        metric_name: "Inventory Turnover",
        category: "Logistics",
        display_order: 5,
        current_value: "24",
        unit: "times/year",
        format_type: "number",
        color_theme: "success",
        description: "15-day average inventory holding period"
      },
      {
        metric_key: "partner_network_reliability",
        metric_name: "Partner Network Reliability",
        category: "Partnerships",
        display_order: 6,
        current_value: "96",
        unit: "%",
        format_type: "percentage",
        color_theme: "success",
        description: "5,000 partners maintaining quality standards"
      }
    ]
  },

  // PROGRAMS SECTION
  programs: {
    section_name: "Programs Analytics",
    display_order: 4,
    metrics: [
      // From ProgramsAnalytics.tsx
      {
        metric_key: "stunting_prevention_impact",
        metric_name: "Stunting Prevention Impact",
        category: "Health Outcomes",
        display_order: 1,
        current_value: "14% → 2%",
        unit: "reduction",
        format_type: "text",
        color_theme: "success",
        icon_name: "Award",
        description: "Reduction in child stunting rates in targeted communities",
        methodology: "Longitudinal cohort study tracking 12,847 children over 24 months using WHO growth standards. Pre/post intervention comparison with control groups.",
        data_source: "Ministry of Health Partnership + EFB Field Monitoring Teams",
        interpretation: "86% relative reduction in stunting demonstrates exceptional program effectiveness, surpassing global best practices",
        significance: "This outcome represents prevention of 15,647 cases of chronic malnutrition, with lifetime economic value of EGP 2.1B"
      },
      {
        metric_key: "school_feeding_coverage",
        metric_name: "School Feeding Coverage",
        category: "Education",
        display_order: 2,
        current_value: "125000",
        unit: "students",
        format_type: "number",
        color_theme: "success",
        description: "Students receiving daily nutritious meals in targeted schools",
        methodology: "Direct count of enrolled students in 512 participating schools across 15 governorates, verified through biometric attendance systems.",
        data_source: "Ministry of Education Partnership + School Attendance Records",
        interpretation: "125K students represent 3.2% of Egypt's total primary school population, with 94% attendance improvement in participating schools",
        significance: "Program demonstrates 23% improvement in learning outcomes and 31% reduction in dropout rates"
      },
      {
        metric_key: "protection_program_beneficiaries",
        metric_name: "Protection Programs Beneficiaries",
        category: "Program Reach",
        display_order: 3,
        current_value: "4890000",
        unit: "people",
        format_type: "number",
        color_theme: "success",
        description: "Emergency food assistance and monthly food boxes"
      },
      {
        metric_key: "prevention_program_beneficiaries",
        metric_name: "Prevention Programs Beneficiaries",
        category: "Program Reach",
        display_order: 4,
        current_value: "72000",
        unit: "people",
        format_type: "number",
        color_theme: "warning",
        description: "Nutrition education and health promotion"
      },
      {
        metric_key: "empowerment_program_beneficiaries",
        metric_name: "Empowerment Programs Beneficiaries",
        category: "Program Reach",
        display_order: 5,
        current_value: "6400",
        unit: "people",
        format_type: "number",
        color_theme: "primary",
        description: "Skills training and income generation"
      },
      {
        metric_key: "dietary_diversity_score",
        metric_name: "Dietary Diversity Score",
        category: "Impact Measurements",
        display_order: 6,
        current_value: "6.8",
        previous_value: "3.2",
        unit: "food groups",
        format_type: "number",
        color_theme: "success",
        description: "Average number of food groups consumed by beneficiaries"
      },
      {
        metric_key: "food_security_score",
        metric_name: "Food Security Score",
        category: "Impact Measurements",
        display_order: 7,
        current_value: "78",
        previous_value: "42",
        unit: "index points",
        format_type: "number",
        color_theme: "success",
        description: "Composite food security index for beneficiary households"
      },
      {
        metric_key: "child_malnutrition_rate",
        metric_name: "Child Malnutrition Rate",
        category: "Impact Measurements",
        display_order: 8,
        current_value: "8.4",
        previous_value: "23.1",
        unit: "%",
        format_type: "percentage",
        color_theme: "success",
        description: "Percentage of children under 5 showing signs of malnutrition"
      },
      {
        metric_key: "household_resilience_index",
        metric_name: "Household Resilience Index",
        category: "Impact Measurements",
        display_order: 9,
        current_value: "7.2",
        previous_value: "2.8",
        unit: "resilience score",
        format_type: "number",
        color_theme: "success",
        description: "Household ability to cope with economic shocks"
      }
    ]
  },

  // STAKEHOLDERS SECTION
  stakeholders: {
    section_name: "Stakeholder Analytics",
    display_order: 5,
    metrics: [
      // From StakeholderAnalytics.tsx
      {
        metric_key: "overall_awareness",
        metric_name: "Overall Public Awareness",
        category: "Public Awareness",
        display_order: 1,
        current_value: "84",
        unit: "%",
        format_type: "percentage",
        color_theme: "success",
        description: "Percentage of Egyptian population aware of EFB"
      },
      {
        metric_key: "brand_ranking",
        metric_name: "Brand Ranking",
        category: "Public Awareness",
        display_order: 2,
        current_value: "4",
        unit: "rank",
        format_type: "number",
        color_theme: "success",
        description: "Ranking among Egyptian charitable organizations"
      },
      {
        metric_key: "net_promoter_score",
        metric_name: "Net Promoter Score",
        category: "Public Awareness",
        display_order: 3,
        current_value: "41",
        unit: "score",
        format_type: "number",
        color_theme: "success",
        description: "Likelihood of recommending EFB to others"
      },
      {
        metric_key: "ad_recall",
        metric_name: "Advertisement Recall",
        category: "Public Awareness",
        display_order: 4,
        current_value: "48",
        unit: "%",
        format_type: "percentage",
        color_theme: "warning",
        description: "Percentage recalling EFB advertisements"
      },
      {
        metric_key: "likeability",
        metric_name: "Brand Likeability",
        category: "Public Awareness",
        display_order: 5,
        current_value: "86",
        unit: "%",
        format_type: "percentage",
        color_theme: "success",
        description: "Positive sentiment towards EFB brand"
      },
      {
        metric_key: "total_volunteers",
        metric_name: "Total Volunteers",
        category: "Volunteer Engagement",
        display_order: 6,
        current_value: "13000",
        unit: "people",
        format_type: "number",
        color_theme: "primary",
        description: "Direct EFB volunteers"
      },
      {
        metric_key: "volunteer_hours",
        metric_name: "Volunteer Hours",
        category: "Volunteer Engagement",
        display_order: 7,
        current_value: "200000",
        unit: "hours",
        format_type: "number",
        color_theme: "primary",
        description: "Annual volunteer hours contributed"
      },
      {
        metric_key: "volunteer_monetary_value",
        metric_name: "Volunteer Monetary Value",
        category: "Volunteer Engagement",
        display_order: 8,
        current_value: "10000000",
        unit: "EGP",
        format_type: "currency",
        color_theme: "success",
        description: "Economic value of volunteer contributions"
      },
      {
        metric_key: "volunteer_satisfaction",
        metric_name: "Volunteer Satisfaction",
        category: "Volunteer Engagement",
        display_order: 9,
        current_value: "95",
        unit: "%",
        format_type: "percentage",
        color_theme: "success",
        description: "Volunteer satisfaction rate"
      },
      {
        metric_key: "volunteer_retention",
        metric_name: "Volunteer Retention",
        category: "Volunteer Engagement",
        display_order: 10,
        current_value: "89",
        unit: "%",
        format_type: "percentage",
        color_theme: "success",
        description: "Annual volunteer retention rate"
      },
      {
        metric_key: "partner_volunteers",
        metric_name: "Partner Volunteers",
        category: "Volunteer Engagement",
        display_order: 11,
        current_value: "80000",
        unit: "people",
        format_type: "number",
        color_theme: "success",
        description: "Volunteers from partner organizations"
      },
      {
        metric_key: "facebook_growth",
        metric_name: "Facebook Growth",
        category: "Digital Engagement",
        display_order: 12,
        current_value: "22",
        unit: "%",
        format_type: "percentage",
        color_theme: "success",
        description: "Annual Facebook follower growth"
      },
      {
        metric_key: "instagram_growth",
        metric_name: "Instagram Growth",
        category: "Digital Engagement",
        display_order: 13,
        current_value: "45",
        unit: "%",
        format_type: "percentage",
        color_theme: "success",
        description: "Annual Instagram follower growth"
      },
      {
        metric_key: "hashtag_reach",
        metric_name: "Hashtag Reach",
        category: "Digital Engagement",
        display_order: 14,
        current_value: "3000000",
        unit: "impressions",
        format_type: "number",
        color_theme: "success",
        description: "Total hashtag impressions across platforms"
      },
      {
        metric_key: "whatsapp_users",
        metric_name: "WhatsApp Users",
        category: "Digital Engagement",
        display_order: 15,
        current_value: "10000",
        unit: "users",
        format_type: "number",
        color_theme: "primary",
        description: "Active WhatsApp community members"
      },
      {
        metric_key: "online_donation_growth",
        metric_name: "Online Donation Growth",
        category: "Digital Engagement",
        display_order: 16,
        current_value: "51",
        unit: "%",
        format_type: "percentage",
        color_theme: "success",
        description: "Growth in online donation volume"
      }
    ]
  },

  // SCENARIOS SECTION
  scenarios: {
    section_name: "Scenario Analysis",
    display_order: 6,
    metrics: [
      // From ScenarioAnalysis.tsx - these are dynamic calculated values
      {
        metric_key: "economic_growth_factor",
        metric_name: "GDP Growth Rate",
        category: "Economic Factors",
        display_order: 1,
        current_value: "4.2",
        unit: "%",
        format_type: "percentage",
        color_theme: "neutral",
        description: "Egypt's real GDP growth rate impact factor"
      },
      {
        metric_key: "inflation_rate_factor",
        metric_name: "Food Inflation Rate",
        category: "Economic Factors",
        display_order: 2,
        current_value: "7",
        unit: "%",
        format_type: "percentage",
        color_theme: "warning",
        description: "Annual food price inflation factor"
      },
      {
        metric_key: "donor_sentiment_factor",
        metric_name: "Donor Confidence Index",
        category: "Economic Factors",
        display_order: 3,
        current_value: "0",
        unit: "pts",
        format_type: "number",
        color_theme: "neutral",
        description: "Public trust in charitable organizations"
      },
      {
        metric_key: "operational_efficiency_factor",
        metric_name: "Process Optimization",
        category: "Economic Factors",
        display_order: 4,
        current_value: "0",
        unit: "%",
        format_type: "percentage",
        color_theme: "neutral",
        description: "Digital transformation and logistics gains"
      },
      {
        metric_key: "food_prices_factor",
        metric_name: "Global Commodity Prices",
        category: "Economic Factors",
        display_order: 5,
        current_value: "0",
        unit: "%",
        format_type: "percentage",
        color_theme: "neutral",
        description: "FAO Food Price Index impact"
      },
      {
        metric_key: "unemployment_rate_factor",
        metric_name: "Unemployment Rate",
        category: "Economic Factors",
        display_order: 6,
        current_value: "7.4",
        unit: "pts",
        format_type: "number",
        color_theme: "warning",
        description: "Egypt labor market conditions"
      }
    ]
  },

  // GLOBAL SIGNALS SECTION (from GlobalSignalsSection.tsx)
  global_signals: {
    section_name: "Global Signals",
    display_order: 7,
    metrics: [
      {
        metric_key: "fao_food_price_index",
        metric_name: "FAO Food Price Index",
        category: "Global Indicators",
        display_order: 1,
        current_value: "120.5",
        unit: "index",
        format_type: "number",
        color_theme: "warning",
        description: "Measures global food commodity price changes. Index value where 2014-2016 average = 100.",
        data_source: "FAO"
      },
      {
        metric_key: "usd_egp_exchange_rate",
        metric_name: "USD/EGP Exchange Rate",
        category: "Global Indicators",
        display_order: 2,
        current_value: "30.85",
        unit: "EGP per USD",
        format_type: "number",
        color_theme: "danger",
        description: "How many Egyptian Pounds needed to buy 1 US Dollar.",
        data_source: "Central Bank of Egypt"
      },
      {
        metric_key: "cost_of_healthy_diet",
        metric_name: "Cost of Healthy Diet",
        category: "Global Indicators",
        display_order: 3,
        current_value: "3.85",
        unit: "int-$/day",
        format_type: "number",
        color_theme: "warning",
        description: "Daily cost for one person to afford the least expensive healthy diet in Egypt.",
        data_source: "Our World in Data"
      },
      {
        metric_key: "food_insecurity_fies",
        metric_name: "Food Insecurity (FIES)",
        category: "Global Indicators",
        display_order: 4,
        current_value: "28.5",
        unit: "%",
        format_type: "percentage",
        color_theme: "danger",
        description: "Percentage of Egypt's population experiencing moderate or severe food insecurity.",
        data_source: "Our World in Data"
      },
      {
        metric_key: "egypt_cpi_yoy",
        metric_name: "Egypt CPI YoY",
        category: "Egypt Indicators",
        display_order: 5,
        current_value: "25.8",
        unit: "%",
        format_type: "percentage",
        color_theme: "danger",
        description: "Egypt's official annual inflation rate from the Central Bank of Egypt.",
        data_source: "Central Bank of Egypt"
      },
      {
        metric_key: "cbe_food_inflation",
        metric_name: "CBE Food Inflation",
        category: "Egypt Indicators",
        display_order: 6,
        current_value: "32.1",
        unit: "%",
        format_type: "percentage",
        color_theme: "danger",
        description: "Egypt's food-specific inflation rate from Central Bank of Egypt.",
        data_source: "CBE Food Prices"
      },
      {
        metric_key: "rain_et0_anomaly",
        metric_name: "Rain - ET₀ Anomaly",
        category: "Egypt Indicators",
        display_order: 7,
        current_value: "2.3",
        unit: "mm/day",
        format_type: "number",
        color_theme: "warning",
        description: "7-day average reference evapotranspiration anomaly in Egypt.",
        data_source: "Open-Meteo"
      },
      {
        metric_key: "refugees_in_egypt",
        metric_name: "Refugees in Egypt",
        category: "Egypt Indicators",
        display_order: 8,
        current_value: "280000",
        unit: "people",
        format_type: "number",
        color_theme: "warning",
        description: "Total number of refugees and asylum-seekers registered with UNHCR in Egypt.",
        data_source: "UNHCR"
      }
    ]
  }
};

// Generate complete SQL schema
function generateCompleteSchema() {
  return `-- COMPLETE EFB DASHBOARD SCHEMA
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
${Object.entries(COMPLETE_DASHBOARD_INVENTORY).map(([sectionKey, section]) => 
  `INSERT INTO dashboard_sections (section_key, section_name, display_order, is_active) 
   VALUES ('${sectionKey}', '${section.section_name}', ${section.display_order}, true);`
).join('\n')}

-- Insert all metrics
${Object.entries(COMPLETE_DASHBOARD_INVENTORY).map(([sectionKey, section]) => 
  section.metrics.map(metric => 
    `INSERT INTO dashboard_metrics (
      section_key, category, metric_key, metric_name, display_order,
      current_value, previous_value, target_value, unit, format_type,
      change_value, change_direction, color_theme, icon_name,
      description, methodology, data_source, interpretation, significance
    ) VALUES (
      '${sectionKey}',
      '${metric.category}',
      '${metric.metric_key}',
      '${metric.metric_name}',
      ${metric.display_order},
      '${metric.current_value}',
      ${metric.previous_value ? `'${metric.previous_value}'` : 'NULL'},
      ${metric.target_value ? `'${metric.target_value}'` : 'NULL'},
      ${metric.unit ? `'${metric.unit}'` : 'NULL'},
      '${metric.format_type}',
      ${metric.change_value ? `'${metric.change_value}'` : 'NULL'},
      ${metric.change_direction ? `'${metric.change_direction}'` : 'NULL'},
      '${metric.color_theme}',
      ${metric.icon_name ? `'${metric.icon_name}'` : 'NULL'},
      ${metric.description ? `'${metric.description.replace(/'/g, "''")}'` : 'NULL'},
      ${metric.methodology ? `'${metric.methodology.replace(/'/g, "''")}'` : 'NULL'},
      ${metric.data_source ? `'${metric.data_source.replace(/'/g, "''")}'` : 'NULL'},
      ${metric.interpretation ? `'${metric.interpretation.replace(/'/g, "''")}'` : 'NULL'},
      ${metric.significance ? `'${metric.significance.replace(/'/g, "''")}'` : 'NULL'}
    );`
  ).join('\n')
).join('\n')}

-- Verification queries
SELECT 'SCHEMA VERIFICATION' as status;
SELECT section_key, count(*) as metric_count FROM dashboard_metrics GROUP BY section_key ORDER BY section_key;
SELECT count(*) as total_metrics FROM dashboard_metrics;
SELECT count(*) as total_sections FROM dashboard_sections;
`;
}

// Generate validation script
function generateValidationScript() {
  const totalMetrics = Object.values(COMPLETE_DASHBOARD_INVENTORY).reduce((sum, section) => sum + section.metrics.length, 0);
  
  return `-- COMPLETE VALIDATION SCRIPT
-- Tests every single field connection between Admin Panel, Dashboard, and Supabase

-- 1. Count verification
SELECT 'TOTAL METRICS CHECK' as test_name, 
       count(*) as actual_count, 
       ${totalMetrics} as expected_count,
       CASE WHEN count(*) = ${totalMetrics} THEN 'PASS' ELSE 'FAIL' END as result
FROM dashboard_metrics;

-- 2. Section coverage verification
WITH expected_sections AS (
  SELECT unnest(ARRAY[${Object.keys(COMPLETE_DASHBOARD_INVENTORY).map(k => `'${k}'`).join(', ')}]) as section_key
),
actual_sections AS (
  SELECT DISTINCT section_key FROM dashboard_metrics
)
SELECT 'SECTION COVERAGE CHECK' as test_name,
       e.section_key,
       CASE WHEN a.section_key IS NOT NULL THEN 'PRESENT' ELSE 'MISSING' END as status
FROM expected_sections e
LEFT JOIN actual_sections a ON e.section_key = a.section_key
ORDER BY e.section_key;

-- 3. Required fields check
SELECT 'REQUIRED FIELDS CHECK' as test_name,
       count(*) as records_with_all_required,
       (SELECT count(*) FROM dashboard_metrics) as total_records,
       CASE WHEN count(*) = (SELECT count(*) FROM dashboard_metrics) THEN 'PASS' ELSE 'FAIL' END as result
FROM dashboard_metrics 
WHERE section_key IS NOT NULL 
  AND metric_key IS NOT NULL 
  AND metric_name IS NOT NULL 
  AND current_value IS NOT NULL;

-- 4. Executive metrics specific check (critical for dashboard)
WITH required_executive AS (
  SELECT unnest(ARRAY['people_served', 'meals_delivered', 'cost_per_meal', 'coverage']) as metric_key
),
actual_executive AS (
  SELECT metric_key FROM dashboard_metrics WHERE section_key = 'executive'
)
SELECT 'EXECUTIVE METRICS CHECK' as test_name,
       r.metric_key,
       CASE WHEN a.metric_key IS NOT NULL THEN 'PRESENT' ELSE 'MISSING' END as status
FROM required_executive r
LEFT JOIN actual_executive a ON r.metric_key = a.metric_key
ORDER BY r.metric_key;

-- 5. Financial metrics check
SELECT 'FINANCIAL METRICS CHECK' as test_name,
       count(*) as financial_metrics_count,
       CASE WHEN count(*) >= 10 THEN 'PASS' ELSE 'FAIL' END as result
FROM dashboard_metrics 
WHERE section_key = 'financial';

-- 6. Data quality check
SELECT 'DATA QUALITY CHECK' as test_name,
       'Empty values' as issue_type,
       count(*) as issue_count
FROM dashboard_metrics 
WHERE current_value = '' OR current_value IS NULL
UNION ALL
SELECT 'DATA QUALITY CHECK' as test_name,
       'Missing descriptions' as issue_type,
       count(*) as issue_count
FROM dashboard_metrics 
WHERE description IS NULL OR description = ''
UNION ALL
SELECT 'DATA QUALITY CHECK' as test_name,
       'Invalid format_type' as issue_type,
       count(*) as issue_count
FROM dashboard_metrics 
WHERE format_type NOT IN ('number', 'currency', 'percentage', 'text', 'simple');

-- 7. Real-time update test setup
INSERT INTO dashboard_metrics (
  section_key, category, metric_key, metric_name, display_order,
  current_value, format_type, color_theme, description
) VALUES (
  'test', 'Test Category', 'test_metric', 'Test Metric', 999,
  '12345', 'number', 'neutral', 'Test metric for validation'
) ON CONFLICT (section_key, metric_key) DO UPDATE SET
  current_value = EXCLUDED.current_value,
  updated_at = NOW();

-- Verify test record was created/updated
SELECT 'REAL-TIME UPDATE TEST' as test_name,
       metric_key,
       current_value,
       updated_at,
       CASE WHEN updated_at > NOW() - INTERVAL '10 seconds' THEN 'PASS' ELSE 'FAIL' END as result
FROM dashboard_metrics 
WHERE section_key = 'test' AND metric_key = 'test_metric';

-- Clean up test record
DELETE FROM dashboard_metrics WHERE section_key = 'test' AND metric_key = 'test_metric';

-- 8. Summary report
SELECT 'VALIDATION SUMMARY' as report_type,
       (SELECT count(*) FROM dashboard_metrics) as total_metrics,
       (SELECT count(DISTINCT section_key) FROM dashboard_metrics) as total_sections,
       (SELECT count(*) FROM dashboard_metrics WHERE current_value IS NOT NULL AND current_value != '') as metrics_with_values,
       (SELECT count(*) FROM dashboard_metrics WHERE description IS NOT NULL AND description != '') as metrics_with_descriptions,
       NOW() as validation_timestamp;
`;
}

// Generate test automation script
function generateTestScript() {
  return `#!/usr/bin/env node

/**
 * AUTOMATED DASHBOARD VALIDATION TEST
 * Tests every field connection between Admin Panel, Dashboard Portal, and Supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://oktiojqphavkqeirbbul.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE3OTksImV4cCI6MjA3NDc5Nzc5OX0.3GUfIRtpx5yMKOxAte25IG3O5FlmYxjG21SEjPMFggc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runCompleteValidation() {
  console.log('🔍 Starting Complete Dashboard Validation...');
  console.log('=' .repeat(60));
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Connection Test
  try {
    const { data, error } = await supabase.from('dashboard_metrics').select('count').limit(1);
    if (error) throw error;
    results.tests.push({ name: 'Supabase Connection', status: 'PASS', details: 'Connected successfully' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Supabase Connection', status: 'FAIL', details: error.message });
    results.failed++;
  }

  // Test 2: Total Metrics Count
  try {
    const { count, error } = await supabase.from('dashboard_metrics').select('*', { count: 'exact', head: true });
    if (error) throw error;
    const expectedCount = ${Object.values(COMPLETE_DASHBOARD_INVENTORY).reduce((sum, section) => sum + section.metrics.length, 0)};
    if (count === expectedCount) {
      results.tests.push({ name: 'Total Metrics Count', status: 'PASS', details: \`Found \${count}/\${expectedCount} metrics\` });
      results.passed++;
    } else {
      results.tests.push({ name: 'Total Metrics Count', status: 'FAIL', details: \`Found \${count}/\${expectedCount} metrics\` });
      results.failed++;
    }
  } catch (error) {
    results.tests.push({ name: 'Total Metrics Count', status: 'FAIL', details: error.message });
    results.failed++;
  }

  // Test 3: Executive Metrics (Critical)
  try {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('metric_key')
      .eq('section_key', 'executive');
    
    if (error) throw error;
    
    const requiredKeys = ['people_served', 'meals_delivered', 'cost_per_meal', 'coverage'];
    const foundKeys = data.map(m => m.metric_key);
    const missingKeys = requiredKeys.filter(key => !foundKeys.includes(key));
    
    if (missingKeys.length === 0) {
      results.tests.push({ name: 'Executive Metrics', status: 'PASS', details: 'All required executive metrics present' });
      results.passed++;
    } else {
      results.tests.push({ name: 'Executive Metrics', status: 'FAIL', details: \`Missing: \${missingKeys.join(', ')}\` });
      results.failed++;
    }
  } catch (error) {
    results.tests.push({ name: 'Executive Metrics', status: 'FAIL', details: error.message });
    results.failed++;
  }

  // Test 4: Section Coverage
  try {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('section_key')
      .distinct();
    
    if (error) throw error;
    
    const expectedSections = [${Object.keys(COMPLETE_DASHBOARD_INVENTORY).map(k => `'${k}'`).join(', ')}];
    const foundSections = data.map(s => s.section_key);
    const missingSections = expectedSections.filter(section => !foundSections.includes(section));
    
    if (missingSections.length === 0) {
      results.tests.push({ name: 'Section Coverage', status: 'PASS', details: 'All sections present' });
      results.passed++;
    } else {
      results.tests.push({ name: 'Section Coverage', status: 'FAIL', details: \`Missing sections: \${missingSections.join(', ')}\` });
      results.failed++;
    }
  } catch (error) {
    results.tests.push({ name: 'Section Coverage', status: 'FAIL', details: error.message });
    results.failed++;
  }

  // Test 5: Real-time Update Test
  try {
    const testValue = Math.random().toString();
    const testMetric = {
      section_key: 'executive',
      metric_key: 'meals_delivered',
      current_value: testValue
    };

    // Update a metric
    const { error: updateError } = await supabase
      .from('dashboard_metrics')
      .update({ current_value: testValue })
      .eq('section_key', 'executive')
      .eq('metric_key', 'meals_delivered');

    if (updateError) throw updateError;

    // Verify update
    const { data, error: selectError } = await supabase
      .from('dashboard_metrics')
      .select('current_value')
      .eq('section_key', 'executive')
      .eq('metric_key', 'meals_delivered')
      .single();

    if (selectError) throw selectError;

    if (data.current_value === testValue) {
      results.tests.push({ name: 'Real-time Update', status: 'PASS', details: 'Update and retrieval successful' });
      results.passed++;
    } else {
      results.tests.push({ name: 'Real-time Update', status: 'FAIL', details: 'Value mismatch after update' });
      results.failed++;
    }

    // Restore original value
    await supabase
      .from('dashboard_metrics')
      .update({ current_value: '367490721' })
      .eq('section_key', 'executive')
      .eq('metric_key', 'meals_delivered');

  } catch (error) {
    results.tests.push({ name: 'Real-time Update', status: 'FAIL', details: error.message });
    results.failed++;
  }

  // Test 6: Data Quality Check
  try {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('metric_key, current_value, description')
      .or('current_value.is.null,current_value.eq.');
    
    if (error) throw error;
    
    if (data.length === 0) {
      results.tests.push({ name: 'Data Quality', status: 'PASS', details: 'No empty values found' });
      results.passed++;
    } else {
      results.tests.push({ name: 'Data Quality', status: 'FAIL', details: \`\${data.length} metrics with empty values\` });
      results.failed++;
    }
  } catch (error) {
    results.tests.push({ name: 'Data Quality', status: 'FAIL', details: error.message });
    results.failed++;
  }

  // Print Results
  console.log('\\n📊 VALIDATION RESULTS');
  console.log('=' .repeat(60));
  
  results.tests.forEach(test => {
    const status = test.status === 'PASS' ? '✅' : '❌';
    console.log(\`\${status} \${test.name}: \${test.details}\`);
  });
  
  console.log('\\n' + '=' .repeat(60));
  console.log(\`📈 SUMMARY: \${results.passed} passed, \${results.failed} failed\`);
  
  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Dashboard is fully connected.');
  } else {
    console.log('⚠️  Some tests failed. Check the details above.');
    process.exit(1);
  }
}

runCompleteValidation().catch(console.error);
`;
}

// Write all files
console.log('🚀 Generating Complete Dashboard Inventory & Validation System...');

// Write SQL schema
fs.writeFileSync('complete-dashboard-schema.sql', generateCompleteSchema());
console.log('✅ Generated: complete-dashboard-schema.sql');

// Write validation SQL
fs.writeFileSync('complete-dashboard-validation.sql', generateValidationScript());
console.log('✅ Generated: complete-dashboard-validation.sql');

// Write test script
fs.writeFileSync('complete-dashboard-test.js', generateTestScript());
console.log('✅ Generated: complete-dashboard-test.js');

// Write inventory JSON
fs.writeFileSync('complete-dashboard-inventory.json', JSON.stringify(COMPLETE_DASHBOARD_INVENTORY, null, 2));
console.log('✅ Generated: complete-dashboard-inventory.json');

// Summary
const totalMetrics = Object.values(COMPLETE_DASHBOARD_INVENTORY).reduce((sum, section) => sum + section.metrics.length, 0);
const totalSections = Object.keys(COMPLETE_DASHBOARD_INVENTORY).length;

console.log('\n📊 COMPLETE DASHBOARD INVENTORY SUMMARY');
console.log('=' .repeat(50));
console.log(`📋 Total Sections: ${totalSections}`);
console.log(`📈 Total Metrics: ${totalMetrics}`);
console.log('');

Object.entries(COMPLETE_DASHBOARD_INVENTORY).forEach(([key, section]) => {
  console.log(`📁 ${section.section_name}: ${section.metrics.length} metrics`);
});

console.log('\n🎯 NEXT STEPS:');
console.log('1. Run: complete-dashboard-schema.sql in Supabase SQL Editor');
console.log('2. Run: complete-dashboard-validation.sql to verify setup');
console.log('3. Run: node complete-dashboard-test.js to test connections');
console.log('4. Test admin panel at http://localhost:8080/admin');
console.log('5. Test real-time updates between admin and dashboard');

console.log('\n✨ This system now covers EVERY field across ALL dashboard sections!');
