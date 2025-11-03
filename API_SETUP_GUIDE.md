# 🔐 Teamflect API Setup Guide

## Current Status
❌ **API Returns: 403 Access Denied**

This means your API key needs to be activated or enabled in the Teamflect admin panel.

## How to Enable Teamflect API Access

### Step 1: Log into Teamflect Admin Center
1. Go to https://admin.teamflect.com
2. Log in with your admin credentials

### Step 2: Navigate to API Settings
1. Look for **"API Keys"** or **"Integrations"** in the sidebar
2. Click on **"API Keys"** section

### Step 3: Generate/Activate Your API Key
1. Find your existing API key: `4d73e4a8ce78:67cd7212-b035-4b25-a12b-26c840df469f`
2. Check if it needs to be **activated** or **enabled**
3. Verify the key has permissions for:
   - ✅ Goals (Read/Write)
   - ✅ Tasks (Read/Write)
   - ✅ Feedback (Read/Write)
   - ✅ Recognitions (Read/Write)
   - ✅ Users (Read)
   - ✅ Reviews (Read)

### Step 4: Verify API Access
After enabling the API key, test it with:

```bash
curl -X GET "https://api.teamflect.com/goal/getGoals?limit=5" \
  -H "x-api-key: 4d73e4a8ce78:67cd7212-b035-4b25-a12b-26c840df469f" \
  -H "Content-Type: application/json"
```

If successful, you should see JSON data instead of "Access denied".

## Alternative: Generate New API Key

If the current key doesn't work:

1. In Teamflect Admin → API Keys
2. Click **"Generate New API Key"**
3. Copy the new key
4. Update it in `src/api/teamflect.ts`:

```typescript
const API_KEY = 'your-new-api-key-here';
```

## Testing the Dashboard with Mock Data

While you set up the API, the dashboard includes **comprehensive mock data** that matches Teamflect's exact structure:

### Run the Dashboard with Mock Data
```bash
npm run dev
```

The dashboard will display:
- ✅ 6 Sample Goals (with progress, statuses, owners)
- ✅ 6 Sample Tasks (with priorities, assignments)
- ✅ 4 Sample Feedback items
- ✅ 4 Sample Recognitions
- ✅ 5 Sample Users
- ✅ 2 Sample Reviews

This lets you:
1. **Verify all UI components work correctly**
2. **Test CRUD operations**
3. **See exactly what data structure is expected**
4. **Demo the dashboard to stakeholders**

### Switch to Real API Data

Once your API key is enabled:

1. The dashboard automatically uses real data
2. No code changes needed
3. All CRUD operations work with real Teamflect data

## Expected API Response Format

### Goals Response
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "createdBy": {
      "oid": "uuid",
      "displayName": "string",
      "userPrincipalName": "email"
    },
    "startDate": "2025-01-01",
    "dueDate": "2025-03-31",
    "owners": [...],
    "status": "on-track" | "at-risk" | "off-track" | "completed",
    "progress": 65,
    "labels": ["string"]
  }
]
```

### Tasks Response
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "assignedTo": [...],
    "dueDate": "2025-11-05",
    "status": "todo" | "in-progress" | "completed",
    "priority": "low" | "medium" | "high",
    "createdBy": {...},
    "createdAt": "2025-11-01"
  }
]
```

## Need Help?

1. **Check Teamflect Documentation**: https://help.teamflect.com/en/articles/8912255-using-api-in-teamflect-a-guideline
2. **Contact Teamflect Support**: support@teamflect.com
3. **Check API Status**: Ensure your Teamflect plan includes API access

## Quick Troubleshooting

### Problem: 403 Access Denied
**Solution**: Enable API key in admin panel

### Problem: API key not found
**Solution**: Generate new key in admin panel

### Problem: Missing permissions
**Solution**: Enable all endpoints in API key settings

### Problem: Rate limiting
**Solution**: Check your plan's API rate limits

---

**Once API is enabled, the dashboard will automatically fetch real Teamflect data!** 🚀
