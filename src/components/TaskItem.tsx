// src/components/TaskItem.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import {
  getPriorityColor,
  getAgingOpacity,
  getAgingTint,
  formatRelativeDate,
  isExpired,
} from '../utils/taskUtils';

interface TaskItemProps {
  task: Task;
  darkMode: boolean;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  darkMode,
  onComplete,
  onDelete,
  onArchive,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const aging = getAgingOpacity(task);
  const tint = getAgingTint(task);
  const expired = isExpired(task);
  const isCompleted = task.status === 'completed';

  // Priority visual weight system
  // High: full presence, soft rose left accent
  // Medium: calm baseline, no accent
  // Low: slightly airy, softer opacity
  const priorityOpacity =
    isCompleted
      ? 1 // let completed style handle opacity
      : task.priority === 'low'
      ? 0.82
      : 1;

  const priorityLeftAccent =
    !isCompleted && task.priority === 'high'
      ? darkMode
        ? 'border-l-2 border-l-rose-400/50'
        : 'border-l-2 border-l-rose-300/70'
      : 'border-l-2 border-l-transparent';

  // Aging background tint
  const agingTintColor = darkMode
    ? `rgba(180, 140, 60, ${tint * 0.08})`
    : `rgba(240, 210, 120, ${tint * 0.12})`;

  const baseBg = darkMode
    ? 'bg-[#1e1e2e] border-[#2e2e3e]'
    : 'bg-white/80 border-rose-100/50';

  const completedStyle = isCompleted
    ? darkMode
      ? 'opacity-50'
      : 'opacity-45'
    : '';

  const handleComplete = () => {
    if (isCompleted) return;
    onComplete(task.id);
  };

  const handleDelete = () => {
    setIsLeaving(true);
    setTimeout(() => onDelete(task.id), 300);
  };

  const handleArchive = () => {
    setIsLeaving(true);
    setTimeout(() => onArchive(task.id), 300);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{
        opacity: isLeaving ? 0 : aging * priorityOpacity,
        y: 0,
        scale: isLeaving ? 0.96 : 1,
        x: isLeaving ? -20 : 0,
      }}
      exit={{ opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.25 } }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        relative rounded-2xl border backdrop-blur-sm overflow-hidden
        transition-colors duration-300
        ${baseBg}
        ${completedStyle}
        ${priorityLeftAccent}
      `}
      style={{ backgroundColor: agingTintColor || undefined }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onTouchStart={() => setShowActions(true)}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Checkbox */}
        <motion.button
          type="button"
          className="flex-shrink-0 mt-0.5"
          onClick={handleComplete}
          whileTap={{ scale: 0.85 }}
        >
          <motion.div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              isCompleted
                ? 'border-rose-300 bg-rose-300/80'
                : darkMode
                ? 'border-[#4a4a5e] hover:border-rose-400'
                : 'border-rose-200 hover:border-rose-400'
            }`}
          >
            <AnimatePresence>
              {isCompleted && (
                <motion.svg
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  width="10"
                  height="8"
                  viewBox="0 0 10 8"
                  fill="none"
                >
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            {/* Priority dot */}
            <span
              className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            />
            {/* Text */}
            <p
              className={`
                text-[14px] leading-relaxed flex-1
                transition-all duration-500
                ${task.priority === 'high' && !isCompleted
                  ? 'font-normal'
                  : 'font-light'
                }
                ${isCompleted
                  ? darkMode
                    ? 'line-through text-slate-500'
                    : 'line-through text-slate-400'
                  : task.priority === 'low'
                  ? darkMode
                    ? 'text-rose-50/70'
                    : 'text-slate-500'
                  : darkMode
                  ? 'text-rose-50'
                  : 'text-slate-700'
                }
              `}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {task.text}
            </p>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {task.energyTag && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  darkMode
                    ? 'bg-[#2a2a3e] text-slate-400'
                    : 'bg-rose-50 text-slate-500'
                }`}
              >
                {task.energyTag}
              </span>
            )}
            <span
              className={`text-[11px] ${
                darkMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {formatRelativeDate(task.createdAt)}
            </span>
            {expired && !isCompleted && (
              <span className="text-[11px] text-amber-400/80 italic">
                expired
              </span>
            )}
            {task.carryForwardCount > 0 && (
              <span
                className={`text-[11px] italic ${
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                carried ×{task.carryForwardCount}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1 flex-shrink-0"
            >
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleArchive}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] transition-colors ${
                  darkMode
                    ? 'hover:bg-[#2a2a3e] text-slate-400 hover:text-slate-300'
                    : 'hover:bg-rose-50 text-slate-400 hover:text-slate-600'
                }`}
                title="Archive"
              >
                📁
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleDelete}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] transition-colors ${
                  darkMode
                    ? 'hover:bg-[#2a2a3e] text-slate-400 hover:text-rose-400'
                    : 'hover:bg-rose-50 text-slate-400 hover:text-rose-400'
                }`}
                title="Let go"
              >
                ×
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Task } from '../types';
// import {
//   getPriorityColor,
//   getAgingOpacity,
//   getAgingTint,
//   formatRelativeDate,
//   isExpired,
// } from '../utils/taskUtils';

// interface TaskItemProps {
//   task: Task;
//   darkMode: boolean;
//   onComplete: (id: string) => void;
//   onDelete: (id: string) => void;
//   onArchive: (id: string) => void;
// }

// export const TaskItem: React.FC<TaskItemProps> = ({
//   task,
//   darkMode,
//   onComplete,
//   onDelete,
//   onArchive,
// }) => {
//   const [showActions, setShowActions] = useState(false);
//   const [isLeaving, setIsLeaving] = useState(false);

//   const aging = getAgingOpacity(task);
//   const tint = getAgingTint(task);
//   const expired = isExpired(task);
//   const isCompleted = task.status === 'completed';

//   // Compute aging background tint
//   const agingTintColor = darkMode
//     ? `rgba(180, 140, 60, ${tint * 0.08})`
//     : `rgba(240, 210, 120, ${tint * 0.12})`;

//   const baseBg = darkMode
//     ? 'bg-[#1e1e2e] border-[#2e2e3e]'
//     : 'bg-white/80 border-rose-100/50';

//   const completedStyle = isCompleted
//     ? darkMode
//       ? 'opacity-50'
//       : 'opacity-45'
//     : '';

//   const handleComplete = () => {
//     if (isCompleted) return;
//     onComplete(task.id);
//   };

//   const handleDelete = () => {
//     setIsLeaving(true);
//     setTimeout(() => onDelete(task.id), 300);
//   };

//   const handleArchive = () => {
//     setIsLeaving(true);
//     setTimeout(() => onArchive(task.id), 300);
//   };

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 12, scale: 0.98 }}
//       animate={{
//         opacity: isLeaving ? 0 : aging,
//         y: 0,
//         scale: isLeaving ? 0.96 : 1,
//         x: isLeaving ? -20 : 0,
//       }}
//       exit={{ opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.25 } }}
//       transition={{ duration: 0.3, ease: 'easeOut' }}
//       className={`relative rounded-2xl border backdrop-blur-sm overflow-hidden transition-colors duration-300 ${baseBg} ${completedStyle}`}
//       style={{ backgroundColor: agingTintColor || undefined }}
//       onMouseEnter={() => setShowActions(true)}
//       onMouseLeave={() => setShowActions(false)}
//       onTouchStart={() => setShowActions(true)}
//     >
//       <div className="flex items-start gap-3 px-4 py-3.5">
//         {/* Checkbox */}
//         <motion.button
//           type="button"
//           className="flex-shrink-0 mt-0.5"
//           onClick={handleComplete}
//           whileTap={{ scale: 0.85 }}
//         >
//           <motion.div
//             className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
//               isCompleted
//                 ? 'border-rose-300 bg-rose-300/80'
//                 : darkMode
//                 ? 'border-[#4a4a5e] hover:border-rose-400'
//                 : 'border-rose-200 hover:border-rose-400'
//             }`}
//           >
//             <AnimatePresence>
//               {isCompleted && (
//                 <motion.svg
//                   initial={{ scale: 0, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   exit={{ scale: 0, opacity: 0 }}
//                   transition={{ type: 'spring', stiffness: 400, damping: 20 }}
//                   width="10"
//                   height="8"
//                   viewBox="0 0 10 8"
//                   fill="none"
//                 >
//                   <path
//                     d="M1 4L3.5 6.5L9 1"
//                     stroke="white"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                 </motion.svg>
//               )}
//             </AnimatePresence>
//           </motion.div>
//         </motion.button>

//         {/* Content */}
//         <div className="flex-1 min-w-0">
//           <div className="flex items-start gap-2 flex-wrap">
//             {/* Priority dot */}
//             <span
//               className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
//               style={{ backgroundColor: getPriorityColor(task.priority) }}
//             />
//             {/* Text */}
//             <p
//               className={`text-[14px] leading-relaxed font-light flex-1 transition-all duration-500 ${
//                 isCompleted
//                   ? darkMode
//                     ? 'line-through text-slate-500'
//                     : 'line-through text-slate-400'
//                   : darkMode
//                   ? 'text-rose-50'
//                   : 'text-slate-700'
//               }`}
//               style={{ fontFamily: 'Inter, sans-serif' }}
//             >
//               {task.text}
//             </p>
//           </div>

//           {/* Meta row */}
//           <div className="flex items-center gap-2 mt-1.5 flex-wrap">
//             {task.energyTag && (
//               <span
//                 className={`text-[11px] px-2 py-0.5 rounded-full ${
//                   darkMode ? 'bg-[#2a2a3e] text-slate-400' : 'bg-rose-50 text-slate-500'
//                 }`}
//               >
//                 {task.energyTag}
//               </span>
//             )}
//             <span
//               className={`text-[11px] ${
//                 darkMode ? 'text-slate-500' : 'text-slate-400'
//               }`}
//             >
//               {formatRelativeDate(task.createdAt)}
//             </span>
//             {expired && !isCompleted && (
//               <span className="text-[11px] text-amber-400/80 italic">expired</span>
//             )}
//             {task.carryForwardCount > 0 && (
//               <span
//                 className={`text-[11px] italic ${
//                   darkMode ? 'text-slate-500' : 'text-slate-400'
//                 }`}
//               >
//                 carried ×{task.carryForwardCount}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Actions */}
//         <AnimatePresence>
//           {showActions && (
//             <motion.div
//               initial={{ opacity: 0, x: 8 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: 8 }}
//               transition={{ duration: 0.15 }}
//               className="flex items-center gap-1 flex-shrink-0"
//             >
//               <motion.button
//                 whileTap={{ scale: 0.85 }}
//                 onClick={handleArchive}
//                 className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] transition-colors ${
//                   darkMode
//                     ? 'hover:bg-[#2a2a3e] text-slate-400 hover:text-slate-300'
//                     : 'hover:bg-rose-50 text-slate-400 hover:text-slate-600'
//                 }`}
//                 title="Archive"
//               >
//                 📁
//               </motion.button>
//               <motion.button
//                 whileTap={{ scale: 0.85 }}
//                 onClick={handleDelete}
//                 className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] transition-colors ${
//                   darkMode
//                     ? 'hover:bg-[#2a2a3e] text-slate-400 hover:text-rose-400'
//                     : 'hover:bg-rose-50 text-slate-400 hover:text-rose-400'
//                 }`}
//                 title="Let go"
//               >
//                 ×
//               </motion.button>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </motion.div>
//   );
// };
