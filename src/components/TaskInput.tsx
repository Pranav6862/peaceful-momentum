import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Priority, EnergyTag, TaskLifespan } from '../types';
import { getPriorityColor } from '../utils/taskUtils';

interface TaskInputProps {
  onAdd: (task: {
    text: string;
    priority: Priority;
    energyTag: EnergyTag | null;
    lifespan: TaskLifespan;
    customLifespanDays?: number;
  }) => void;
  darkMode: boolean;
}

const ENERGY_TAGS: EnergyTag[] = [
  '⚡ High Energy',
  '🌙 Low Energy',
  '🧠 Deep Focus',
  '⏱ Quick Task',
  '🎨 Creative',
  '📦 Admin',
];

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const LIFESPANS: { value: TaskLifespan; label: string }[] = [
  { value: 'none', label: 'No expiry' },
  { value: '1day', label: '1 day' },
  { value: '3days', label: '3 days' },
  { value: '1week', label: '1 week' },
  { value: 'custom', label: 'Custom' },
];

export const TaskInput: React.FC<TaskInputProps> = ({ onAdd, darkMode }) => {
  const [text, setText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [priority, setPriority] = useState<Priority>('medium');
  const [energyTag, setEnergyTag] = useState<EnergyTag | null>(null);
  const [lifespan, setLifespan] = useState<TaskLifespan>('none');
  const [customDays, setCustomDays] = useState(5);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({
      text: text.trim(),
      priority,
      energyTag,
      lifespan,
      customLifespanDays: lifespan === 'custom' ? customDays : undefined,
    });
    setText('');
    setExpanded(false);
    setEnergyTag(null);
    setPriority('medium');
    setLifespan('none');
  };

  const bg = darkMode
    ? 'bg-[#1e1e2e] border-[#2e2e3e]'
    : 'bg-white/80 border-rose-100/60';
  const textColor = darkMode ? 'text-rose-100' : 'text-slate-700';
  const mutedColor = darkMode ? 'text-slate-400' : 'text-slate-400';
  const inputBg = darkMode ? 'bg-transparent' : 'bg-transparent';
  const pillBg = darkMode ? 'bg-[#2a2a3e]' : 'bg-rose-50/80';
  const pillActive = darkMode ? 'bg-[#3a2a3e] border-rose-400/60' : 'bg-rose-100 border-rose-300';
  const pillInactive = darkMode ? 'border-[#3a3a4e]' : 'border-rose-100';

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`rounded-2xl border backdrop-blur-sm shadow-sm transition-all duration-300 ${bg}`}
      layout
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Priority dot */}
        <motion.button
          type="button"
          className="flex-shrink-0 w-3.5 h-3.5 rounded-full ring-2 ring-offset-1 transition-all"
          style={{
            backgroundColor: getPriorityColor(priority),
            outlineColor: getPriorityColor(priority),
          }}
          onClick={() => {
            const idx = PRIORITIES.indexOf(priority);
            setPriority(PRIORITIES[(idx + 1) % PRIORITIES.length]);
          }}
          title="Cycle priority"
          whileTap={{ scale: 0.8 }}
        />

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="What's gently on your mind…"
          className={`flex-1 text-[15px] font-light outline-none placeholder:opacity-40 ${inputBg} ${textColor}`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        />

        <AnimatePresence>
          {text.trim() && (
            <motion.button
              type="submit"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.9 }}
              className="flex-shrink-0 w-7 h-7 rounded-full bg-rose-300/80 flex items-center justify-center text-white text-sm"
            >
              ↩
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Divider */}
              <div className={`h-px ${darkMode ? 'bg-white/5' : 'bg-rose-100/60'}`} />

              {/* Priority */}
              <div>
                <p className={`text-[11px] uppercase tracking-widest mb-2 ${mutedColor}`}>Priority</p>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <motion.button
                      key={p}
                      type="button"
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setPriority(p)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] border transition-all ${
                        priority === p ? pillActive : `${pillBg} ${pillInactive}`
                      } ${textColor}`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getPriorityColor(p) }}
                      />
                      {p}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Energy tag */}
              <div>
                <p className={`text-[11px] uppercase tracking-widest mb-2 ${mutedColor}`}>Energy</p>
                <div className="flex flex-wrap gap-1.5">
                  {ENERGY_TAGS.map((tag) => (
                    <motion.button
                      key={tag}
                      type="button"
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setEnergyTag(energyTag === tag ? null : tag)}
                      className={`px-2.5 py-1 rounded-full text-[12px] border transition-all ${
                        energyTag === tag ? pillActive : `${pillBg} ${pillInactive}`
                      } ${textColor}`}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Lifespan */}
              <div>
                <p className={`text-[11px] uppercase tracking-widest mb-2 ${mutedColor}`}>Lifespan</p>
                <div className="flex flex-wrap gap-1.5">
                  {LIFESPANS.map((ls) => (
                    <motion.button
                      key={ls.value}
                      type="button"
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setLifespan(ls.value)}
                      className={`px-2.5 py-1 rounded-full text-[12px] border transition-all ${
                        lifespan === ls.value ? pillActive : `${pillBg} ${pillInactive}`
                      } ${textColor}`}
                    >
                      {ls.label}
                    </motion.button>
                  ))}
                </div>
                {lifespan === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 mt-2"
                  >
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={customDays}
                      onChange={(e) => setCustomDays(Number(e.target.value))}
                      className="flex-1 accent-rose-300"
                    />
                    <span className={`text-[12px] w-16 ${mutedColor}`}>{customDays} days</span>
                  </motion.div>
                )}
              </div>

              {/* Cancel */}
              <button
                type="button"
                onClick={() => { setExpanded(false); setText(''); }}
                className={`text-[12px] ${mutedColor} hover:opacity-80 transition-opacity`}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
};
