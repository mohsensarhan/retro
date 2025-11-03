import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Circle, CheckCircle2, Clock } from 'lucide-react';
import { Task } from '@/types/teamflect';
import { useUpdateTask } from '@/hooks/useTeamflect';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TasksPanelProps {
  tasks: Task[];
}

export function TasksPanel({ tasks }: TasksPanelProps) {
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const updateTaskMutation = useUpdateTask();

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    await updateTaskMutation.mutateAsync({ ...task, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tasks</h2>
          <p className="text-slate-500">Track and manage team tasks</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {(['all', 'todo', 'in-progress', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filter === status
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-slate-600 hover:bg-slate-100"
            )}
          >
            {status === 'all' ? 'All' : status.replace('-', ' ')}
            <span className="ml-2 text-xs opacity-75">
              ({status === 'all' ? tasks.length : tasks.filter(t => t.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            className={cn(
              "bg-white rounded-xl p-4 shadow hover:shadow-lg transition-all",
              task.status === 'completed' && "opacity-60"
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-start space-x-4">
              <button
                onClick={() => toggleTaskStatus(task)}
                className="mt-1"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-400 hover:text-blue-600 transition-colors" />
                )}
              </button>

              <div className="flex-1">
                <h3 className={cn(
                  "font-semibold text-slate-900",
                  task.status === 'completed' && "line-through text-slate-500"
                )}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                )}
                <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(task.dueDate)}</span>
                  </span>
                  {task.assignedTo && task.assignedTo.length > 0 && (
                    <span>{task.assignedTo[0].displayName}</span>
                  )}
                </div>
              </div>

              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              )}>
                {task.priority || 'low'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-16">
          <CheckSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No tasks found</p>
        </div>
      )}
    </div>
  );
}
