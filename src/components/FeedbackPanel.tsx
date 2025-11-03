import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, AlertCircle, MessageCircle } from 'lucide-react';
import { Feedback } from '@/types/teamflect';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FeedbackPanelProps {
  feedback: Feedback[];
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'praise': return ThumbsUp;
      case 'constructive': return AlertCircle;
      default: return MessageCircle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'praise': return 'bg-green-100 text-green-700';
      case 'constructive': return 'bg-amber-100 text-amber-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Feedback</h2>
        <p className="text-slate-500">Team feedback and communication</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedback.map((item, index) => {
          const Icon = getTypeIcon(item.type);
          return (
            <motion.div
              key={item.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className={cn("p-3 rounded-xl", getTypeColor(item.type))}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{item.sender.displayName}</div>
                  <div className="text-sm text-slate-500">to {item.recipient.displayName}</div>
                </div>
              </div>

              <p className="text-slate-700 mb-4">{item.message}</p>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{formatDate(item.createdAt)}</span>
                <span className={cn("px-2 py-1 rounded-full font-medium", getTypeColor(item.type))}>
                  {item.type}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {feedback.length === 0 && (
        <div className="text-center py-16">
          <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No feedback yet</p>
        </div>
      )}
    </div>
  );
}
