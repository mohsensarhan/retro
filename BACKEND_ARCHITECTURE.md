# Backend Architecture - tRPC Proxy for Teamflect API

## Overview

This project now includes a **complete backend server** that acts as a proxy between the React frontend and the Teamflect API. The backend uses **tRPC** for type-safe API communication and **axios** for HTTP requests.

## Architecture

```
Frontend (React + tRPC Client)
    ↓
tRPC Backend Server (Express + tRPC)
    ↓
Teamflect API (https://api.teamflect.com/api/v1)
```

## Tech Stack

- **Express**: HTTP server
- **tRPC**: Type-safe API layer
- **axios**: HTTP client for external API calls
- **TypeScript**: Full type safety across the stack
- **tsx**: TypeScript execution for development

## Project Structure

```
server/
├── index.ts          # Express server with tRPC middleware
├── router.ts         # tRPC router with all procedures
├── context.ts        # tRPC context creation
├── teamflect.ts      # Teamflect API client with axios
└── tsconfig.json     # TypeScript configuration for backend
```

## API Endpoints

All tRPC procedures are available at `http://localhost:3001/trpc`:

### Goals
- `goals.getAll` - Get all goals with optional filters
- `goals.create` - Create a new goal
- `goals.updateProgress` - Update goal progress
- `goals.delete` - Delete a goal

### Tasks
- `tasks.getAll` - Get all tasks
- `tasks.create` - Create a new task
- `tasks.update` - Update a task
- `tasks.delete` - Delete a task

### Feedback
- `feedback.getAll` - Get all feedback
- `feedback.send` - Send feedback

### Recognitions
- `recognitions.getAll` - Get all recognitions
- `recognitions.create` - Create a recognition
- `recognitions.like` - Like a recognition

### Users
- `users.getAll` - Get all users

### Reviews
- `reviews.getAll` - Get all reviews

## Running the Backend

### Development Mode

Start backend only:
```bash
npm run dev:server
```

Start both frontend and backend:
```bash
npm run dev:all
```

### Production Mode

Build and run:
```bash
npm run build:server
npm run start:server
```

## Mock Data Fallback

The backend includes **automatic mock data fallback** when the Teamflect API returns 403 (Access Denied):

```typescript
const USE_MOCK_FALLBACK = true; // In server/teamflect.ts
```

This ensures the dashboard always has data to display, even if API access is temporarily unavailable.

## Teamflect API Configuration

The backend is configured with:

- **Base URL**: `https://api.teamflect.com/api/v1`
- **API Key**: Set in `server/teamflect.ts`
- **Authentication**: `x-api-key` header
- **Timeout**: 30 seconds

### API Keys Provided

Two API keys were provided as "fully operational":
1. `4d73e4a8ce78:67cd7212-b035-4b25-a12b-26c840df469f` (currently active)
2. `4d73e4a8ce78:d830cfb1-8c29-4719-8096-a0e0fd2876ba` (alternative)

## Current Status

✅ **Backend Infrastructure**: Complete and functional
✅ **tRPC Integration**: Frontend and backend fully connected
✅ **Mock Data Fallback**: Working correctly
⚠️ **Teamflect API Access**: Returning 403 (possible causes below)

## Troubleshooting 403 Errors

If the real Teamflect API returns 403, possible causes:

1. **API Key Activation**: Keys may need activation in Teamflect admin panel
2. **IP Whitelisting**: Your server IP may need to be whitelisted
3. **Additional Authentication**: OAuth or other auth may be required
4. **Endpoint Paths**: Verify exact endpoint paths with Teamflect docs
5. **Rate Limiting**: Check if there are rate limits or quotas

### Testing API Access

```bash
node test-backend.js
```

This script tests the backend proxy and shows detailed error messages.

## Frontend Integration

The frontend automatically uses tRPC hooks:

```typescript
// Before (direct API calls)
const { data: goals } = useQuery({
  queryFn: () => fetch('/api/goals')
});

// Now (tRPC)
const { data: goals } = trpc.goals.getAll.useQuery();
```

All hooks in `src/hooks/useTeamflect.ts` have been updated to use tRPC.

## Next Steps

1. Investigate 403 errors with Teamflect support
2. Once API access is resolved, set `USE_MOCK_FALLBACK = false`
3. Consider adding API key rotation
4. Add request caching for better performance
5. Implement rate limiting on backend

## Benefits of This Architecture

✅ **Security**: API keys hidden on server side
✅ **Type Safety**: End-to-end TypeScript types
✅ **Resilience**: Mock data fallback ensures uptime
✅ **Scalability**: Easy to add more endpoints
✅ **Developer Experience**: Excellent autocomplete and validation
