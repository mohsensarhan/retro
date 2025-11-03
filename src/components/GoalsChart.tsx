import { motion } from 'framer-motion';
import { Goal } from '@/types/teamflect';
import { formatDate } from '@/lib/utils';

interface GoalsChartProps {
  goals: Goal[];
}

export function GoalsChart({ goals }: GoalsChartProps) {
  const upcomingGoals = goals
    .filter(g => new Date(g.dueDate) > new Date() && g.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Upcoming Goal Deadlines</h3>

      <div className="space-y-4">
        {upcomingGoals.map((goal, index) => {
          const daysLeft = Math.ceil((new Date(goal.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const isUrgent = daysLeft <= 7;

          return (
            <motion.div
              key={goal.id}
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">{goal.title}</h4>
                  <div className="flex items-center space-x-3 text-sm text-slate-500">
                    <span>{formatDate(goal.dueDate)}</span>
                    <span>•</span>
                    <span className={isUrgent ? 'text-red-600 font-medium' : ''}>
                      {daysLeft} days left
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    goal.status === 'on-track' ? 'bg-green-100 text-green-700' :
                    goal.status === 'at-risk' ? 'bg-amber-100 text-amber-700' :
                    goal.status === 'off-track' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {goal.status || 'pending'}
                  </div>

                  {goal.progress !== undefined && (
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{goal.progress}%</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {upcomingGoals.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No upcoming goal deadlines</p>
          </div>
        )}
      </div>
    </div>
  );
}
