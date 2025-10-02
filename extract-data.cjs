const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Create workbook
const workbook = XLSX.utils.book_new();

// 1. Executive Metrics Sheet
const executiveMetricsData = [
  ['Metric', 'Value', 'Description', 'Methodology', 'Data Source', 'Interpretation', 'Significance'],
  ['Lives Impacted', 4960000, '4.96 million unique individuals reached nationwide across all 27 governorates', 'Unique beneficiary identification using national ID verification system', 'National Beneficiary Database + Ministry of Social Solidarity Integration', '4.96M represents 4.8% of Egypt\'s total population', 'Largest humanitarian reach in Egypt\'s history'],
  ['Meals Delivered', 367490721, 'Total annual food assistance across protection, prevention, and empowerment programs', 'Comprehensive meal equivalent calculation using WHO nutritional standards', 'Distribution Management System + Partner Network Reports', '367.5M meals represents 72 meals per beneficiary annually', 'Largest food distribution operation in MENA region'],
  ['Cost Per Meal', 6.36, 'Industry-leading cost efficiency through supply chain innovation', 'Total program costs divided by verified meal equivalents', 'Financial Management System + Supply Chain Analytics', 'EGP 6.36 represents 40% cost reduction versus international standards', 'Sets global benchmark for humanitarian cost efficiency'],
  ['Program Efficiency', 83, 'Exceptional operational efficiency ensuring maximum resources reach beneficiaries', 'Program expenses as percentage of total expenses', 'Audited Financial Statements + Program Cost Allocation System', '83% efficiency exceeds international humanitarian standards by 18 percentage points', 'Top quartile global performance among humanitarian organizations'],
  ['Revenue', 2200000000, 'Total annual revenue from all sources', 'Comprehensive revenue tracking system', 'Financial Management System', 'Annual revenue for operations', 'Key financial metric for organizational sustainability'],
  ['Expenses', 2316000000, 'Total annual expenses across all programs', 'Comprehensive expense tracking system', 'Financial Management System', 'Annual expenses for operations', 'Key financial metric for organizational sustainability'],
  ['Reserves', 731200000, 'Total reserves available for operations', 'Comprehensive reserve tracking system', 'Financial Management System', 'Available reserves for operations', 'Key financial metric for organizational sustainability'],
  ['Cash Position', 459800000, 'Current cash position', 'Comprehensive cash tracking system', 'Financial Management System', 'Current cash available for operations', 'Key financial metric for organizational sustainability']
];

const executiveMetricsSheet = XLSX.utils.aoa_to_sheet(executiveMetricsData);
XLSX.utils.book_append_sheet(workbook, executiveMetricsSheet, 'Executive Metrics');

// 2. Growth Trajectory Data Sheet
const growthTrajectoryData = [
  ['Year', 'Meals Delivered', 'Lives Impacted', 'Cumulative Lives', 'Data Type'],
  [2019, 45000000, 850000, 850000, 'Historical'],
  [2020, 89000000, 1200000, 2050000, 'Historical'],
  [2021, 156000000, 2100000, 4150000, 'Historical'],
  [2022, 245000000, 3200000, 7350000, 'Historical'],
  [2023, 285000000, 3800000, 11150000, 'Historical'],
  [2024, 367500000, 4960000, 16110000, 'Historical'],
  [2025, 485000000, 6200000, 22310000, 'Projected'],
  [2026, 620000000, 7800000, 30110000, 'Projected']
];

const growthTrajectorySheet = XLSX.utils.aoa_to_sheet(growthTrajectoryData);
XLSX.utils.book_append_sheet(workbook, growthTrajectorySheet, 'Growth Trajectory');

// 3. Global Signals Data Sheet
const globalSignalsData = [
  ['Data Source', 'Description', 'API Endpoint', 'Update Frequency', 'Data Format', 'Current Status'],
  ['FAO Food Price Index', 'Measures global food commodity price changes. Index value where 2014-2016 average = 100', 'https://api.fao.org/faostat/v1/en/', 'Monthly', 'JSON', 'Live/Mock'],
  ['USD/EGP Exchange Rate', 'How many Egyptian Pounds needed to buy 1 US Dollar', 'https://api.exchangerate-api.com/v4/latest/USD', 'Daily', 'JSON', 'Live/Mock'],
  ['Cost of Healthy Diet', 'Daily cost for one person to afford the least expensive healthy diet in Egypt', 'Our World in Data API', 'Annual', 'CSV', 'Live/Mock'],
  ['Food Insecurity (FIES)', 'Percentage of Egypt\'s population experiencing moderate or severe food insecurity', 'Our World in Data API', 'Annual', 'CSV', 'Live/Mock'],
  ['Egypt Food CPI', 'Egypt Food Consumer Price Index data from IMF', 'IMF SDMX API', 'Monthly', 'JSON', 'Live/Mock'],
  ['CBE Inflation', 'Egypt Central Bank inflation data', 'CBE API', 'Monthly', 'JSON', 'Live/Mock'],
  ['ET₀ Rain Anomaly', 'Cairo weather data with precipitation anomaly', 'OpenMeteo API', 'Daily', 'JSON', 'Live/Mock'],
  ['Refugees in Egypt', 'Refugee population by country of asylum', 'Our World in Data API', 'Annual', 'CSV', 'Live/Mock'],
  ['CBE Food Inflation', 'Egypt Central Bank food inflation data', 'CBE API', 'Monthly', 'JSON', 'Live/Mock']
];

const globalSignalsSheet = XLSX.utils.aoa_to_sheet(globalSignalsData);
XLSX.utils.book_append_sheet(workbook, globalSignalsSheet, 'Global Signals');

// 4. Commodity Prices Data Sheet
const commodityPricesData = [
  ['Commodity', 'Current Price', 'Unit', 'Description', 'Data Source', 'Trend'],
  ['Wheat', 320, 'USD/MT', 'Wheat commodity price', 'World Bank Pink Sheet', 'Mock Data'],
  ['Vegetable Oils', 1180, 'USD/MT', 'Vegetable oils commodity price', 'World Bank Pink Sheet', 'Mock Data'],
  ['Sugar', 0.42, 'USD/kg', 'Sugar commodity price', 'World Bank Pink Sheet', 'Mock Data'],
  ['Fertilizers', 280, 'USD/MT', 'Fertilizers commodity price', 'World Bank Pink Sheet', 'Mock Data']
];

const commodityPricesSheet = XLSX.utils.aoa_to_sheet(commodityPricesData);
XLSX.utils.book_append_sheet(workbook, commodityPricesSheet, 'Commodity Prices');

// 5. API Endpoints Data Sheet
const apiEndpointsData = [
  ['API Endpoint', 'Method', 'Description', 'Parameters', 'Response Format', 'Status'],
  ['/api/commodities', 'GET', 'World Bank/IMF Commodity Prices API endpoint', 'symbol (wheat, veg_oils, sugar)', 'JSON', 'Implemented'],
  ['/api/cbe-inflation', 'GET', 'CBE Inflation data', 'None', 'JSON', 'Implemented'],
  ['/api/cbe-food-inflation', 'GET', 'CBE Food Inflation data', 'None', 'JSON', 'Implemented'],
  ['/api/diet-cost', 'GET', 'Cost of Healthy Diet data', 'None', 'JSON', 'Implemented'],
  ['/api/fies-egy', 'GET', 'Food Insecurity Experience Scale data for Egypt', 'None', 'JSON', 'Implemented'],
  ['/api/fx', 'GET', 'USD/EGP Exchange Rate data', 'None', 'JSON', 'Implemented'],
  ['/api/health', 'GET', 'Health metrics data', 'None', 'JSON', 'Implemented'],
  ['/api/imf-cpi', 'GET', 'IMF CPI data', 'None', 'JSON', 'Implemented'],
  ['/api/unhcr-egy', 'GET', 'UNHCR Egypt data', 'None', 'JSON', 'Implemented'],
  ['/api/wheat', 'GET', 'Wheat price data', 'None', 'JSON', 'Implemented'],
  ['/api/ffpi', 'GET', 'FAO Food Price Index data', 'None', 'JSON', 'Implemented']
];

const apiEndpointsSheet = XLSX.utils.aoa_to_sheet(apiEndpointsData);
XLSX.utils.book_append_sheet(workbook, apiEndpointsSheet, 'API Endpoints');

// 6. Data Sources Summary Sheet
const dataSourcesData = [
  ['Data Source', 'Type', 'Provider', 'Update Frequency', 'Access Method', 'Authentication'],
  ['Executive Metrics', 'Internal', 'EFB Database', 'Real-time', 'Direct Database', 'Internal'],
  ['FAO Food Price Index', 'External', 'Food and Agriculture Organization', 'Monthly', 'REST API', 'Public'],
  ['IMF CPI Data', 'External', 'International Monetary Fund', 'Monthly', 'REST API', 'Public'],
  ['CBE Inflation', 'External', 'Central Bank of Egypt', 'Monthly', 'REST API', 'Public'],
  ['Exchange Rates', 'External', 'ExchangeRate-API', 'Daily', 'REST API', 'Public'],
  ['Weather Data', 'External', 'OpenMeteo', 'Daily', 'REST API', 'Public'],
  ['Refugee Data', 'External', 'UNHCR via Our World in Data', 'Annual', 'CSV Download', 'Public'],
  ['Commodity Prices', 'External', 'World Bank', 'Monthly', 'REST API', 'Public'],
  ['Cost of Healthy Diet', 'External', 'Our World in Data', 'Annual', 'CSV Download', 'Public'],
  ['Food Insecurity', 'External', 'Our World in Data', 'Annual', 'CSV Download', 'Public']
];

const dataSourcesSheet = XLSX.utils.aoa_to_sheet(dataSourcesData);
XLSX.utils.book_append_sheet(workbook, dataSourcesSheet, 'Data Sources');

// 7. Backend Integration Requirements Sheet
const backendRequirementsData = [
  ['Component', 'Current Status', 'Required Backend Integration', 'Priority', 'Complexity', 'Estimated Effort'],
  ['Executive Metrics', 'Static Data', 'Database connection for real-time metrics', 'High', 'Medium', '2-3 weeks'],
  ['Growth Trajectory', 'Static Data', 'Database connection for historical data', 'High', 'Medium', '2-3 weeks'],
  ['Global Signals', 'Mixed Live/Mock', 'API proxy endpoints for all data sources', 'High', 'High', '4-6 weeks'],
  ['Commodity Prices', 'Mock Data', 'World Bank API integration', 'Medium', 'Medium', '2-3 weeks'],
  ['Financial Analytics', 'Static Data', 'Database connection for financial data', 'High', 'High', '4-5 weeks'],
  ['Operational Analytics', 'Static Data', 'Database connection for operational data', 'High', 'High', '4-5 weeks'],
  ['Programs Analytics', 'Static Data', 'Database connection for program data', 'High', 'High', '4-5 weeks'],
  ['Stakeholder Analytics', 'Static Data', 'Database connection for stakeholder data', 'Medium', 'Medium', '2-3 weeks'],
  ['Scenario Analysis', 'Static Data', 'Database connection for scenario modeling', 'Medium', 'High', '3-4 weeks']
];

const backendRequirementsSheet = XLSX.utils.aoa_to_sheet(backendRequirementsData);
XLSX.utils.book_append_sheet(workbook, backendRequirementsSheet, 'Backend Integration');

// 8. Mock Data Examples Sheet
const mockDataExamples = [
  ['Data Source', 'Sample Data Point 1', 'Sample Data Point 2', 'Sample Data Point 3', 'Sample Data Point 4', 'Sample Data Point 5'],
  ['FAO Food Price Index', '{"date": "2023-01", "value": 125.4}', '{"date": "2023-02", "value": 126.1}', '{"date": "2023-03", "value": 127.2}', '{"date": "2023-04", "value": 126.8}', '{"date": "2023-05", "value": 128.3}'],
  ['USD/EGP Exchange Rate', '{"date": "2023-01", "value": 30.85}', '{"date": "2023-02", "value": 30.92}', '{"date": "2023-03", "value": 31.05}', '{"date": "2023-04", "value": 31.12}', '{"date": "2023-05", "value": 31.28}'],
  ['Cost of Healthy Diet', '{"date": "2020", "value": 3.25}', '{"date": "2021", "value": 3.42}', '{"date": "2022", "value": 3.68}', '{"date": "2023", "value": 3.91}', '{"date": "2024", "value": 4.15}'],
  ['Food Insecurity (FIES)', '{"date": "2020", "value": 28.5}', '{"date": "2021", "value": 29.2}', '{"date": "2022", "value": 31.8}', '{"date": "2023", "value": 33.5}', '{"date": "2024", "value": 35.2}'],
  ['Egypt Food CPI', '{"date": "2023-01", "value": 145.2}', '{"date": "2023-02", "value": 146.8}', '{"date": "2023-03", "value": 148.5}', '{"date": "2023-04", "value": 149.2}', '{"date": "2023-05", "value": 150.8}'],
  ['CBE Inflation', '{"date": "2023-01", "value": 31.2}', '{"date": "2023-02", "value": 31.5}', '{"date": "2023-03", "value": 32.1}', '{"date": "2023-04", "value": 32.8}', '{"date": "2023-05", "value": 33.2}'],
  ['ET₀ Rain Anomaly', '{"date": "2023-05-01", "value": -2.5}', '{"date": "2023-05-02", "value": 0.8}', '{"date": "2023-05-03", "value": 1.2}', '{"date": "2023-05-04", "value": -0.5}', '{"date": "2023-05-05", "value": 0.3}'],
  ['Refugees in Egypt', '{"date": "2015", "value": 245000}', '{"date": "2016", "value": 252000}', '{"date": "2017", "value": 265000}', '{"date": "2018", "value": 278000}', '{"date": "2019", "value": 290000}'],
  ['CBE Food Inflation', '{"date": "2023-01", "value": 45.2}', '{"date": "2023-02", "value": 46.8}', '{"date": "2023-03", "value": 48.5}', '{"date": "2023-04", "value": 49.2}', '{"date": "2023-05", "value": 50.8}']
];

const mockDataSheet = XLSX.utils.aoa_to_sheet(mockDataExamples);
XLSX.utils.book_append_sheet(workbook, mockDataSheet, 'Mock Data Examples');

// Save the workbook
const outputPath = path.join(__dirname, 'EFB_Dashboard_Data_Export.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`Excel file created successfully at: ${outputPath}`);
console.log(`File contains 8 sheets with comprehensive data from the dashboard`);
