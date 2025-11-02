import { motion } from 'framer-motion'
import { Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Task, User as UserType } from '@/lib/teamflect-api'
import { getInitials } from '@/lib/utils'
import { format } from 'date-fns'

interface TaskCardProps {
  task: Task
  assignee?: UserType
  delay?: number
  onClick?: () => void
}

const priorityColors = {
  low: 'default',
  medium: 'warning',
  high: 'warning',
  urgent: 'destructive',
} as const

const statusLabels = {
  not_started: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function TaskCard({ task, assignee, delay = 0, onClick }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold leading-tight">
              {task.title}
            </CardTitle>
            <Badge variant={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {task.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {assignee && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getInitials(assignee.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {assignee.displayName.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>
            {task.dueDate && (
              <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                {isOverdue && <AlertCircle className="w-3 h-3" />}
                <Clock className="w-3 h-3" />
                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
              </div>
            )}
          </div>
          <div className="mt-3">
            <Badge variant="outline" className="text-xs">
              {statusLabels[task.status]}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
