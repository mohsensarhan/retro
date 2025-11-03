import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  MessageSquare,
  Award,
  TrendingUp,
  ChevronRight,
  X
} from 'lucide-react';
import { useGoals, useTasks, useFeedback, useRecognitions, useUsers } from '@/hooks/useTeamflect';
import { MetricsOverview } from './MetricsOverview';
import { GoalsPanel } from './GoalsPanel';
import { TasksPanel } from './TasksPanel';
import { FeedbackPanel } from './FeedbackPanel';
import { RecognitionsPanel } from './RecognitionsPanel';
import { cn } from '@/lib/utils';

type ViewType = 'overview' | 'goals' | 'tasks' | 'feedback' | 'recognitions';

const navigation = [
  { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
  { id: 'goals' as const, label: 'Goals & OKRs', icon: Target },
  { id: 'tasks' as const, label: 'Tasks', icon: CheckSquare },
  { id: 'feedback' as const, label: 'Feedback', icon: MessageSquare },
  { id: 'recognitions' as const, label: 'Recognitions', icon: Award },
];

export function Dashboard() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch all data
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: feedback, isLoading: feedbackLoading } = useFeedback();
  const { data: recognitions, isLoading: recognitionsLoading } = useRecognitions();
  const { data: users, isLoading: usersLoading } = useUsers();

  const isLoading = goalsLoading || tasksLoading || feedbackLoading || recognitionsLoading || usersLoading;

  const metrics = {
    totalGoals: goals?.length || 0,
    activeGoals: goals?.filter(g => g.status !== 'completed').length || 0,
    completedGoals: goals?.filter(g => g.status === 'completed').length || 0,
    goalsOnTrack: goals?.filter(g => g.status === 'on-track').length || 0,
    goalsAtRisk: goals?.filter(g => g.status === 'at-risk').length || 0,
    goalsOffTrack: goals?.filter(g => g.status === 'off-track').length || 0,
    totalTasks: tasks?.length || 0,
    completedTasks: tasks?.filter(t => t.status === 'completed').length || 0,
    overdueTasks: tasks?.filter(t => {
      const dueDate = new Date(t.dueDate);
      return dueDate < new Date() && t.status !== 'completed';
    }).length || 0,
    teamSize: users?.length || 0,
    averageProgress: (goals && goals.length > 0) ? goals.reduce((acc, g) => acc + (g.progress || 0), 0) / goals.length : 0,
    feedbackCount: feedback?.length || 0,
    recognitionCount: recognitions?.length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <motion.header
        className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Teamflect CEO
                </h1>
                <p className="text-sm text-slate-500">Executive Command Center</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    currentView === item.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <ChevronRight className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden bg-white border-t border-slate-200"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 py-2 space-y-1">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      currentView === item.id
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content - Single Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <motion.div
                  className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            ) : (
              <>
                {currentView === 'overview' && <MetricsOverview metrics={metrics} goals={goals} />}
                {currentView === 'goals' && <GoalsPanel goals={goals || []} />}
                {currentView === 'tasks' && <TasksPanel tasks={tasks || []} />}
                {currentView === 'feedback' && <FeedbackPanel feedback={feedback || []} />}
                {currentView === 'recognitions' && <RecognitionsPanel recognitions={recognitions || []} />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
