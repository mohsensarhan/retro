import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatNumber, formatPercent } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  delay?: number
}

export function StatCard({ title, value, change, icon: Icon, trend = 'neutral', delay = 0 }: StatCardProps) {
  const trendColor = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-muted-foreground',
  }[trend]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
              <h3 className="text-3xl font-bold tracking-tight mb-1">
                {typeof value === 'number' ? formatNumber(value) : value}
              </h3>
              {change !== undefined && (
                <p className={cn('text-sm font-medium', trendColor)}>
                  {formatPercent(change)} vs last month
                </p>
              )}
            </div>
            <div className="ml-4">
              <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
