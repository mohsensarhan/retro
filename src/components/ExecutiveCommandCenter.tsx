import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Target,
  CheckCircle2,
  AlertCircle,
  Plus,
  Activity,
} from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard-store'
import { StatCard } from './StatCard'
import { TaskCard } from './TaskCard'
import { DirectorCard } from './DirectorCard'
import { GoalCard } from './GoalCard'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { getInitials } from '@/lib/utils'

export function ExecutiveCommandCenter() {
  const {
    users,
    tasks,
    goals,
    fetchAllData,
    isLoading,
  } = useDashboardStore()

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Find CEO and directors
  const ceo = users.find(u => u.jobTitle?.toLowerCase().includes('ceo') || u.id === '1')
  const directors = users.filter(u => u.managerId === ceo?.id)

  // Calculate metrics
  const activeTasks = tasks.filter(t => t.status === 'in_progress').length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length
  const avgGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0

  const recentTasks = tasks
    .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    .sort((a, b) => {
      // Sort by priority and due date
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    .slice(0, 6)

  const activeGoalsList = goals.filter(g => g.status !== 'achieved').slice(0, 3)

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 animate-pulse text-primary" />
          <span className="text-xl font-semibold">Loading Command Center...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {/* Fixed viewport container */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10"
        >
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                  <Avatar className="h-14 w-14 ring-2 ring-primary/30 relative">
                    <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                      {ceo ? getInitials(ceo.displayName) : 'EFB'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {ceo?.displayName || 'Executive'} Command Center
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Egyptian Food Bank • {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                New Task
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="px-8 py-6 space-y-8">
            {/* Key Metrics */}
            <section>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-semibold mb-4"
              >
                Organization Pulse
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Active Tasks"
                  value={activeTasks}
                  change={12.5}
                  icon={Activity}
                  trend="up"
                  delay={0.1}
                />
                <StatCard
                  title="Completed This Month"
                  value={completedTasks}
                  change={8.3}
                  icon={CheckCircle2}
                  trend="up"
                  delay={0.2}
                />
                <StatCard
                  title="Urgent Items"
                  value={urgentTasks}
                  change={urgentTasks > 0 ? -15 : 0}
                  icon={AlertCircle}
                  trend={urgentTasks > 0 ? 'down' : 'neutral'}
                  delay={0.3}
                />
                <StatCard
                  title="Goal Progress"
                  value={`${avgGoalProgress}%`}
                  change={5.2}
                  icon={Target}
                  trend="up"
                  delay={0.4}
                />
              </div>
            </section>

            {/* Directors Overview */}
            <section>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between mb-4"
              >
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Leadership Team
                </h2>
                <span className="text-sm text-muted-foreground">
                  {directors.length} Directors
                </span>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {directors.map((director, index) => {
                  const directorTasks = tasks.filter(t => t.assigneeId === director.id)
                  const directorGoals = goals.filter(g => g.ownerId === director.id)
                  return (
                    <DirectorCard
                      key={director.id}
                      director={director}
                      tasks={directorTasks}
                      goals={directorGoals}
                      delay={0.1 * index}
                    />
                  )
                })}
              </div>
            </section>

            {/* Tasks and Goals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Priority Tasks */}
              <section>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-between mb-4"
                >
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Priority Tasks
                  </h2>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </motion.div>
                <div className="space-y-3">
                  {recentTasks.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No active tasks</p>
                    </motion.div>
                  ) : (
                    recentTasks.map((task, index) => {
                      const assignee = users.find(u => u.id === task.assigneeId)
                      return (
                        <TaskCard
                          key={task.id}
                          task={task}
                          assignee={assignee}
                          delay={0.05 * index}
                        />
                      )
                    })
                  )}
                </div>
              </section>

              {/* Active Goals */}
              <section>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-between mb-4"
                >
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Strategic Goals
                  </h2>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </motion.div>
                <div className="space-y-3">
                  {activeGoalsList.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No active goals</p>
                    </motion.div>
                  ) : (
                    activeGoalsList.map((goal, index) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        delay={0.05 * index}
                      />
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
