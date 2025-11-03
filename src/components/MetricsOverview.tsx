import { motion } from 'framer-motion';
import { Target, CheckSquare, Users, Award, MessageSquare } from 'lucide-react';
import type { DashboardMetrics, Goal } from '@/types/teamflect';
import { MetricCard } from './MetricCard';
import { ProgressRing } from './ProgressRing';
import { GoalsChart } from './GoalsChart';

interface MetricsOverviewProps {
  metrics: DashboardMetrics;
  goals?: Goal[];
}

export function MetricsOverview({ metrics, goals }: MetricsOverviewProps) {
  const completionRate = metrics.totalGoals > 0
    ? (metrics.completedGoals / metrics.totalGoals) * 100
    : 0;

  const taskCompletionRate = metrics.totalTasks > 0
    ? (metrics.completedTasks / metrics.totalTasks) * 100
    : 0;

  const goalsHealthScore = metrics.totalGoals > 0
    ? ((metrics.goalsOnTrack * 100 + metrics.goalsAtRisk * 50) / metrics.totalGoals)
    : 100;

  return (
    <div className="space-y-8">
      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MetricCard
            title="Active Goals"
            value={metrics.activeGoals}
            total={metrics.totalGoals}
            icon={Target}
            color="blue"
            trend={completionRate > 50 ? 'up' : 'down'}
            trendValue={`${completionRate.toFixed(0)}% completed`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MetricCard
            title="Tasks in Progress"
            value={metrics.totalTasks - metrics.completedTasks}
            total={metrics.totalTasks}
            icon={CheckSquare}
            color="purple"
            trend={taskCompletionRate > 60 ? 'up' : 'down'}
            trendValue={`${taskCompletionRate.toFixed(0)}% done`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MetricCard
            title="Team Members"
            value={metrics.teamSize}
            icon={Users}
            color="green"
            trendValue="Active workforce"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MetricCard
            title="Recognitions"
            value={metrics.recognitionCount}
            icon={Award}
            color="amber"
            trendValue={`${metrics.feedbackCount} feedback`}
          />
        </motion.div>
      </div>

      {/* Health Dashboard */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* Goals Health */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Goals Health</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              goalsHealthScore > 75 ? 'bg-green-100 text-green-700' :
              goalsHealthScore > 50 ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {goalsHealthScore.toFixed(0)}%
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <ProgressRing
              progress={goalsHealthScore}
              size={140}
              strokeWidth={12}
              color={goalsHealthScore > 75 ? '#10b981' : goalsHealthScore > 50 ? '#f59e0b' : '#ef4444'}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-slate-600">On Track</span>
              </div>
              <span className="text-sm font-semibold">{metrics.goalsOnTrack}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm text-slate-600">At Risk</span>
              </div>
              <span className="text-sm font-semibold">{metrics.goalsAtRisk}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-slate-600">Off Track</span>
              </div>
              <span className="text-sm font-semibold">{metrics.goalsOffTrack}</span>
            </div>
          </div>
        </div>

        {/* Task Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Task Progress</h3>
            <CheckSquare className="w-5 h-5 text-purple-600" />
          </div>

          <div className="flex items-center justify-center mb-6">
            <ProgressRing
              progress={taskCompletionRate}
              size={140}
              strokeWidth={12}
              color="#8b5cf6"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Completed</span>
              <span className="text-sm font-semibold text-green-600">{metrics.completedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">In Progress</span>
              <span className="text-sm font-semibold text-blue-600">
                {metrics.totalTasks - metrics.completedTasks - metrics.overdueTasks}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Overdue</span>
              <span className="text-sm font-semibold text-red-600">{metrics.overdueTasks}</span>
            </div>
          </div>
        </div>

        {/* Team Engagement */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Team Engagement</h3>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Feedback Activity</span>
                <span className="text-2xl font-bold text-blue-600">{metrics.feedbackCount}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((metrics.feedbackCount / metrics.teamSize) * 20, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Recognitions</span>
                <span className="text-2xl font-bold text-amber-600">{metrics.recognitionCount}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((metrics.recognitionCount / metrics.teamSize) * 20, 100)}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{metrics.teamSize}</div>
                <div className="text-sm text-slate-500">Active Team Members</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Goals Chart */}
      {goals && goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GoalsChart goals={goals} />
        </motion.div>
      )}
    </div>
  );
}
