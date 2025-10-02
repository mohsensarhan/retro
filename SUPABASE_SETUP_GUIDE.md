# EFB Dashboard Supabase Integration Setup Guide

## Overview
This guide will help you set up the complete Supabase integration for the EFB Dashboard, including CSV import functionality, real-time updates, and admin interface.

## Prerequisites
- Supabase account and project
- Node.js and npm installed
- Your CSV data file

## Step 1: Supabase Database Setup

### 1.1 Create Database Schema
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-simple-schema.sql`
4. Click "Run" to execute the SQL

This will create:
- `dashboard_metrics` table for storing all dashboard data
- `csv_uploads` table for tracking file uploads
- `data_changes` table for audit trail
- Necessary indexes and triggers
- Sample data for testing

### 1.2 Get Your API Keys
1. In your Supabase project, go to Settings → API
2. Copy the following:
   - Project URL: `https://your-project.supabase.co`
   - Anon public key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.3 Configure Environment Variables
Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 2: Import Your CSV Data

### Option A: Using the Setup Script
1. Update the CSV path in `setup-supabase-simple.cjs` (line 85)
2. Run: `node setup-supabase-simple.cjs`

### Option B: Using the Admin Interface (Recommended)
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5173/admin`
3. Upload your CSV file using the drag-and-drop interface
4. Monitor the upload progress and verify the data

## Step 3: Verify the Integration

### 3.1 Check Database
In Supabase SQL Editor, run:
```sql
SELECT COUNT(*) FROM dashboard_metrics;
SELECT section, category, field, value FROM dashboard_metrics LIMIT 10;
```

### 3.2 Test the Dashboard
1. Navigate to `http://localhost:5173/dashboard`
2. Verify that data loads from Supabase instead of hardcoded values
3. Check that real-time updates work (try updating data in Supabase)

## Step 4: Admin Interface Features

Access the admin interface at `/admin` to:

### CSV Upload & Management
- **Drag & Drop Upload**: Upload new CSV files
- **Progress Tracking**: Monitor upload status and errors
- **Upload History**: View previous uploads and their status

### Data Management
- **View All Metrics**: Browse all dashboard data
- **Search & Filter**: Find specific metrics quickly
- **Edit Records**: Modify individual data points
- **Delete Records**: Remove outdated metrics

### Activity Monitoring
- **Change Log**: Track all data modifications
- **Upload History**: Monitor file processing
- **System Status**: Check database and real-time connection status

## Step 5: Dashboard Integration

The dashboard now automatically:
- **Loads data from Supabase** instead of hardcoded values
- **Updates in real-time** when data changes
- **Falls back gracefully** to static data if Supabase is unavailable
- **Maintains all existing UI/UX** while using live data

### Affected Components
- `ExecutiveDashboard.tsx` - Main dashboard with live metrics
- `FinancialHealthGrid.tsx` - Financial analytics
- `OperationalAnalytics.tsx` - Operational metrics
- `StakeholderAnalytics.tsx` - Stakeholder data
- `ProgramsAnalytics.tsx` - Program effectiveness

## Architecture Overview

```
CSV File → Admin Upload → Supabase Database → Real-time Updates → Dashboard UI
                ↓
        Change Detection & Smart Updates
                ↓
        Audit Trail & History Tracking
```

### Key Features
1. **Smart Updates**: Only changed fields are updated
2. **Real-time Sync**: Instant dashboard updates via WebSocket
3. **Schema Flexibility**: Database adapts to dashboard changes
4. **Audit Trail**: Complete change history
5. **Error Handling**: Graceful fallbacks and error reporting

## Future SAP Integration

The architecture is designed for easy transition to SAP APIs:

1. **Generic Data Layer**: `useDashboardData` hooks abstract data source
2. **Transformation Layer**: `DataTransformer` handles format conversion
3. **API Framework**: Ready for SAP connector integration
4. **Migration Tools**: Seamless transition from CSV to API

## Troubleshooting

### Common Issues

**1. "Table not found" errors**
- Ensure you've run the SQL schema in Supabase
- Check that RLS policies are correctly set

**2. "Authentication failed"**
- Verify your API keys in the `.env` file
- Ensure the anon key has correct permissions

**3. CSV upload fails**
- Check CSV format matches expected structure
- Verify file size limits in Supabase
- Check browser console for detailed errors

**4. Real-time updates not working**
- Ensure WebSocket connections are allowed
- Check Supabase project settings for real-time enabled
- Verify network/firewall settings

### Debug Mode
Enable debug logging by adding to your `.env`:
```env
VITE_DEBUG=true
```

## Security Considerations

### Current Setup (Development)
- Public access to all tables for testing
- No authentication required
- Suitable for development/demo environments

### Production Recommendations
1. **Enable Authentication**: Implement user login system
2. **Row Level Security**: Restrict access based on user roles
3. **API Rate Limiting**: Prevent abuse of upload endpoints
4. **Data Validation**: Server-side validation of all inputs
5. **Audit Logging**: Enhanced tracking of all changes

## Performance Optimization

### Current Optimizations
- Indexed database queries
- Batch CSV processing
- Real-time subscription management
- Query result caching

### Scaling Considerations
- Database connection pooling
- CDN for static assets
- Background job processing for large uploads
- Database partitioning for large datasets

## Support

For issues or questions:
1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Verify CSV format matches expected structure
4. Test with sample data first

## Next Steps

1. **Test with your CSV data**
2. **Configure production environment variables**
3. **Set up proper authentication and security**
4. **Plan SAP API integration timeline**
5. **Train users on admin interface**

