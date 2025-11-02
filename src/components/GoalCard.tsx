import { motion } from 'framer-motion'
import { Target, TrendingUp, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Goal } from '@/lib/teamflect-api'
import { format } from 'date-fns'

interface GoalCardProps {
  goal: Goal
  delay?: number
  onClick?: () => void
}

const statusConfig = {
  not_started: { color: 'default', icon: Target, label: 'Not Started' },
  on_track: { color: 'success', icon: TrendingUp, label: 'On Track' },
  at_risk: { color: 'warning', icon: AlertTriangle, label: 'At Risk' },
  off_track: { color: 'destructive', icon: AlertTriangle, label: 'Off Track' },
  achieved: { color: 'success', icon: Target, label: 'Achieved' },
  cancelled: { color: 'default', icon: Target, label: 'Cancelled' },
} as const

export function GoalCard({ goal, delay = 0, onClick }: GoalCardProps) {
  const config = statusConfig[goal.status]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold leading-tight flex items-center gap-2">
              <Icon className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="line-clamp-2">{goal.title}</span>
            </CardTitle>
            <Badge variant={config.color as any}>
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {goal.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {goal.description}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>{format(new Date(goal.startDate), 'MMM d')} - {format(new Date(goal.endDate), 'MMM d, yyyy')}</span>
            <Badge variant="outline" className="text-xs">
              {goal.type}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
