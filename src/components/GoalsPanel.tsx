import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Save, Target, Calendar } from 'lucide-react';
import { Goal } from '@/types/teamflect';
import { useCreateGoal, useDeleteGoal } from '@/hooks/useTeamflect';
import { formatDate } from '@/lib/utils';

interface GoalsPanelProps {
  goals: Goal[];
}

export function GoalsPanel({ goals }: GoalsPanelProps) {
  const [isCreating, setIsCreating] = useState(false);

  const createGoalMutation = useCreateGoal();
  const deleteGoalMutation = useDeleteGoal();

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
    ownerIds: [] as string[],
  });

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.startDate || !newGoal.dueDate) return;

    await createGoalMutation.mutateAsync(newGoal);
    setIsCreating(false);
    setNewGoal({ title: '', description: '', startDate: '', dueDate: '', ownerIds: [] });
  };

  // Update handler commented for now - will be used when edit modal is implemented
  // const handleUpdateGoal = async (goal: Goal) => {
  //   if (!editingGoal) return;
  //   await updateGoalMutation.mutateAsync({
  //     id: goal.id,
  //     title: editingGoal.title,
  //     description: editingGoal.description,
  //     progress: editingGoal.progress,
  //   });
  //   setEditingGoal(null);
  // };

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoalMutation.mutateAsync({ goalId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Goals & OKRs</h2>
          <p className="text-slate-500">Manage organizational objectives and key results</p>
        </div>
        <motion.button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          <span>New Goal</span>
        </motion.button>
      </div>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Create New Goal</h3>
                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter goal title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    rows={3}
                    placeholder="Enter goal description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={newGoal.startDate}
                      onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Due Date *</label>
                    <input
                      type="date"
                      value={newGoal.dueDate}
                      onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGoal}
                    disabled={!newGoal.title || !newGoal.startDate || !newGoal.dueDate}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>Create Goal</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal, index) => (
          <motion.div
            key={goal.id}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-start justify-between mb-4">
              <Target className="w-8 h-8 text-blue-600" />
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGoal(goal.id);
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{goal.title}</h3>

            {goal.description && (
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{goal.description}</p>
            )}

            <div className="flex items-center space-x-2 text-sm text-slate-500 mb-3">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(goal.dueDate)}</span>
            </div>

            {goal.progress !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-semibold text-slate-900">{goal.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {goal.owners && goal.owners.slice(0, 3).map((owner, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {owner.displayName}
                </span>
              ))}
              {goal.owners && goal.owners.length > 3 && (
                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full">
                  +{goal.owners.length - 3} more
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-16">
          <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Goals Yet</h3>
          <p className="text-slate-500 mb-6">Create your first goal to get started</p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Goal</span>
          </button>
        </div>
      )}
    </div>
  );
}
