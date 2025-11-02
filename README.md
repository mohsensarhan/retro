# Egyptian Food Bank - Executive Command Center

> A world-class CEO-centric executive dashboard powered by Teamflect API

## 🎯 Overview

This is a premium, McKinsey-style executive dashboard designed specifically for the CEO of the Egyptian Food Bank. Built with modern React, TypeScript, and cutting-edge UI/UX principles, this command center provides complete organizational visibility and control in a single, fixed viewport.

## ✨ Features

### CEO-Centric Design
- **Single Viewport Experience**: Everything accessible without scrolling, optimized for executive efficiency
- **Real-time Organization Pulse**: Live KPIs showing active tasks, completion rates, urgent items, and goal progress
- **Leadership Team Overview**: Visual cards for all directors with their active workload and performance
- **Priority Task Management**: Intelligent task prioritization with urgency indicators and assignment tracking
- **Strategic Goal Tracking**: Visual progress indicators for company, team, and individual goals

### Modern Tech Stack
- **React 18.3** with TypeScript for type-safe development
- **Vite** for lightning-fast development and builds
- **Framer Motion** for smooth, professional animations
- **Tailwind CSS** for modern, responsive styling
- **Zustand** for efficient state management
- **Radix UI** for accessible, production-ready components
- **Recharts** for beautiful data visualizations

### Teamflect Integration
- Complete API integration layer with auth handling
- Support for Users, Tasks, Goals, Recognitions, and Feedback
- Mock data mode for development and testing
- Real-time data synchronization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun runtime
- Teamflect API credentials

### Installation

```bash
# Install dependencies
npm install

# Or use Bun for faster installation
bun install
```

### Development

```bash
# Start development server
npm run dev

# Or with Bun
bun run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### Teamflect API Setup

1. Obtain your API credentials from Teamflect admin panel
2. Open `src/lib/teamflect-api.ts`
3. Update the `API_CREDENTIALS` constant with your credentials:

```typescript
const API_CREDENTIALS = 'your-tenant-id:your-api-key'
```

### Mock Data Mode

The dashboard includes comprehensive mock data for development and testing. To toggle between mock and live data:

- Mock data is enabled by default
- Toggle via the `useMockData` state in the dashboard store
- All mock data is defined in `src/lib/teamflect-api.ts`

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # Base UI components (shadcn/ui)
│   ├── ExecutiveCommandCenter.tsx  # Main dashboard
│   ├── StatCard.tsx          # KPI metric cards
│   ├── TaskCard.tsx          # Task display cards
│   ├── DirectorCard.tsx      # Director profile cards
│   └── GoalCard.tsx          # Goal tracking cards
├── lib/
│   ├── teamflect-api.ts      # Teamflect API integration
│   └── utils.ts              # Utility functions
├── store/
│   └── dashboard-store.ts    # Zustand state management
├── App.tsx                   # Root component
├── main.tsx                  # Entry point
└── index.css                 # Global styles
```

## 🎨 Design Philosophy

### Executive-First UX
- **Minimal Cognitive Load**: Information hierarchy optimized for quick decision-making
- **Actionable Insights**: Every metric leads to actionable intelligence
- **Visual Clarity**: Clean, uncluttered interface with purposeful whitespace
- **Responsive Design**: Seamless experience across all screen sizes

### Performance
- **Optimized Rendering**: Efficient React patterns with minimal re-renders
- **Lazy Loading**: Code-splitting for faster initial load
- **Smooth Animations**: 60fps animations using Framer Motion
- **Fast Builds**: Vite + SWC for instant HMR

## 🔐 Security

- API credentials never exposed to client
- Secure authentication handling
- Environment variables for sensitive data
- No hardcoded secrets in repository

## 📊 Key Metrics Tracked

- **Active Tasks**: Real-time count of in-progress work items
- **Completion Rate**: Tasks completed this month with trend
- **Urgent Items**: High-priority tasks requiring immediate attention
- **Goal Progress**: Average progress across all organizational goals
- **Team Performance**: Individual director workload and achievements
- **Strategic Alignment**: Company, team, and individual goal tracking

## 🤝 Contributing

This is a custom executive dashboard for the Egyptian Food Bank. For internal team contributions:

1. Create a feature branch
2. Make your changes with clear commit messages
3. Test thoroughly in both mock and live data modes
4. Submit a pull request for review

## 📝 License

Proprietary - Egyptian Food Bank Internal Use Only

## 🆘 Support

For technical support or feature requests:
- Internal: Contact the development team
- Teamflect API issues: support@teamflect.com

---

**Built with precision and care for executive excellence** 🎯
