import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';

interface ResetDecision {
  taskId: string;
  action: 'keep' | 'delay' | 'archive' | 'letgo';
}

interface DailyResetModalProps {
  tasks: Task[];
  darkMode: boolean;
  onComplete: (decisions: ResetDecision[]) => void;
}

const ACTION_BUTTONS: { key: ResetDecision['action']; label: string; emoji: string; desc: string }[] = [
  { key: 'keep', label: 'Keep', emoji: '🌿', desc: 'Still matters' },
  { key: 'delay', label: 'Delay', emoji: '🌙', desc: 'Not today' },
  { key: 'archive', label: 'Archive', emoji: '📁', desc: 'Save for later' },
  { key: 'letgo', label: 'Let go', emoji: '🍂', desc: 'Release it' },
];

export const DailyResetModal: React.FC<DailyResetModalProps> = ({
  tasks,
  darkMode,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<ResetDecision[]>([]);
  const [, setAllAction] = useState<ResetDecision['action'] | null>(null);

  const currentTask = tasks[currentIndex];
  const isLastTask = currentIndex === tasks.length - 1;

  const handleAction = (action: ResetDecision['action']) => {
    const newDecisions = [...decisions, { taskId: currentTask.id, action }];
    setDecisions(newDecisions);

    if (isLastTask) {
      onComplete(newDecisions);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleApplyAll = (action: ResetDecision['action']) => {
    setAllAction(action);
    const allDecisions = tasks.map((t) => ({ taskId: t.id, action }));
    setTimeout(() => onComplete(allDecisions), 400);
  };

  const bg = darkMode ? 'bg-[#16161f] border-[#2e2e3e]' : 'bg-white border-rose-100';
  const textPrimary = darkMode ? 'text-rose-50' : 'text-slate-700';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const taskBg = darkMode ? 'bg-[#1e1e2e]' : 'bg-rose-50/60';
  const btnBase = darkMode
    ? 'bg-[#2a2a3e] hover:bg-[#3a3a4e] border-[#3a3a4e] text-rose-100'
    : 'bg-white hover:bg-rose-50 border-rose-100 text-slate-700';

  if (tasks.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: darkMode
              ? 'rgba(10,10,20,0.85)'
              : 'rgba(240,230,235,0.75)',
            backdropFilter: 'blur(12px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal */}
        <motion.div
          className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-8 ${bg}`}
          initial={{ scale: 0.92, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              className="text-4xl mb-3"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              🌸
            </motion.div>
            <h2
              className={`text-[22px] font-light mb-1 ${textPrimary}`}
              style={{ fontFamily: 'Crimson Pro, serif' }}
            >
              A gentle check-in
            </h2>
            <p className={`text-[13px] ${textMuted}`}>
              {tasks.length === 1
                ? '1 task carried forward from yesterday'
                : `${tasks.length} tasks carried forward from yesterday`}
            </p>
          </div>

          {/* Progress */}
          <div className="flex gap-1 mb-6 justify-center">
            {tasks.map((_, i) => (
              <motion.div
                key={i}
                className="h-1 rounded-full"
                style={{ width: `${Math.min(100 / tasks.length, 20)}%` }}
                animate={{
                  backgroundColor:
                    i < currentIndex
                      ? '#f4b8c8'
                      : i === currentIndex
                      ? '#e8a0b8'
                      : darkMode
                      ? '#2e2e3e'
                      : '#f0e0e8',
                }}
              />
            ))}
          </div>

          {/* Task card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTask.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className={`rounded-2xl p-4 mb-2 ${taskBg}`}
            >
              <p
                className={`text-[16px] font-light leading-relaxed ${textPrimary}`}
                style={{ fontFamily: 'Crimson Pro, serif' }}
              >
                "{currentTask.text}"
              </p>
              {currentTask.carryForwardCount > 0 && (
                <p className={`text-[12px] mt-1 italic ${textMuted}`}>
                  Carried forward {currentTask.carryForwardCount}×
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <p className={`text-center text-[13px] mb-5 ${textMuted} italic`}>
            Still worth carrying forward?
          </p>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {ACTION_BUTTONS.map((btn) => (
              <motion.button
                key={btn.key}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -1 }}
                onClick={() => handleAction(btn.key)}
                className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border text-center transition-all ${btnBase}`}
              >
                <span className="text-xl">{btn.emoji}</span>
                <span className="text-[13px] font-medium">{btn.label}</span>
                <span className={`text-[11px] ${textMuted}`}>{btn.desc}</span>
              </motion.button>
            ))}
          </div>

          {/* Apply all */}
          {tasks.length > 1 && currentIndex === 0 && (
            <div className="border-t pt-4" style={{ borderColor: darkMode ? '#2e2e3e' : '#f0e0e8' }}>
              <p className={`text-center text-[12px] mb-2 ${textMuted}`}>Apply to all at once</p>
              <div className="flex gap-2 justify-center">
                {[
                  { key: 'keep' as const, label: '🌿 Keep all' },
                  { key: 'letgo' as const, label: '🍂 Let go of all' },
                ].map((btn) => (
                  <motion.button
                    key={btn.key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApplyAll(btn.key)}
                    className={`text-[12px] px-3 py-1.5 rounded-full border transition-all ${btnBase}`}
                  >
                    {btn.label}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
