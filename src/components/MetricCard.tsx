import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  total?: number;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'amber' | 'red';
  trend?: 'up' | 'down';
  trendValue?: string;
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
  purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
  green: 'from-green-500 to-green-600 shadow-green-500/20',
  amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
  red: 'from-red-500 to-red-600 shadow-red-500/20',
};

const iconBgClasses = {
  blue: 'bg-blue-100',
  purple: 'bg-purple-100',
  green: 'bg-green-100',
  amber: 'bg-amber-100',
  red: 'bg-red-100',
};

const iconColorClasses = {
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  green: 'text-green-600',
  amber: 'text-amber-600',
  red: 'text-red-600',
};

export function MetricCard({ title, value, total, icon: Icon, color, trend, trendValue }: MetricCardProps) {
  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background Gradient on Hover */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity",
        colorClasses[color]
      )} />

      <div className="relative">
        {/* Icon */}
        <div className={cn("inline-flex p-3 rounded-xl mb-4", iconBgClasses[color])}>
          <Icon className={cn("w-6 h-6", iconColorClasses[color])} />
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-slate-600 mb-2">{title}</h3>

        {/* Value */}
        <div className="flex items-baseline space-x-2 mb-3">
          <motion.span
            className="text-3xl font-bold text-slate-900"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {value}
          </motion.span>
          {total !== undefined && (
            <span className="text-lg text-slate-400">/ {total}</span>
          )}
        </div>

        {/* Trend */}
        {(trend || trendValue) && (
          <div className="flex items-center space-x-2">
            {trend && (
              <div className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                trend === 'up' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
              </div>
            )}
            {trendValue && (
              <span className="text-xs text-slate-500">{trendValue}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
