import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSettings } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdate: (settings: Partial<AppSettings>) => void;
  darkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  taskCount: { active: number; completed: number; forgotten: number };
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdate,
  darkMode,
  isOpen,
  onClose,
  taskCount,
}) => {
  const bg = darkMode ? 'bg-[#14141e] border-[#2e2e3e]' : 'bg-white/95 border-rose-100';
  const textPrimary = darkMode ? 'text-rose-50/90' : 'text-slate-700';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = darkMode ? 'bg-[#2a2a3e] border-[#3a3a4e] text-rose-100' : 'bg-rose-50 border-rose-100 text-slate-700';
  const divider = darkMode ? 'border-[#2e2e3e]' : 'border-rose-100/60';

  const TREE_STAGES = [
    { label: 'Bare branches', desc: 'Just starting out', emoji: '🌿' },
    { label: 'First blossoms', desc: 'Building momentum', emoji: '🌸' },
    { label: 'Fuller bloom', desc: 'Consistent flow', emoji: '🌺' },
    { label: 'Petals drifting', desc: 'Peaceful harmony', emoji: '✨' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className={`fixed left-0 top-0 bottom-0 z-50 w-full max-w-sm border-r ${bg} shadow-2xl flex flex-col`}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
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
                    Settings
                  </h2>
                  <p className={`text-[12px] mt-0.5 ${textMuted}`}>Gentle customization</p>
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

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Stats */}
              <div>
                <p className={`text-[11px] uppercase tracking-widest mb-3 ${textMuted}`}>Your garden</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Active', count: taskCount.active, emoji: '🌱' },
                    { label: 'Done', count: taskCount.completed, emoji: '✓' },
                    { label: 'Forgotten', count: taskCount.forgotten, emoji: '🍂' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`rounded-xl p-3 text-center ${
                        darkMode ? 'bg-[#1e1e2e]' : 'bg-rose-50/60'
                      }`}
                    >
                      <div className="text-xl mb-1">{stat.emoji}</div>
                      <div className={`text-[18px] font-light ${textPrimary}`}>{stat.count}</div>
                      <div className={`text-[10px] ${textMuted}`}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className={`mt-3 rounded-xl p-3 text-center ${darkMode ? 'bg-[#1e1e2e]' : 'bg-rose-50/60'}`}>
                  <div className="text-xl mb-1">🌸</div>
                  <div className={`text-[18px] font-light ${textPrimary}`}>{settings.momentumDays}</div>
                  <div className={`text-[11px] ${textMuted}`}>days of gentle momentum</div>
                </div>
              </div>

              {/* Dark mode */}
              <div className={`border-t pt-5 ${divider}`}>
                <p className={`text-[11px] uppercase tracking-widest mb-3 ${textMuted}`}>Appearance</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-[14px] font-light ${textPrimary}`}>Dark mode</p>
                    <p className={`text-[12px] ${textMuted}`}>Easier on the eyes</p>
                  </div>
                  <motion.button
                    onClick={() => onUpdate({ darkMode: !settings.darkMode })}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                      settings.darkMode ? 'bg-rose-400/80' : 'bg-rose-200'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                      animate={{ left: settings.darkMode ? '26px' : '2px' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  </motion.button>
                </div>
              </div>

              {/* Daily reset time */}
              <div className={`border-t pt-5 ${divider}`}>
                <p className={`text-[11px] uppercase tracking-widest mb-3 ${textMuted}`}>Daily ritual</p>
                <div>
                  <p className={`text-[14px] font-light mb-1 ${textPrimary}`}>Check-in time</p>
                  <p className={`text-[12px] mb-3 ${textMuted}`}>
                    When to gently review unfinished tasks
                  </p>
                  <input
                    type="time"
                    value={settings.dailyResetTime}
                    onChange={(e) => onUpdate({ dailyResetTime: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-[14px] border outline-none transition-colors ${inputBg}`}
                  />
                </div>
              </div>

              {/* Tree stage */}
              <div className={`border-t pt-5 ${divider}`}>
                <p className={`text-[11px] uppercase tracking-widest mb-3 ${textMuted}`}>Blossom stage</p>
                <p className={`text-[12px] mb-3 ${textMuted}`}>
                  Your tree grows with gentle, consistent effort
                </p>
                <div className="space-y-2">
                  {TREE_STAGES.map((stage, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onUpdate({ treeStage: i })}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        settings.treeStage === i
                          ? darkMode
                            ? 'bg-[#2a1a2e] border-rose-400/40'
                            : 'bg-rose-50 border-rose-300'
                          : darkMode
                          ? 'bg-transparent border-[#2e2e3e]'
                          : 'bg-transparent border-rose-100'
                      }`}
                    >
                      <span className="text-2xl">{stage.emoji}</span>
                      <div>
                        <p className={`text-[13px] font-medium ${textPrimary}`}>{stage.label}</p>
                        <p className={`text-[11px] ${textMuted}`}>{stage.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
                <p className={`text-[11px] mt-3 text-center ${textMuted} italic`}>
                  Tree stage also updates automatically with momentum
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
