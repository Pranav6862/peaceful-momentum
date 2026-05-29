import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationOverlayProps {
  show: boolean;
  darkMode: boolean;
}

const STAR_POSITIONS = [
  { x: 15, y: 20 }, { x: 30, y: 10 }, { x: 50, y: 15 },
  { x: 70, y: 8 }, { x: 85, y: 22 }, { x: 20, y: 40 },
  { x: 80, y: 38 }, { x: 45, y: 5 }, { x: 60, y: 30 },
  { x: 10, y: 55 }, { x: 90, y: 55 }, { x: 35, y: 50 },
];

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ show, darkMode }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-10 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          {/* Sunrise glow */}
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: '40%',
              background: darkMode
                ? 'radial-gradient(ellipse at 50% 100%, rgba(240,160,140,0.18) 0%, rgba(200,100,120,0.08) 50%, transparent 80%)'
                : 'radial-gradient(ellipse at 50% 100%, rgba(255,200,180,0.4) 0%, rgba(255,160,180,0.2) 50%, transparent 80%)',
            }}
            animate={{ opacity: [0, 1, 0.7, 1, 0] }}
            transition={{ duration: 6, ease: 'easeInOut' }}
          />

          {/* Stars */}
          {STAR_POSITIONS.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.8, 0.4, 0.9, 0],
                scale: [0, 1, 0.7, 1.1, 0],
              }}
              transition={{
                duration: 4,
                delay: i * 0.25,
                ease: 'easeInOut',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8L6 0Z"
                  fill={darkMode ? '#f9d0dc' : '#f4b8c8'}
                  opacity="0.9"
                />
              </svg>
            </motion.div>
          ))}

          {/* Ambient glow */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: darkMode
                ? 'radial-gradient(circle at 50% 60%, rgba(244,184,200,0.06) 0%, transparent 60%)'
                : 'radial-gradient(circle at 50% 60%, rgba(255,220,230,0.3) 0%, transparent 60%)',
            }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 5, ease: 'easeInOut' }}
          />

          {/* Message */}
          <motion.div
            className="absolute inset-x-0 top-1/3 flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
            transition={{ duration: 4, delay: 0.5 }}
          >
            <p
              className={`text-[22px] font-light ${darkMode ? 'text-rose-200/90' : 'text-rose-400'}`}
              style={{ fontFamily: 'Crimson Pro, serif' }}
            >
              All done for now ✨
            </p>
            <p
              className={`text-[14px] font-light ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Rest easy. You showed up.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
