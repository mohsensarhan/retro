import { motion } from 'framer-motion'
import { Mail, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Task, Goal } from '@/lib/teamflect-api'
import { getInitials } from '@/lib/utils'

interface DirectorCardProps {
  director: User
  tasks: Task[]
  goals: Goal[]
  delay?: number
  onClick?: () => void
}

export function DirectorCard({ director, tasks, goals, delay = 0, onClick }: DirectorCardProps) {
  const activeTasks = tasks.filter(t => t.status === 'in_progress').length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const activeGoals = goals.filter(g => g.status === 'on_track' || g.status === 'at_risk').length

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-primary/20">
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {getInitials(director.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-base truncate">{director.displayName}</h4>
              <p className="text-sm text-muted-foreground truncate">{director.jobTitle}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Mail className="w-3 h-3" />
                <span className="truncate">{director.email}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-orange-500" />
                  <span className="text-lg font-bold">{activeTasks}</span>
                </div>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span className="text-lg font-bold">{completedTasks}</span>
                </div>
                <p className="text-xs text-muted-foreground">Done</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-lg font-bold">{activeGoals}</span>
                </div>
                <p className="text-xs text-muted-foreground">Goals</p>
              </div>
            </div>
          </div>

          {director.department && (
            <div className="mt-3">
              <Badge variant="secondary" className="text-xs">
                {director.department}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
