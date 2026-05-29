import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AFFIRMATIONS = [
  'Small steps still move you forward.',
  'You don\'t have to do everything today.',
  'Progress, not perfection.',
  'Rest is productive too.',
  'Being consistent beats being perfect.',
  'You are allowed to go slowly.',
  'Every small thing you finish is a win.',
  'Your energy is worth protecting.',
  'One thing at a time, gently.',
  'It\'s okay to carry less.',
  'You showed up. That matters.',
  'Patience is a form of care.',
];

interface AffirmationBarProps {
  darkMode: boolean;
}

export const AffirmationBar: React.FC<AffirmationBarProps> = ({ darkMode }) => {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * AFFIRMATIONS.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % AFFIRMATIONS.length);
        setVisible(true);
      }, 700);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-6 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className={`text-[12px] font-light italic text-center px-4 ${
              darkMode ? 'text-slate-500' : 'text-slate-400'
            }`}
            style={{ fontFamily: 'Crimson Pro, serif' }}
          >
            {AFFIRMATIONS[index]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
