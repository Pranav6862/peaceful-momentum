// src/App.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { parseISO } from 'date-fns';

import { Task, AppSettings, Priority, EnergyTag, TaskLifespan } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  getExpiresAt,
  isExpired,
  shouldTriggerReset,
  getTodayString,
} from './utils/taskUtils';

import { CherryBlossomTree, FloatingPetal } from './components/CherryBlossomTree';
import { TaskInput } from './components/TaskInput';
import { TaskItem } from './components/TaskItem';
import { DailyResetModal } from './components/DailyResetModal';
import { ForgottenDrawer } from './components/ForgottenDrawer';
import { SettingsPanel } from './components/SettingsPanel';
import { CelebrationOverlay } from './components/CelebrationOverlay';
import { AffirmationBar } from './components/AffirmationBar';

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  dailyResetTime: '08:00',
  lastResetDate: null,
  momentumDays: 0,
  lastActivityDate: null,
  treeStage: 0,
};

interface PetalInstance {
  id: string;
}

// ─────────────────────────────────────────────
// Whisper label between priority groups
// Crimson Pro italic, barely visible
// ─────────────────────────────────────────────
function PriorityWhisper({
  label,
  darkMode,
}: {
  label: string;
  darkMode: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex items-center gap-3 py-1 px-1"
    >
      {/* Left fade line */}
      <div
        className="flex-1 h-px"
        style={{
          background: darkMode
            ? 'linear-gradient(to right, transparent, rgba(244,184,200,0.08))'
            : 'linear-gradient(to right, transparent, rgba(244,184,200,0.25))',
        }}
      />
      {/* Whisper text */}
      <span
        className="text-[11px] italic tracking-wide flex-shrink-0"
        style={{
          fontFamily: 'Crimson Pro, serif',
          color: darkMode
            ? 'rgba(244,184,200,0.22)'
            : 'rgba(180,120,140,0.35)',
        }}
      >
        {label}
      </span>
      {/* Right fade line */}
      <div
        className="flex-1 h-px"
        style={{
          background: darkMode
            ? 'linear-gradient(to left, transparent, rgba(244,184,200,0.08))'
            : 'linear-gradient(to left, transparent, rgba(244,184,200,0.25))',
        }}
      />
    </motion.div>
  );
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('petals-tasks', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>(
    'petals-settings',
    DEFAULT_SETTINGS
  );
  const [showReset, setShowReset] = useState(false);
  const [resetCandidates, setResetCandidates] = useState<Task[]>([]);
  const [showForgottenDrawer, setShowForgottenDrawer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [petals, setPetals] = useState<PetalInstance[]>([]);
  const [celebrateAll, setCelebrateAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'active' | 'completed'
  >('all');
  const checkResetRef = useRef(false);

  const darkMode = settings.darkMode;

  // Auto dark mode on first load
  useEffect(() => {
    if (!localStorage.getItem('petals-settings')) {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      setSettings((s) => ({ ...s, darkMode: prefersDark }));
    }
  }, []);

  // ─────────────────────────────────────────────
  // Daily bloom reset
  // If it's a new day, reset treeStage to 0
  // so the tree regrows as tasks are completed
  // momentumDays streak is never touched here
  // ─────────────────────────────────────────────
  useEffect(() => {
    const today = getTodayString();
    if (
      settings.lastActivityDate &&
      settings.lastActivityDate !== today &&
      settings.treeStage > 0
    ) {
      setSettings((s) => ({ ...s, treeStage: 0 }));
    }
  }, []);

  // Check for daily reset
  useEffect(() => {
    if (checkResetRef.current) return;
    checkResetRef.current = true;

    const unfinishedTasks = tasks.filter(
      (t) => t.status === 'active' && !isExpired(t)
    );

    if (
      unfinishedTasks.length > 0 &&
      shouldTriggerReset(settings.dailyResetTime, settings.lastResetDate)
    ) {
      setResetCandidates(unfinishedTasks);
      setShowReset(true);
    }

    // Move expired tasks to forgotten
    const now = new Date();
    let hasExpired = false;
    const updatedTasks = tasks.map((t) => {
      if (t.status === 'active' && t.expiresAt && now > parseISO(t.expiresAt)) {
        hasExpired = true;
        return { ...t, status: 'forgotten' as const };
      }
      return t;
    });
    if (hasExpired) setTasks(updatedTasks);
  }, []);

  // Compute tree stage from momentum days
  const computedTreeStage = useCallback(() => {
    const days = settings.momentumDays;
    if (days >= 21) return 3;
    if (days >= 10) return 2;
    if (days >= 3) return 1;
    return 0;
  }, [settings.momentumDays]);

  const activeTasks = tasks.filter((t) => t.status === 'active');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const forgottenTasks = tasks.filter(
    (t) => t.status === 'forgotten' || t.status === 'archived'
  );
  const allDone =
    activeTasks.length > 0 && activeTasks.every((t) => t.status === 'completed');

  // Watch for all-done celebration
  const prevAllDone = useRef(false);
  useEffect(() => {
    if (allDone && !prevAllDone.current) {
      setCelebrateAll(true);
      setTimeout(() => setCelebrateAll(false), 7000);
    }
    prevAllDone.current = allDone;
  }, [allDone]);

  const addPetal = () => {
    const id = uuidv4();
    setPetals((prev) => [...prev, { id }]);
    setTimeout(() => {
      setPetals((prev) => prev.filter((p) => p.id !== id));
    }, 4000);
  };

  const handleAddTask = (taskData: {
    text: string;
    priority: Priority;
    energyTag: EnergyTag | null;
    lifespan: TaskLifespan;
    customLifespanDays?: number;
  }) => {
    const newTask: Task = {
      id: uuidv4(),
      text: taskData.text,
      priority: taskData.priority,
      energyTag: taskData.energyTag,
      status: 'active',
      createdAt: new Date().toISOString(),
      completedAt: null,
      lifespan: taskData.lifespan,
      customLifespanDays: taskData.customLifespanDays,
      expiresAt: getExpiresAt(taskData.lifespan, taskData.customLifespanDays),
      carryForwardCount: 0,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'completed', completedAt: new Date().toISOString() }
          : t
      )
    );
    addPetal();

    // Update momentum + tree stage
    const today = getTodayString();
    if (settings.lastActivityDate !== today) {
      const newDays = settings.momentumDays + 1;
      const newStage =
        newDays >= 21 ? 3 : newDays >= 10 ? 2 : newDays >= 3 ? 1 : 0;
      setSettings((s) => ({
        ...s,
        lastActivityDate: today,
        momentumDays: newDays,
        treeStage: newStage,
      }));
    } else {
      // Same day — still increment treeStage based on
      // how many tasks completed today to show daily bloom progress
      const todayCompleted = completedTasks.length + 1; // +1 for this completion
      const newStage =
        todayCompleted >= 8
          ? 3
          : todayCompleted >= 4
          ? 2
          : todayCompleted >= 1
          ? 1
          : 0;
      setSettings((s) => ({
        ...s,
        treeStage: Math.max(s.treeStage, newStage),
      }));
    }
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleArchive = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'forgotten' } : t))
    );
  };

  const handleResetComplete = (
    decisions: {
      taskId: string;
      action: 'keep' | 'delay' | 'archive' | 'letgo';
    }[]
  ) => {
    setTasks((prev) => {
      const updated = [...prev];
      decisions.forEach(({ taskId, action }) => {
        const idx = updated.findIndex((t) => t.id === taskId);
        if (idx === -1) return;
        if (action === 'keep') {
          updated[idx] = {
            ...updated[idx],
            carryForwardCount: updated[idx].carryForwardCount + 1,
          };
        } else if (action === 'delay') {
          updated[idx] = {
            ...updated[idx],
            carryForwardCount: updated[idx].carryForwardCount + 1,
            expiresAt: getExpiresAt('1day'),
          };
        } else if (action === 'archive') {
          updated[idx] = { ...updated[idx], status: 'archived' };
        } else if (action === 'letgo') {
          updated[idx] = { ...updated[idx], status: 'forgotten' };
        }
      });
      return updated;
    });

    setSettings((s) => ({ ...s, lastResetDate: getTodayString() }));
    setShowReset(false);
    setResetCandidates([]);
  };

  const handleRestoreFromForgotten = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'active', expiresAt: null, completedAt: null }
          : t
      )
    );
  };

  const handlePermanentDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((s) => ({ ...s, ...partial }));
  };

  // ─────────────────────────────────────────────
  // Priority grouping
  // Tasks flow: high → medium → low
  // Each group only shown when it has tasks
  // Completed tasks always go to bottom of their group
  // ─────────────────────────────────────────────
  const getDisplayedTasks = () => {
    const filtered = tasks.filter((t) => {
      if (t.status === 'forgotten' || t.status === 'archived') return false;
      if (activeFilter === 'active') return t.status === 'active';
      if (activeFilter === 'completed') return t.status === 'completed';
      return true;
    });

    if (activeFilter === 'completed') {
      // Completed view: no priority grouping needed, just show flat
      return { high: [], medium: [], low: [], flat: filtered };
    }

    // Group by priority, completed tasks sink to bottom within each group
    const sortGroup = (tasks: Task[]) => [
      ...tasks.filter((t) => t.status !== 'completed'),
      ...tasks.filter((t) => t.status === 'completed'),
    ];

    return {
      high: sortGroup(filtered.filter((t) => t.priority === 'high')),
      medium: sortGroup(filtered.filter((t) => t.priority === 'medium')),
      low: sortGroup(filtered.filter((t) => t.priority === 'low')),
      flat: [],
    };
  };

  const displayedGroups = getDisplayedTasks();
  const totalDisplayed =
    displayedGroups.flat.length +
    displayedGroups.high.length +
    displayedGroups.medium.length +
    displayedGroups.low.length;

  const treeStage = Math.max(settings.treeStage, computedTreeStage());

  // Theme classes — all preserved from original
  const appBg = darkMode
    ? 'bg-[#0f0f1a] text-rose-50'
    : 'bg-[#fdf8f8] text-slate-800';
  const headerBg = darkMode ? 'bg-[#0f0f1a]/90' : 'bg-[#fdf8f8]/90';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const filterActive = darkMode
    ? 'bg-[#2a1a2e] text-rose-200 border-rose-400/30'
    : 'bg-rose-100/80 text-rose-600 border-rose-200';
  const filterInactive = darkMode
    ? 'text-slate-500 border-transparent hover:text-slate-300'
    : 'text-slate-400 border-transparent hover:text-slate-600';

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${appBg}`}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Floating petals from task completion */}
      {petals.map((p) => (
        <FloatingPetal key={p.id} />
      ))}

      {/* Celebration overlay */}
      <CelebrationOverlay show={celebrateAll} darkMode={darkMode} />

      {/* Background ambient blobs — preserved exactly */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30"
          style={{
            background: darkMode
              ? 'radial-gradient(circle, #2d1a2a, transparent)'
              : 'radial-gradient(circle, #fce4ec, transparent)',
          }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.25, 0.35, 0.25] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-20"
          style={{
            background: darkMode
              ? 'radial-gradient(circle, #1a1a2e, transparent)'
              : 'radial-gradient(circle, #f8bbd0, transparent)',
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Tree — fixed corner, unchanged */}
      <div className="fixed bottom-0 right-0 w-36 h-52 z-10 pointer-events-none">
        <CherryBlossomTree
          stage={treeStage}
          darkMode={darkMode}
          celebrateAll={celebrateAll}
        />
      </div>

      {/* Header — preserved exactly */}
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-colors duration-300 ${headerBg} ${
          darkMode ? 'border-[#2e2e3e]' : 'border-rose-100/60'
        }`}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowSettings(true)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                darkMode
                  ? 'hover:bg-[#2a2a3e] text-slate-400'
                  : 'hover:bg-rose-50 text-slate-400'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.button>
            <div>
              <h1
                className={`text-[18px] font-light tracking-wide ${
                  darkMode ? 'text-rose-100' : 'text-slate-700'
                }`}
                style={{ fontFamily: 'Crimson Pro, serif' }}
              >
                Petals
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Momentum indicator */}
            <motion.div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] ${
                darkMode
                  ? 'bg-[#1e1e2e] text-slate-400'
                  : 'bg-rose-50 text-slate-500'
              }`}
              title="Days of gentle momentum"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-[14px]">🌸</span>
              <span>{settings.momentumDays}d</span>
            </motion.div>

            {/* Forgotten drawer button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowForgottenDrawer(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] transition-colors ${
                darkMode
                  ? 'bg-[#1e1e2e] text-slate-400 hover:text-slate-300'
                  : 'bg-rose-50 text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>🗂️</span>
              {forgottenTasks.length > 0 && (
                <span>{forgottenTasks.length}</span>
              )}
            </motion.button>

            {/* Dark mode toggle */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => updateSettings({ darkMode: !darkMode })}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[15px] transition-colors ${
                darkMode ? 'hover:bg-[#2a2a3e]' : 'hover:bg-rose-50'
              }`}
            >
              {darkMode ? '☀️' : '🌙'}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-20 max-w-2xl mx-auto px-4 pt-6 pb-32">
        {/* Greeting — preserved */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2
            className={`text-[28px] font-light leading-tight ${
              darkMode ? 'text-rose-100/90' : 'text-slate-700'
            }`}
            style={{ fontFamily: 'Crimson Pro, serif' }}
          >
            {getGreeting()}
          </h2>
          <p className={`text-[14px] mt-1 font-light ${textMuted}`}>
            {getSubtitle(
              activeTasks.filter((t) => t.status === 'active').length,
              completedTasks.length
            )}
          </p>
          <div className="mt-3">
            <AffirmationBar darkMode={darkMode} />
          </div>
        </motion.div>

        {/* Task input — preserved */}
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <TaskInput onAdd={handleAddTask} darkMode={darkMode} />
        </motion.div>

        {/* Filters — preserved */}
        {tasks.filter(
          (t) => t.status !== 'forgotten' && t.status !== 'archived'
        ).length > 0 && (
          <motion.div
            className="flex gap-2 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {(['all', 'active', 'completed'] as const).map((filter) => (
              <motion.button
                key={filter}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full text-[12px] border transition-all capitalize ${
                  activeFilter === filter ? filterActive : filterInactive
                }`}
              >
                {filter}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────
            Task list — priority grouped flow
            high → medium → low
            whisper labels between groups
            ───────────────────────────────────────────── */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {totalDisplayed === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center"
              >
                <motion.div
                  className="text-5xl mb-4 opacity-50"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  🌸
                </motion.div>
                <p
                  className={`text-[18px] font-light ${
                    darkMode ? 'text-rose-100/50' : 'text-slate-400'
                  }`}
                  style={{ fontFamily: 'Crimson Pro, serif' }}
                >
                  {activeFilter === 'completed'
                    ? 'Nothing completed yet today'
                    : 'Your space is clear'}
                </p>
                <p className={`text-[13px] mt-1 ${textMuted}`}>
                  {activeFilter === 'completed'
                    ? 'Complete a task to see it here'
                    : 'Add something gently to your mind'}
                </p>
              </motion.div>
            ) : activeFilter === 'completed' ? (
              // Completed filter: flat list, no grouping
              displayedGroups.flat.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  darkMode={darkMode}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                />
              ))
            ) : (
              <>
                {/* High priority group */}
                {displayedGroups.high.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    darkMode={darkMode}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                  />
                ))}

                {/* Whisper between high and medium */}
                {displayedGroups.high.length > 0 &&
                  displayedGroups.medium.length > 0 && (
                    <PriorityWhisper
                      key="whisper-high-medium"
                      label="· gentle things ·"
                      darkMode={darkMode}
                    />
                  )}

                {/* Medium priority group */}
                {displayedGroups.medium.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    darkMode={darkMode}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                  />
                ))}

                {/* Whisper between medium and low */}
                {displayedGroups.medium.length > 0 &&
                  displayedGroups.low.length > 0 && (
                    <PriorityWhisper
                      key="whisper-medium-low"
                      label="· lighter still ·"
                      darkMode={darkMode}
                    />
                  )}

                {/* Edge case: high exists, medium empty, low exists */}
                {displayedGroups.high.length > 0 &&
                  displayedGroups.medium.length === 0 &&
                  displayedGroups.low.length > 0 && (
                    <PriorityWhisper
                      key="whisper-high-low"
                      label="· lighter still ·"
                      darkMode={darkMode}
                    />
                  )}

                {/* Low priority group */}
                {displayedGroups.low.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    darkMode={darkMode}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar — preserved */}
        {tasks.filter(
          (t) => t.status !== 'forgotten' && t.status !== 'archived'
        ).length > 0 && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`text-[11px] uppercase tracking-widest ${textMuted}`}
              >
                Today's flow
              </span>
              <span className={`text-[11px] ${textMuted}`}>
                {completedTasks.length} /{' '}
                {activeTasks.length + completedTasks.length}
              </span>
            </div>
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: darkMode ? '#2e2e3e' : '#f0e0e8' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #f4b8c8, #e8a0b8)',
                }}
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    activeTasks.length + completedTasks.length > 0
                      ? (completedTasks.length /
                          (activeTasks.length + completedTasks.length)) *
                        100
                      : 0
                  }%`,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}

        {/* All done message — preserved */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 text-center"
            >
              <p
                className={`text-[16px] font-light italic ${
                  darkMode ? 'text-rose-300/60' : 'text-rose-400/70'
                }`}
                style={{ fontFamily: 'Crimson Pro, serif' }}
              >
                All done. Rest easy. ✨
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals & Drawers — all preserved exactly */}
      <AnimatePresence>
        {showReset && resetCandidates.length > 0 && (
          <DailyResetModal
            key="reset"
            tasks={resetCandidates}
            darkMode={darkMode}
            onComplete={handleResetComplete}
          />
        )}
      </AnimatePresence>

      <ForgottenDrawer
        tasks={forgottenTasks}
        darkMode={darkMode}
        isOpen={showForgottenDrawer}
        onClose={() => setShowForgottenDrawer(false)}
        onRestore={handleRestoreFromForgotten}
        onPermanentDelete={handlePermanentDelete}
      />

      <SettingsPanel
        settings={settings}
        onUpdate={updateSettings}
        darkMode={darkMode}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        taskCount={{
          active: activeTasks.filter((t) => t.status === 'active').length,
          completed: completedTasks.length,
          forgotten: forgottenTasks.length,
        }}
      />

      {/* Bottom ambient footer — preserved */}
      <div className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div
          className="h-20"
          style={{
            background: darkMode
              ? 'linear-gradient(to top, rgba(15,15,26,0.9), transparent)'
              : 'linear-gradient(to top, rgba(253,248,248,0.9), transparent)',
          }}
        />
      </div>

      {/* Breathing dot — preserved */}
      <motion.div
        className="fixed bottom-5 left-5 z-20 pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: darkMode ? '#f4b8c840' : '#e8a0b850' }}
        />
      </motion.div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Quiet night…';
  if (hour < 12) return 'Good morning ☁️';
  if (hour < 17) return 'Good afternoon 🌤';
  if (hour < 21) return 'Good evening 🌅';
  return 'Good night 🌙';
}

function getSubtitle(activeCount: number, completedCount: number): string {
  if (activeCount === 0 && completedCount === 0) {
    return 'What would you like to carry today?';
  }
  if (activeCount === 0) {
    return `All ${completedCount} things done — beautifully.`;
  }
  if (completedCount === 0) {
    return `${activeCount} thing${activeCount > 1 ? 's' : ''} gently waiting.`;
  }
  return `${completedCount} done · ${activeCount} remaining`;
}


// import { useState, useEffect, useCallback, useRef } from 'react';
// import { AnimatePresence, motion } from 'framer-motion';
// import { v4 as uuidv4 } from 'uuid';
// import { parseISO } from 'date-fns';

// import { Task, AppSettings, Priority, EnergyTag, TaskLifespan } from './types';
// import { useLocalStorage } from './hooks/useLocalStorage';
// import {
//   getExpiresAt,
//   isExpired,
//   shouldTriggerReset,
//   getTodayString,
// } from './utils/taskUtils';

// import { CherryBlossomTree, FloatingPetal } from './components/CherryBlossomTree';
// import { TaskInput } from './components/TaskInput';
// import { TaskItem } from './components/TaskItem';
// import { DailyResetModal } from './components/DailyResetModal';
// import { ForgottenDrawer } from './components/ForgottenDrawer';
// import { SettingsPanel } from './components/SettingsPanel';
// import { CelebrationOverlay } from './components/CelebrationOverlay';
// import { AffirmationBar } from './components/AffirmationBar';

// const DEFAULT_SETTINGS: AppSettings = {
//   darkMode: false,
//   dailyResetTime: '08:00',
//   lastResetDate: null,
//   momentumDays: 0,
//   lastActivityDate: null,
//   treeStage: 0,
// };

// interface PetalInstance {
//   id: string;
// }

// export default function App() {
//   const [tasks, setTasks] = useLocalStorage<Task[]>('petals-tasks', []);
//   const [settings, setSettings] = useLocalStorage<AppSettings>('petals-settings', DEFAULT_SETTINGS);
//   const [showReset, setShowReset] = useState(false);
//   const [resetCandidates, setResetCandidates] = useState<Task[]>([]);
//   const [showForgottenDrawer, setShowForgottenDrawer] = useState(false);
//   const [showSettings, setShowSettings] = useState(false);
//   const [petals, setPetals] = useState<PetalInstance[]>([]);
//   const [celebrateAll, setCelebrateAll] = useState(false);
//   const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
//   const checkResetRef = useRef(false);

//   const darkMode = settings.darkMode;

//   // Auto dark mode based on system preference on first load
//   useEffect(() => {
//     if (!localStorage.getItem('petals-settings')) {
//       const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//       setSettings((s) => ({ ...s, darkMode: prefersDark }));
//     }
//   }, []);

//   // Check for daily reset
//   useEffect(() => {
//     if (checkResetRef.current) return;
//     checkResetRef.current = true;

//     const unfinishedTasks = tasks.filter(
//       (t) => t.status === 'active' && !isExpired(t)
//     );

//     if (
//       unfinishedTasks.length > 0 &&
//       shouldTriggerReset(settings.dailyResetTime, settings.lastResetDate)
//     ) {
//       setResetCandidates(unfinishedTasks);
//       setShowReset(true);
//     }

//     // Move expired tasks to forgotten
//     const now = new Date();
//     let hasExpired = false;
//     const updatedTasks = tasks.map((t) => {
//       if (
//         t.status === 'active' &&
//         t.expiresAt &&
//         now > parseISO(t.expiresAt)
//       ) {
//         hasExpired = true;
//         return { ...t, status: 'forgotten' as const };
//       }
//       return t;
//     });
//     if (hasExpired) setTasks(updatedTasks);
//   }, []);

//   // Compute tree stage from momentum
//   const computedTreeStage = useCallback(() => {
//     const days = settings.momentumDays;
//     if (days >= 21) return 3;
//     if (days >= 10) return 2;
//     if (days >= 3) return 1;
//     return 0;
//   }, [settings.momentumDays]);

//   // Check if all active tasks are completed for celebration
//   const activeTasks = tasks.filter((t) => t.status === 'active');
//   const completedTasks = tasks.filter((t) => t.status === 'completed');
//   const forgottenTasks = tasks.filter((t) => t.status === 'forgotten' || t.status === 'archived');
//   const allDone = activeTasks.length > 0 && activeTasks.every((t) => t.status === 'completed');

//   // Watch for all-done state
//   const prevAllDone = useRef(false);
//   useEffect(() => {
//     if (allDone && !prevAllDone.current) {
//       setCelebrateAll(true);
//       setTimeout(() => setCelebrateAll(false), 7000);
//     }
//     prevAllDone.current = allDone;
//   }, [allDone]);

//   const addPetal = () => {
//     const id = uuidv4();
//     setPetals((prev) => [...prev, { id }]);
//     setTimeout(() => {
//       setPetals((prev) => prev.filter((p) => p.id !== id));
//     }, 4000);
//   };

//   const handleAddTask = (taskData: {
//     text: string;
//     priority: Priority;
//     energyTag: EnergyTag | null;
//     lifespan: TaskLifespan;
//     customLifespanDays?: number;
//   }) => {
//     const newTask: Task = {
//       id: uuidv4(),
//       text: taskData.text,
//       priority: taskData.priority,
//       energyTag: taskData.energyTag,
//       status: 'active',
//       createdAt: new Date().toISOString(),
//       completedAt: null,
//       lifespan: taskData.lifespan,
//       customLifespanDays: taskData.customLifespanDays,
//       expiresAt: getExpiresAt(taskData.lifespan, taskData.customLifespanDays),
//       carryForwardCount: 0,
//     };
//     setTasks((prev) => [newTask, ...prev]);
//   };

//   const handleComplete = (id: string) => {
//     setTasks((prev) =>
//       prev.map((t) =>
//         t.id === id
//           ? { ...t, status: 'completed', completedAt: new Date().toISOString() }
//           : t
//       )
//     );
//     addPetal();

//     // Update momentum
//     const today = getTodayString();
//     if (settings.lastActivityDate !== today) {
//       const newDays = settings.momentumDays + 1;
//       const newStage = newDays >= 21 ? 3 : newDays >= 10 ? 2 : newDays >= 3 ? 1 : 0;
//       setSettings((s) => ({
//         ...s,
//         lastActivityDate: today,
//         momentumDays: newDays,
//         treeStage: newStage,
//       }));
//     }
//   };

//   const handleDelete = (id: string) => {
//     setTasks((prev) => prev.filter((t) => t.id !== id));
//   };

//   const handleArchive = (id: string) => {
//     setTasks((prev) =>
//       prev.map((t) => (t.id === id ? { ...t, status: 'forgotten' } : t))
//     );
//   };

//   const handleResetComplete = (decisions: { taskId: string; action: 'keep' | 'delay' | 'archive' | 'letgo' }[]) => {
//     setTasks((prev) => {
//       const updated = [...prev];
//       decisions.forEach(({ taskId, action }) => {
//         const idx = updated.findIndex((t) => t.id === taskId);
//         if (idx === -1) return;
//         if (action === 'keep') {
//           updated[idx] = { ...updated[idx], carryForwardCount: updated[idx].carryForwardCount + 1 };
//         } else if (action === 'delay') {
//           updated[idx] = {
//             ...updated[idx],
//             carryForwardCount: updated[idx].carryForwardCount + 1,
//             expiresAt: getExpiresAt('1day'),
//           };
//         } else if (action === 'archive') {
//           updated[idx] = { ...updated[idx], status: 'archived' };
//         } else if (action === 'letgo') {
//           updated[idx] = { ...updated[idx], status: 'forgotten' };
//         }
//       });
//       return updated;
//     });

//     setSettings((s) => ({ ...s, lastResetDate: getTodayString() }));
//     setShowReset(false);
//     setResetCandidates([]);
//   };

//   const handleRestoreFromForgotten = (id: string) => {
//     setTasks((prev) =>
//       prev.map((t) =>
//         t.id === id
//           ? { ...t, status: 'active', expiresAt: null, completedAt: null }
//           : t
//       )
//     );
//   };

//   const handlePermanentDelete = (id: string) => {
//     setTasks((prev) => prev.filter((t) => t.id !== id));
//   };

//   const updateSettings = (partial: Partial<AppSettings>) => {
//     setSettings((s) => ({ ...s, ...partial }));
//   };

//   // Filter displayed tasks
//   const displayedTasks = tasks.filter((t) => {
//     if (t.status === 'forgotten' || t.status === 'archived') return false;
//     if (activeFilter === 'active') return t.status === 'active';
//     if (activeFilter === 'completed') return t.status === 'completed';
//     return true;
//   });

//   const treeStage = Math.max(settings.treeStage, computedTreeStage());

//   // Theme classes
//   const appBg = darkMode
//     ? 'bg-[#0f0f1a] text-rose-50'
//     : 'bg-[#fdf8f8] text-slate-800';
//   const headerBg = darkMode
//     ? 'bg-[#0f0f1a]/90'
//     : 'bg-[#fdf8f8]/90';
//   const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
//   const filterActive = darkMode
//     ? 'bg-[#2a1a2e] text-rose-200 border-rose-400/30'
//     : 'bg-rose-100/80 text-rose-600 border-rose-200';
//   const filterInactive = darkMode
//     ? 'text-slate-500 border-transparent hover:text-slate-300'
//     : 'text-slate-400 border-transparent hover:text-slate-600';

//   return (
//     <div
//       className={`min-h-screen transition-colors duration-500 ${appBg}`}
//       style={{ fontFamily: 'Inter, sans-serif' }}
//     >
//       {/* Floating petals from task completion */}
//       {petals.map((p) => (
//         <FloatingPetal key={p.id} />
//       ))}

//       {/* Celebration overlay */}
//       <CelebrationOverlay show={celebrateAll} darkMode={darkMode} />

//       {/* Background ambient blobs */}
//       <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
//         <motion.div
//           className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30"
//           style={{
//             background: darkMode
//               ? 'radial-gradient(circle, #2d1a2a, transparent)'
//               : 'radial-gradient(circle, #fce4ec, transparent)',
//           }}
//           animate={{ scale: [1, 1.05, 1], opacity: [0.25, 0.35, 0.25] }}
//           transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
//         />
//         <motion.div
//           className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-20"
//           style={{
//             background: darkMode
//               ? 'radial-gradient(circle, #1a1a2e, transparent)'
//               : 'radial-gradient(circle, #f8bbd0, transparent)',
//           }}
//           animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
//           transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
//         />
//       </div>

//       {/* Tree — fixed corner companion */}
//       <div className="fixed bottom-0 right-0 w-36 h-52 z-10 pointer-events-none">
//         <CherryBlossomTree
//           stage={treeStage}
//           darkMode={darkMode}
//           celebrateAll={celebrateAll}
//         />
//       </div>

//       {/* Header */}
//       <header
//         className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-colors duration-300 ${headerBg} ${
//           darkMode ? 'border-[#2e2e3e]' : 'border-rose-100/60'
//         }`}
//       >
//         <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <motion.button
//               whileTap={{ scale: 0.92 }}
//               onClick={() => setShowSettings(true)}
//               className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
//                 darkMode ? 'hover:bg-[#2a2a3e] text-slate-400' : 'hover:bg-rose-50 text-slate-400'
//               }`}
//             >
//               <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//                 <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
//                 <path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
//               </svg>
//             </motion.button>
//             <div>
//               <h1
//                 className={`text-[18px] font-light tracking-wide ${
//                   darkMode ? 'text-rose-100' : 'text-slate-700'
//                 }`}
//                 style={{ fontFamily: 'Crimson Pro, serif' }}
//               >
//                 Petals
//               </h1>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             {/* Momentum indicator */}
//             <motion.div
//               className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] ${
//                 darkMode ? 'bg-[#1e1e2e] text-slate-400' : 'bg-rose-50 text-slate-500'
//               }`}
//               title="Days of gentle momentum"
//               animate={{ opacity: [0.7, 1, 0.7] }}
//               transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
//             >
//               <span className="text-[14px]">🌸</span>
//               <span>{settings.momentumDays}d</span>
//             </motion.div>

//             {/* Forgotten drawer button */}
//             <motion.button
//               whileTap={{ scale: 0.92 }}
//               onClick={() => setShowForgottenDrawer(true)}
//               className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] transition-colors ${
//                 darkMode
//                   ? 'bg-[#1e1e2e] text-slate-400 hover:text-slate-300'
//                   : 'bg-rose-50 text-slate-500 hover:text-slate-700'
//               }`}
//             >
//               <span>🗂️</span>
//               {forgottenTasks.length > 0 && (
//                 <span>{forgottenTasks.length}</span>
//               )}
//             </motion.button>

//             {/* Dark mode toggle */}
//             <motion.button
//               whileTap={{ scale: 0.92 }}
//               onClick={() => updateSettings({ darkMode: !darkMode })}
//               className={`w-8 h-8 rounded-full flex items-center justify-center text-[15px] transition-colors ${
//                 darkMode ? 'hover:bg-[#2a2a3e]' : 'hover:bg-rose-50'
//               }`}
//             >
//               {darkMode ? '☀️' : '🌙'}
//             </motion.button>
//           </div>
//         </div>
//       </header>

//       {/* Main content */}
//       <main className="relative z-20 max-w-2xl mx-auto px-4 pt-6 pb-32">
//         {/* Greeting */}
//         <motion.div
//           className="mb-6"
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, ease: 'easeOut' }}
//         >
//           <h2
//             className={`text-[28px] font-light leading-tight ${
//               darkMode ? 'text-rose-100/90' : 'text-slate-700'
//             }`}
//             style={{ fontFamily: 'Crimson Pro, serif' }}
//           >
//             {getGreeting()}
//           </h2>
//             <p className={`text-[14px] mt-1 font-light ${textMuted}`}>
//             {getSubtitle(activeTasks.filter(t => t.status === 'active').length, completedTasks.length)}
//           </p>
//           <div className="mt-3">
//             <AffirmationBar darkMode={darkMode} />
//           </div>
//         </motion.div>

//         {/* Task input */}
//         <motion.div
//           className="mb-5"
//           initial={{ opacity: 0, y: 8 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//         >
//           <TaskInput onAdd={handleAddTask} darkMode={darkMode} />
//         </motion.div>

//         {/* Filters */}
//         {tasks.filter(t => t.status !== 'forgotten' && t.status !== 'archived').length > 0 && (
//           <motion.div
//             className="flex gap-2 mb-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//           >
//             {(['all', 'active', 'completed'] as const).map((filter) => (
//               <motion.button
//                 key={filter}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => setActiveFilter(filter)}
//                 className={`px-3 py-1 rounded-full text-[12px] border transition-all capitalize ${
//                   activeFilter === filter ? filterActive : filterInactive
//                 }`}
//               >
//                 {filter}
//               </motion.button>
//             ))}
//           </motion.div>
//         )}

//         {/* Task list */}
//         <div className="space-y-2">
//           <AnimatePresence mode="popLayout">
//             {displayedTasks.length === 0 ? (
//               <motion.div
//                 key="empty"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="py-16 text-center"
//               >
//                 <motion.div
//                   className="text-5xl mb-4 opacity-50"
//                   animate={{ y: [0, -6, 0] }}
//                   transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
//                 >
//                   🌸
//                 </motion.div>
//                 <p
//                   className={`text-[18px] font-light ${
//                     darkMode ? 'text-rose-100/50' : 'text-slate-400'
//                   }`}
//                   style={{ fontFamily: 'Crimson Pro, serif' }}
//                 >
//                   {activeFilter === 'completed'
//                     ? 'Nothing completed yet today'
//                     : 'Your space is clear'}
//                 </p>
//                 <p className={`text-[13px] mt-1 ${textMuted}`}>
//                   {activeFilter === 'completed'
//                     ? 'Complete a task to see it here'
//                     : 'Add something gently to your mind'}
//                 </p>
//               </motion.div>
//             ) : (
//               displayedTasks.map((task) => (
//                 <TaskItem
//                   key={task.id}
//                   task={task}
//                   darkMode={darkMode}
//                   onComplete={handleComplete}
//                   onDelete={handleDelete}
//                   onArchive={handleArchive}
//                 />
//               ))
//             )}
//           </AnimatePresence>
//         </div>

//         {/* Progress bar */}
//         {tasks.filter(t => t.status !== 'forgotten' && t.status !== 'archived').length > 0 && (
//           <motion.div
//             className="mt-6"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.4 }}
//           >
//             <div className="flex items-center justify-between mb-1.5">
//               <span className={`text-[11px] uppercase tracking-widest ${textMuted}`}>
//                 Today's flow
//               </span>
//               <span className={`text-[11px] ${textMuted}`}>
//                 {completedTasks.length} / {activeTasks.length + completedTasks.length}
//               </span>
//             </div>
//             <div
//               className="h-1 rounded-full overflow-hidden"
//               style={{ background: darkMode ? '#2e2e3e' : '#f0e0e8' }}
//             >
//               <motion.div
//                 className="h-full rounded-full"
//                 style={{
//                   background: 'linear-gradient(90deg, #f4b8c8, #e8a0b8)',
//                 }}
//                 initial={{ width: 0 }}
//                 animate={{
//                   width: `${
//                     (activeTasks.length + completedTasks.length) > 0
//                       ? (completedTasks.length / (activeTasks.length + completedTasks.length)) * 100
//                       : 0
//                   }%`,
//                 }}
//                 transition={{ duration: 0.8, ease: 'easeOut' }}
//               />
//             </div>
//           </motion.div>
//         )}

//         {/* All done message */}
//         <AnimatePresence>
//           {allDone && (
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               className="mt-8 text-center"
//             >
//               <p
//                 className={`text-[16px] font-light italic ${
//                   darkMode ? 'text-rose-300/60' : 'text-rose-400/70'
//                 }`}
//                 style={{ fontFamily: 'Crimson Pro, serif' }}
//               >
//                 All done. Rest easy. ✨
//               </p>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </main>

//       {/* Modals & Drawers */}
//       <AnimatePresence>
//         {showReset && resetCandidates.length > 0 && (
//           <DailyResetModal
//             key="reset"
//             tasks={resetCandidates}
//             darkMode={darkMode}
//             onComplete={handleResetComplete}
//           />
//         )}
//       </AnimatePresence>

//       <ForgottenDrawer
//         tasks={forgottenTasks}
//         darkMode={darkMode}
//         isOpen={showForgottenDrawer}
//         onClose={() => setShowForgottenDrawer(false)}
//         onRestore={handleRestoreFromForgotten}
//         onPermanentDelete={handlePermanentDelete}
//       />

//       <SettingsPanel
//         settings={settings}
//         onUpdate={updateSettings}
//         darkMode={darkMode}
//         isOpen={showSettings}
//         onClose={() => setShowSettings(false)}
//         taskCount={{
//           active: activeTasks.filter(t => t.status === 'active').length,
//           completed: completedTasks.length,
//           forgotten: forgottenTasks.length,
//         }}
//       />

//       {/* Bottom ambient footer */}
//       <div className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none">
//         <div
//           className="h-20"
//           style={{
//             background: darkMode
//               ? 'linear-gradient(to top, rgba(15,15,26,0.9), transparent)'
//               : 'linear-gradient(to top, rgba(253,248,248,0.9), transparent)',
//           }}
//         />
//       </div>

//       {/* Subtle breathing dot — bottom left */}
//       <motion.div
//         className="fixed bottom-5 left-5 z-20 pointer-events-none"
//         animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
//         transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
//       >
//         <div
//           className="w-2 h-2 rounded-full"
//           style={{ background: darkMode ? '#f4b8c840' : '#e8a0b850' }}
//         />
//       </motion.div>
//     </div>
//   );
// }

// function getGreeting(): string {
//   const hour = new Date().getHours();
//   if (hour < 5) return 'Quiet night…';
//   if (hour < 12) return 'Good morning ☁️';
//   if (hour < 17) return 'Good afternoon 🌤';
//   if (hour < 21) return 'Good evening 🌅';
//   return 'Good night 🌙';
// }

// function getSubtitle(activeCount: number, completedCount: number): string {
//   if (activeCount === 0 && completedCount === 0) {
//     return 'What would you like to carry today?';
//   }
//   if (activeCount === 0) {
//     return `All ${completedCount} things done — beautifully.`;
//   }
//   if (completedCount === 0) {
//     return `${activeCount} thing${activeCount > 1 ? 's' : ''} gently waiting.`;
//   }
//   return `${completedCount} done · ${activeCount} remaining`;
// }
