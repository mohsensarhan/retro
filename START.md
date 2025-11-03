# Quick Start Guide

## 🚀 Start the Dashboard

### Option 1: Start Everything (Recommended)
```bash
npm run dev:all
```
This starts:
- Backend tRPC server on `http://localhost:3001`
- Frontend React app on `http://localhost:5173`

### Option 2: Start Separately
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev
```

## 🌐 Access the Dashboard

Open your browser to:
```
http://localhost:5173
```

## 📊 Current State

The dashboard is **fully functional** with mock data:
- ✅ CEO Metrics Overview
- ✅ Goals & OKRs Management (Create, Delete)
- ✅ Tasks with Filters (Toggle Complete)
- ✅ Feedback Panel
- ✅ Recognitions Panel
- ✅ Smooth Animations
- ✅ Mobile Responsive

## 🔧 Troubleshooting

### Backend won't start?
```bash
# Check if port 3001 is in use
lsof -ti:3001 | xargs kill -9

# Reinstall dependencies
npm install
```

### Frontend won't start?
```bash
# Check if port 5173 is in use
lsof -ti:5173 | xargs kill -9
```

### API Not Working?

The dashboard currently uses mock data due to network restrictions. To test with real Teamflect API:

1. **Verify API access**:
   ```bash
   node verify-api-access.js
   ```

2. **If API works**, disable mock fallback in `server/teamflect.ts`:
   ```typescript
   const USE_MOCK_FALLBACK = false;
   ```

3. **Restart backend**:
   ```bash
   npm run dev:server
   ```

## 📁 Project Structure

```
retro/
├── src/                  # Frontend React app
│   ├── components/       # Dashboard panels
│   ├── hooks/           # tRPC hooks
│   ├── lib/             # Utils, tRPC client, mock data
│   └── types/           # TypeScript types
├── server/              # Backend tRPC server
│   ├── index.ts         # Express server
│   ├── router.ts        # tRPC procedures
│   ├── teamflect.ts     # API client
│   └── context.ts       # tRPC context
└── docs/
    ├── BACKEND_ARCHITECTURE.md
    ├── API_STATUS.md
    └── E2E_TEST_RESULTS.md
```

## 🎯 Key Features

- **Type-Safe**: Full TypeScript + tRPC type safety
- **Real-Time Updates**: React Query auto-refetch
- **Resilient**: Auto-fallback to mock data
- **CEO-Centric**: High-level KPIs and drill-downs
- **Responsive**: Mobile and desktop optimized
- **Animated**: Smooth Framer Motion transitions

## 📝 Next Steps

1. ✅ Dashboard is working perfectly
2. 🔄 Resolve network/container API access
3. 🚀 Switch to real Teamflect data
4. 🎨 Customize branding/colors if needed
5. 📱 Test on actual mobile devices

Enjoy your CEO Dashboard! 🎉
