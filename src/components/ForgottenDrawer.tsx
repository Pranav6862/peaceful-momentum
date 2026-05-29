import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import { formatRelativeDate } from '../utils/taskUtils';

interface ForgottenDrawerProps {
  tasks: Task[];
  darkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

export const ForgottenDrawer: React.FC<ForgottenDrawerProps> = ({
  tasks,
  darkMode,
  isOpen,
  onClose,
  onRestore,
  onPermanentDelete,
}) => {
  const bg = darkMode ? 'bg-[#14141e] border-[#2e2e3e]' : 'bg-white/95 border-rose-100';
  const textPrimary = darkMode ? 'text-rose-50/80' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  const itemBg = darkMode ? 'bg-[#1e1e2e]' : 'bg-rose-50/40';
  const divider = darkMode ? 'border-[#2e2e3e]' : 'border-rose-100/60';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm border-l ${bg} shadow-2xl flex flex-col`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 35 }}
          >
            {/* Header */}
            <div className={`px-6 py-5 border-b ${divider}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className={`text-[20px] font-light ${textPrimary}`}
                    style={{ fontFamily: 'Crimson Pro, serif' }}
                  >
                    Forgotten Drawer
                  </h2>
                  <p className={`text-[12px] mt-0.5 ${textMuted}`}>
                    Gently set aside — no judgment here
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    darkMode ? 'hover:bg-[#2a2a3e] text-slate-400' : 'hover:bg-rose-50 text-slate-400'
                  }`}
                >
                  ×
                </motion.button>
              </div>
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <span className="text-3xl opacity-40">🗂️</span>
                  <p className={`text-[13px] ${textMuted} italic`}>Nothing forgotten yet</p>
                </div>
              ) : (
                <AnimatePresence>
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 0.75, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className={`rounded-xl p-3 ${itemBg}`}
                    >
                      <p
                        className={`text-[13px] font-light line-through ${textPrimary}`}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {task.text}
                      </p>
                      <p className={`text-[11px] mt-1 ${textMuted}`}>
                        {formatRelativeDate(task.createdAt)}
                        {task.energyTag && ` · ${task.energyTag}`}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          onClick={() => onRestore(task.id)}
                          className={`text-[11px] px-2.5 py-1 rounded-full transition-all ${
                            darkMode
                              ? 'bg-[#2a2a3e] text-slate-300 hover:bg-[#3a3a4e]'
                              : 'bg-rose-100/80 text-slate-600 hover:bg-rose-200/80'
                          }`}
                        >
                          🌱 Restore
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          onClick={() => onPermanentDelete(task.id)}
                          className={`text-[11px] px-2.5 py-1 rounded-full transition-all ${
                            darkMode
                              ? 'bg-transparent text-slate-500 hover:text-rose-400'
                              : 'bg-transparent text-slate-400 hover:text-rose-400'
                          }`}
                        >
                          Release
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
