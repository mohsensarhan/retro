import { motion } from 'framer-motion';
import { Award, Heart } from 'lucide-react';
import { Recognition } from '@/types/teamflect';
import { formatDate } from '@/lib/utils';

interface RecognitionsPanelProps {
  recognitions: Recognition[];
}

export function RecognitionsPanel({ recognitions }: RecognitionsPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Recognitions</h2>
        <p className="text-slate-500">Celebrate team achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recognitions.map((recognition, index) => (
          <motion.div
            key={recognition.id}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-amber-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-1">{recognition.title}</h3>
                <div className="text-sm text-slate-600">
                  <span className="font-medium">{recognition.sender.displayName}</span>
                  {' '}recognized{' '}
                  <span className="font-medium">{recognition.recipient.displayName}</span>
                </div>
              </div>
            </div>

            <p className="text-slate-700 mb-4">{recognition.message}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{formatDate(recognition.createdAt)}</span>
              {recognition.likes !== undefined && (
                <div className="flex items-center space-x-1 text-red-600">
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">{recognition.likes}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {recognitions.length === 0 && (
        <div className="text-center py-16">
          <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No recognitions yet</p>
        </div>
      )}
    </div>
  );
}
