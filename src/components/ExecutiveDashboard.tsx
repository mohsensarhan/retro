import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Users, Activity, TrendingUp, AlertCircle } from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function ExecutiveDashboard() {
  const { goals, tasks, recognitions, isLoading, error, fetchAllData } = useDashboardStore()

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Helper function to calculate progress percentage from Teamflect API structure
  const getProgressPercent = (progress: typeof goals[0]['progress']): number => {
    if (!progress?.targetValue || progress.targetValue === 0) return 0
    return Math.round((progress.currentValue / progress.targetValue) * 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3"
        >
          <Activity className="w-8 h-8 animate-pulse text-primary" />
          <span className="text-xl font-semibold">Loading Your Organization...</span>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <Card className="max-w-2xl w-full border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-6 h-6" />
              API Connection Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <p className="text-sm">
              Please check:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>API key is active in Teamflect admin</li>
                <li>All permissions are enabled (Goals, Tasks, Users, etc.)</li>
                <li>No IP restrictions blocking access</li>
              </ul>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Extract organizational insights
  const companyGoals = goals.filter(g => g.goalType?.visibleName?.toLowerCase().includes('company') || g.goalType?.goalLevel === 0)
  const teamGoals = goals.filter(g => g.goalType?.visibleName?.toLowerCase().includes('team') || g.goalType?.goalLevel === 1)
  const individualGoals = goals.filter(g => g.goalType?.visibleName?.toLowerCase().includes('individual') || g.goalType?.goalLevel === 2)

  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + getProgressPercent(g.progress), 0) / goals.length)
    : 0

  const onTrackGoals = goals.filter(g => g.status?.toLowerCase().includes('track')).length
  const atRiskGoals = goals.filter(g => g.status?.toLowerCase().includes('risk')).length

  // Get unique team members
  const allOwners = goals.flatMap(g => g.owners || [])
  const uniqueUsers = Array.from(new Map(allOwners.map(u => [u.oid, u])).values())

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10"
      >
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Executive Command Center</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Egyptian Food Bank • {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Activity className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Organization Pulse
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{goals.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Company: {companyGoals.length} • Team: {teamGoals.length} • Individual: {individualGoals.length}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{avgProgress}%</div>
                  <Progress value={avgProgress} className="mt-2 h-2" />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Goal Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-2xl font-bold text-green-500">{onTrackGoals}</div>
                      <p className="text-xs text-muted-foreground">On Track</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-500">{atRiskGoals}</div>
                      <p className="text-xs text-muted-foreground">At Risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Team Size
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{uniqueUsers.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active Contributors
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Strategic Goals */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Strategic Goals ({companyGoals.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {companyGoals.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">No company-level goals found</p>
                </CardContent>
              </Card>
            ) : (
              companyGoals.map((goal, idx) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight">{goal.title}</CardTitle>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {goal.description}
                            </p>
                          )}
                        </div>
                        <Badge variant={goal.status?.toLowerCase().includes('track') ? 'default' : 'destructive'}>
                          {goal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">{getProgressPercent(goal.progress)}%</span>
                          </div>
                          <Progress value={getProgressPercent(goal.progress)} className="h-2" />
                          {goal.progress && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {goal.progress.currentValue} / {goal.progress.targetValue}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                          <div className="flex -space-x-2">
                            {goal.owners?.slice(0, 3).map((owner) => (
                              <Avatar key={owner.oid} className="h-6 w-6 border-2 border-background">
                                <AvatarFallback className="text-xs">
                                  {owner.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {(goal.owners?.length || 0) > 3 && (
                              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                +{(goal.owners?.length || 0) - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Team Goals */}
        {teamGoals.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Team Goals ({teamGoals.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamGoals.slice(0, 6).map((goal, idx) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base leading-tight line-clamp-2">
                        {goal.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{getProgressPercent(goal.progress)}%</span>
                        </div>
                        <Progress value={getProgressPercent(goal.progress)} className="h-1.5" />
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="outline" className="text-xs">
                            {goal.status}
                          </Badge>
                          <span className="text-muted-foreground">
                            {goal.owners?.length || 0} owners
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Recognitions ({recognitions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {recognitions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recognitions yet</p>
              ) : (
                <div className="space-y-3">
                  {recognitions.slice(0, 5).map((rec) => (
                    <div key={rec.id} className="flex items-start gap-3 text-sm">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {rec.createdBy?.displayName?.split(' ').map(n => n[0]).join('') || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{rec.createdBy?.displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(rec.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tasks ({tasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks found</p>
              ) : (
                <div className="space-y-2">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                      <span className="line-clamp-1">{task.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
