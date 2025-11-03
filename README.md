# Teamflect CEO Dashboard

A stunning, modern, CEO-centric dashboard built with React, TypeScript, and the Teamflect API. Features full CRUD operations, beautiful animations, and responsive design.

## Features

✨ **CEO-Centric Design**
- High-level KPIs and metrics at a glance
- Beautiful data visualizations
- Single viewport layout
- No clutter, just insights

🎨 **Beautiful UI/UX**
- Smooth animations with Framer Motion
- Responsive design (desktop & mobile)
- Tooltips and contextual help
- Modern gradient aesthetics

🔧 **Full CRUD Operations**
- Goals & OKRs management
- Tasks tracking
- Feedback system
- Recognitions
- User management

📊 **Real-time Data**
- Live metrics from Teamflect API
- Instant updates
- Performance tracking
- Team engagement analytics

## Tech Stack

### Frontend
- **Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Data Fetching**: TanStack Query + tRPC Client
- **Build Tool**: Vite
- **Icons**: Lucide React

### Backend
- **Server**: Express + TypeScript
- **API Layer**: tRPC (type-safe RPC)
- **HTTP Client**: axios
- **Runtime**: Node.js with tsx

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Teamflect API access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd retro
```

2. Install dependencies:
```bash
npm install
```

3. Start both frontend and backend:
```bash
npm run dev:all
```

Or start them separately:
```bash
# Terminal 1 - Backend Server
npm run dev:server

# Terminal 2 - Frontend
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) for frontend
5. Backend tRPC server runs on [http://localhost:3001](http://localhost:3001)

### Configuration

API credentials are configured in `server/teamflect.ts`. The backend automatically falls back to mock data if the API returns 403.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── api/
│   └── teamflect.ts          # Teamflect API client
├── components/
│   ├── Dashboard.tsx          # Main dashboard container
│   ├── MetricsOverview.tsx    # CEO KPIs & metrics
│   ├── GoalsPanel.tsx         # Goals & OKRs management
│   ├── TasksPanel.tsx         # Tasks tracking
│   ├── FeedbackPanel.tsx      # Feedback system
│   ├── RecognitionsPanel.tsx  # Team recognitions
│   ├── MetricCard.tsx         # Reusable metric card
│   ├── ProgressRing.tsx       # Circular progress indicator
│   └── GoalsChart.tsx         # Goals visualization
├── hooks/
│   └── useTeamflect.ts        # React Query hooks
├── types/
│   └── teamflect.ts           # TypeScript types
├── lib/
│   └── utils.ts               # Utility functions
└── styles/
    └── index.css              # Global styles

## Teamflect API Integration

This dashboard integrates with the following Teamflect API endpoints:

- `/goal/getGoals` - Fetch goals with filters
- `/goal/createNewGoal` - Create new goals
- `/goal/updateProgress` - Update goal progress
- `/task` - Manage tasks
- `/feedback/sendFeedbackRequest` - Send feedback
- `/recognition/createNewRecognitions` - Create recognitions
- `/user` - User management
- `/review` - Performance reviews

## Features Overview

### Overview Dashboard
- Total goals, tasks, team size
- Goals health score
- Task completion rate
- Team engagement metrics
- Upcoming deadlines

### Goals & OKRs
- Create, read, delete goals
- Track progress visually
- Filter by status
- Owner management
- Due date tracking

### Tasks
- Filter by status (all, todo, in-progress, completed)
- Toggle task completion
- Priority indicators
- Due date tracking

### Feedback
- View all feedback
- Filter by type (praise, constructive, request)
- Beautiful card layout
- Sender/recipient tracking

### Recognitions
- Team appreciation system
- Like functionality
- Beautiful gradient design
- Engagement tracking

## Contributing

This is a private project. For questions or contributions, please contact the project owner.

## License

Private - All Rights Reserved

---

Built with ❤️ for CEOs who demand excellence
```
