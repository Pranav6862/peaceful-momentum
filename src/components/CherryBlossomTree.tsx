// src/components/CherryBlossomTree.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  drift: number;
}

interface CherryBlossomTreeProps {
  stage: number;
  darkMode: boolean;
  celebrateAll?: boolean;
}

const PETAL_COLORS = ['#f4b8c8', '#f9d0dc', '#e8a0b8', '#fbc4d4', '#f0aac0'];

function generateAmbientPetals(count: number): Petal[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 6,
    size: 4 + Math.random() * 5,
    color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    drift: (Math.random() - 0.5) * 50,
  }));
}

export const CherryBlossomTree: React.FC<CherryBlossomTreeProps> = ({
  stage,
  darkMode,
  celebrateAll = false,
}) => {
  const [ambientPetals] = useState(() => generateAmbientPetals(12));
  const [celebrationPetals, setCelebrationPetals] = useState<Petal[]>([]);

  useEffect(() => {
    if (celebrateAll) {
      const petals = Array.from({ length: 20 }, (_, i) => ({
        id: 1000 + i,
        x: 5 + Math.random() * 90,
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 4,
        size: 5 + Math.random() * 7,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        drift: (Math.random() - 0.5) * 80,
      }));
      setCelebrationPetals(petals);
      const t = setTimeout(() => setCelebrationPetals([]), 8000);
      return () => clearTimeout(t);
    }
  }, [celebrateAll]);

  const trunkColor = darkMode ? '#6b4c3b' : '#8b6350';
  const branchColor = darkMode ? '#7a5540' : '#9c7060';

  // Organic spring transition for branch growth
  const branchSpring = {
    type: 'spring' as const,
    stiffness: 40,
    damping: 18,
  };

  // Very slow sway for ambient life
  const swayTransition = {
    duration: 6,
    repeat: Infinity,
    repeatType: 'mirror' as const,
    ease: 'easeInOut' as const,
  };

  return (
    <div className="relative w-full h-full select-none pointer-events-none overflow-hidden">

      {/* Ambient floating petals - only stage 2+ */}
      {stage >= 2 && (
        <AnimatePresence>
          {ambientPetals.map((petal) => (
            <motion.div
              key={petal.id}
              className="absolute opacity-60"
              style={{
                left: `${petal.x}%`,
                top: '-5%',
                width: petal.size,
                height: petal.size * 0.7,
                background: `radial-gradient(ellipse, ${petal.color}, ${petal.color}88)`,
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              }}
              animate={{
                y: ['0vh', '108vh'],
                x: [0, petal.drift],
                rotate: [0, 280 * (petal.drift > 0 ? 1 : -1)],
                opacity: [0, 0.65, 0.5, 0.3, 0],
              }}
              transition={{
                duration: petal.duration,
                delay: petal.delay,
                repeat: Infinity,
                // Each petal has its own unique repeatDelay
                // so they never feel synchronized or mechanical
                repeatDelay: petal.delay * 0.8 + 3,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />
          ))}
        </AnimatePresence>
      )}

      {/* Celebration petals */}
      <AnimatePresence>
        {celebrationPetals.map((petal) => (
          <motion.div
            key={petal.id}
            className="absolute"
            style={{
              left: `${petal.x}%`,
              top: '-5%',
              width: petal.size,
              height: petal.size * 0.7,
              background: `radial-gradient(ellipse, ${petal.color}, ${petal.color}88)`,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            }}
            initial={{ y: 0, opacity: 0, rotate: 0 }}
            animate={{
              y: '110vh',
              x: [0, petal.drift],
              rotate: [0, 540 * (petal.drift > 0 ? 1 : -1)],
              opacity: [0, 0.9, 0.7, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: petal.duration,
              delay: petal.delay,
              ease: 'easeIn',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Tree SVG */}
      <svg
        viewBox="0 0 120 160"
        className="absolute bottom-0 right-0 w-28 h-40 md:w-36 md:h-48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Trunk — draws itself slowly */}
        <motion.path
          d="M60 160 C60 140 58 120 57 100 C56 85 58 72 60 60"
          stroke={trunkColor}
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 2, ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: 0.4 },
          }}
        />

        {/* Left main branch group — gentle sway */}
        <motion.g
          style={{ transformOrigin: '60px 90px' }}
          animate={{ rotate: [-0.4, 0.4] }}
          transition={{ ...swayTransition, delay: 0 }}
        >
          <motion.path
            d="M60 90 C50 78 38 68 25 62"
            stroke={branchColor}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ ...branchSpring, delay: 0.6 }}
          />
          <motion.path
            d="M25 62 C18 55 12 48 8 40"
            stroke={branchColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ ...branchSpring, delay: 1.0 }}
          />
          <motion.path
            d="M25 62 C22 52 24 44 28 36"
            stroke={branchColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ ...branchSpring, delay: 1.2 }}
          />
        </motion.g>

        {/* Right main branch group — gentle sway opposite phase */}
        <motion.g
          style={{ transformOrigin: '60px 80px' }}
          animate={{ rotate: [0.4, -0.4] }}
          transition={{ ...swayTransition, delay: 1.5 }}
        >
          <motion.path
            d="M60 80 C70 68 82 60 95 55"
            stroke={branchColor}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ ...branchSpring, delay: 0.8 }}
          />
          <motion.path
            d="M95 55 C100 46 104 38 108 30"
            stroke={branchColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ ...branchSpring, delay: 1.1 }}
          />
          <motion.path
            d="M95 55 C90 46 90 36 88 28"
            stroke={branchColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ ...branchSpring, delay: 1.3 }}
          />
        </motion.g>

        {/* Center branch — slight independent sway */}
        <motion.g
          style={{ transformOrigin: '60px 70px' }}
          animate={{ rotate: [-0.3, 0.3] }}
          transition={{ ...swayTransition, delay: 3 }}
        >
          <motion.path
            d="M60 70 C62 58 64 50 66 40"
            stroke={branchColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ ...branchSpring, delay: 0.9 }}
          />
        </motion.g>

        {/* Stage 1 Blossoms — bud to bloom feel */}
        {stage >= 1 && (
          <g>
            {[
              { cx: 8, cy: 38, r: 6 },
              { cx: 28, cy: 34, r: 7 },
              { cx: 66, cy: 38, r: 6 },
              { cx: 88, cy: 26, r: 5 },
              { cx: 108, cy: 28, r: 6 },
            ].map((blossom, i) => (
              <motion.circle
                key={i}
                cx={blossom.cx}
                cy={blossom.cy}
                r={blossom.r}
                fill="#f4b8c888"
                stroke="#e8a0b8"
                strokeWidth="0.5"
                initial={{ scale: 0, opacity: 0, filter: 'blur(4px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                transition={{
                  scale: {
                    type: 'spring',
                    stiffness: 60,
                    damping: 12,
                    delay: 1.6 + i * 0.18,
                  },
                  opacity: { duration: 0.8, delay: 1.6 + i * 0.18 },
                  filter: { duration: 1.2, delay: 1.6 + i * 0.18 },
                }}
              />
            ))}
          </g>
        )}

        {/* Stage 2 Fuller bloom */}
        {stage >= 2 && (
          <g>
            {[
              { cx: 18, cy: 45, r: 8 },
              { cx: 40, cy: 35, r: 9 },
              { cx: 75, cy: 45, r: 8 },
              { cx: 100, cy: 42, r: 7 },
              { cx: 55, cy: 55, r: 6 },
              { cx: 15, cy: 30, r: 5 },
            ].map((blossom, i) => (
              <motion.circle
                key={i}
                cx={blossom.cx}
                cy={blossom.cy}
                r={blossom.r}
                fill="#f9d0dc99"
                stroke="#f4b8c8"
                strokeWidth="0.5"
                initial={{ scale: 0, opacity: 0, filter: 'blur(6px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                transition={{
                  scale: {
                    type: 'spring',
                    stiffness: 50,
                    damping: 14,
                    delay: 1.8 + i * 0.15,
                  },
                  opacity: { duration: 1, delay: 1.8 + i * 0.15 },
                  filter: { duration: 1.4, delay: 1.8 + i * 0.15 },
                }}
              />
            ))}
          </g>
        )}

        {/* Petal dots — bloom after blossoms */}
        {stage >= 1 && (
          <g>
            {[
              { x: 8, y: 36 }, { x: 29, y: 32 }, { x: 67, y: 36 },
              { x: 88, y: 25 }, { x: 108, y: 27 },
            ].map((dot, i) => (
              <motion.circle
                key={i}
                cx={dot.x}
                cy={dot.y}
                r={1}
                fill="#c06080"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.8, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 2.2 + i * 0.1,
                  type: 'spring',
                  stiffness: 80,
                }}
              />
            ))}
          </g>
        )}
      </svg>

      {/* Breathing glow behind tree when celebrating */}
      {celebrateAll && (
        <motion.div
          className="absolute bottom-0 right-0 w-48 h-48 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(244,184,200,0.25) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
};

interface FloatingPetalProps {
  onComplete?: () => void;
}

export const FloatingPetal: React.FC<FloatingPetalProps> = ({ onComplete }) => {
  const x = 15 + Math.random() * 70;
  const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
  const size = 7 + Math.random() * 7;
  const drift = (Math.random() - 0.5) * 120;

  return (
    <motion.div
      className="fixed z-50 pointer-events-none"
      style={{
        left: `${x}%`,
        top: '10%',
        width: size,
        height: size * 0.7,
        background: `radial-gradient(ellipse, ${color}, ${color}99)`,
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
      }}
      initial={{ y: 0, opacity: 0, rotate: 0, x: 0 }}
      animate={{
        y: '85vh',
        x: drift,
        rotate: 360 * (drift > 0 ? 1 : -1),
        opacity: [0, 0.9, 0.8, 0],
      }}
      transition={{
        duration: 4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onAnimationComplete={onComplete}
    />
  );
};

// import React, { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// interface Petal {
//   id: number;
//   x: number;
//   delay: number;
//   duration: number;
//   size: number;
//   color: string;
// }

// interface CherryBlossomTreeProps {
//   stage: number; // 0=bare, 1=small blossoms, 2=fuller bloom, 3=drifting petals
//   darkMode: boolean;
//   celebrateAll?: boolean;
// }

// const PETAL_COLORS = ['#f4b8c8', '#f9d0dc', '#e8a0b8', '#fbc4d4', '#f0aac0'];

// function generateAmbientPetals(count: number): Petal[] {
//   return Array.from({ length: count }, (_, i) => ({
//     id: i,
//     x: 10 + Math.random() * 80,
//     delay: Math.random() * 6,
//     duration: 5 + Math.random() * 5,
//     size: 4 + Math.random() * 5,
//     color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
//   }));
// }

// export const CherryBlossomTree: React.FC<CherryBlossomTreeProps> = ({
//   stage,
//   darkMode,
//   celebrateAll = false,
// }) => {
//   const [ambientPetals] = useState(() => generateAmbientPetals(12));
//   const [celebrationPetals, setCelebrationPetals] = useState<Petal[]>([]);

//   useEffect(() => {
//     if (celebrateAll) {
//       const petals = Array.from({ length: 20 }, (_, i) => ({
//         id: 1000 + i,
//         x: 5 + Math.random() * 90,
//         delay: Math.random() * 3,
//         duration: 4 + Math.random() * 4,
//         size: 5 + Math.random() * 7,
//         color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
//       }));
//       setCelebrationPetals(petals);
//       const t = setTimeout(() => setCelebrationPetals([]), 8000);
//       return () => clearTimeout(t);
//     }
//   }, [celebrateAll]);

//   const trunkColor = darkMode ? '#6b4c3b' : '#8b6350';
//   const branchColor = darkMode ? '#7a5540' : '#9c7060';

//   return (
//     <div className="relative w-full h-full select-none pointer-events-none overflow-hidden">
//       {/* Ambient floating petals - only stage 2+ */}
//       {stage >= 2 && (
//         <AnimatePresence>
//           {ambientPetals.map((petal) => (
//             <motion.div
//               key={petal.id}
//               className="absolute rounded-full opacity-60"
//               style={{
//                 left: `${petal.x}%`,
//                 top: '-5%',
//                 width: petal.size,
//                 height: petal.size * 0.7,
//                 background: `radial-gradient(ellipse, ${petal.color}, ${petal.color}88)`,
//                 borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
//               }}
//               animate={{
//                 y: ['0vh', '108vh'],
//                 x: [0, (Math.random() - 0.5) * 60],
//                 rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
//                 opacity: [0, 0.7, 0.5, 0],
//               }}
//               transition={{
//                 duration: petal.duration,
//                 delay: petal.delay,
//                 repeat: Infinity,
//                 repeatDelay: petal.delay + 2,
//                 ease: 'easeInOut',
//               }}
//             />
//           ))}
//         </AnimatePresence>
//       )}

//       {/* Celebration petals */}
//       <AnimatePresence>
//         {celebrationPetals.map((petal) => (
//           <motion.div
//             key={petal.id}
//             className="absolute"
//             style={{
//               left: `${petal.x}%`,
//               top: '-5%',
//               width: petal.size,
//               height: petal.size * 0.7,
//               background: `radial-gradient(ellipse, ${petal.color}, ${petal.color}88)`,
//               borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
//             }}
//             initial={{ y: 0, opacity: 0, rotate: 0 }}
//             animate={{
//               y: '110vh',
//               x: [(Math.random() - 0.5) * 80],
//               rotate: [0, 540 * (Math.random() > 0.5 ? 1 : -1)],
//               opacity: [0, 0.9, 0.7, 0],
//             }}
//             exit={{ opacity: 0 }}
//             transition={{
//               duration: petal.duration,
//               delay: petal.delay,
//               ease: 'easeIn',
//             }}
//           />
//         ))}
//       </AnimatePresence>

//       {/* Tree SVG */}
//       <svg
//         viewBox="0 0 120 160"
//         className="absolute bottom-0 right-0 w-28 h-40 md:w-36 md:h-48"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         {/* Trunk */}
//         <motion.path
//           d="M60 160 C60 140 58 120 57 100 C56 85 58 72 60 60"
//           stroke={trunkColor}
//           strokeWidth="5"
//           strokeLinecap="round"
//           initial={{ pathLength: 0 }}
//           animate={{ pathLength: 1 }}
//           transition={{ duration: 1.5, ease: 'easeOut' }}
//         />

//         {/* Main branches */}
//         <motion.path
//           d="M60 90 C50 78 38 68 25 62"
//           stroke={branchColor}
//           strokeWidth="3"
//           strokeLinecap="round"
//           initial={{ pathLength: 0 }}
//           animate={{ pathLength: 1 }}
//           transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
//         />
//         <motion.path
//           d="M60 80 C70 68 82 60 95 55"
//           stroke={branchColor}
//           strokeWidth="3"
//           strokeLinecap="round"
//           initial={{ pathLength: 0 }}
//           animate={{ pathLength: 1 }}
//           transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
//         />

//         {/* Sub branches */}
//         <motion.path
//           d="M25 62 C18 55 12 48 8 40"
//           stroke={branchColor}
//           strokeWidth="1.8"
//           strokeLinecap="round"
//           initial={{ pathLength: 0 }}
//           animate={{ pathLength: 1 }}
//           transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
//         />
//         <motion.path
//           d="M25 62 C22 52 24 44 28 36"
//           stroke={branchColor}
//           strokeWidth="1.8"
//           strokeLinecap="round"
//           initial={{ pathLength: 0 }}
//           animate={{ pathLength: 1 }}
//           transition={{ duration: 1, delay: 0.9, ease: 'easeOut' }}
//         />
//         <motion.path
//           d="M95 55 C100 46 104 38 108 30"
//           stroke={branchColor}
//           strokeWidth="1.8"
//           strokeLinecap="round"
//           initial={{ pathLength: 0 }}
//           animate={{ pathLength: 1 }}
//           transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
//         />
//         <motion.path
//           d="M95 55 C90 46 90 36 88 28"
//           stroke={branchColor}
//           strokeWidth="1.8"
//           strokeLinecap="round"
//           initial={{ pathLength: 0 }}
//           animate={{ pathLength: 1 }}
//           transition={{ duration: 1, delay: 0.9, ease: 'easeOut' }}
//         />
//         <motion.path
//           d="M60 70 C62 58 64 50 66 40"
//           stroke={branchColor}
//           strokeWidth="1.8"
//           strokeLinecap="round"
//           initial={{ pathLength: 0 }}
//           animate={{ pathLength: 1 }}
//           transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
//         />

//         {/* Blossoms - Stage 1+ */}
//         {stage >= 1 && (
//           <g>
//             {[
//               { cx: 8, cy: 38, r: 6 },
//               { cx: 28, cy: 34, r: 7 },
//               { cx: 66, cy: 38, r: 6 },
//               { cx: 88, cy: 26, r: 5 },
//               { cx: 108, cy: 28, r: 6 },
//             ].map((blossom, i) => (
//               <motion.circle
//                 key={i}
//                 cx={blossom.cx}
//                 cy={blossom.cy}
//                 r={blossom.r}
//                 fill="#f4b8c888"
//                 stroke="#e8a0b8"
//                 strokeWidth="0.5"
//                 initial={{ scale: 0, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ duration: 0.6, delay: 1.2 + i * 0.1 }}
//               />
//             ))}
//           </g>
//         )}

//         {/* Fuller bloom - Stage 2+ */}
//         {stage >= 2 && (
//           <g>
//             {[
//               { cx: 18, cy: 45, r: 8 },
//               { cx: 40, cy: 35, r: 9 },
//               { cx: 75, cy: 45, r: 8 },
//               { cx: 100, cy: 42, r: 7 },
//               { cx: 55, cy: 55, r: 6 },
//               { cx: 15, cy: 30, r: 5 },
//             ].map((blossom, i) => (
//               <motion.circle
//                 key={i}
//                 cx={blossom.cx}
//                 cy={blossom.cy}
//                 r={blossom.r}
//                 fill="#f9d0dc99"
//                 stroke="#f4b8c8"
//                 strokeWidth="0.5"
//                 initial={{ scale: 0, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ duration: 0.8, delay: 1.5 + i * 0.12 }}
//               />
//             ))}
//           </g>
//         )}

//         {/* Petal dots on blossoms */}
//         {stage >= 1 && (
//           <g>
//             {[
//               { x: 8, y: 36 }, { x: 29, y: 32 }, { x: 67, y: 36 },
//               { x: 88, y: 25 }, { x: 108, y: 27 },
//             ].map((dot, i) => (
//               <motion.circle
//                 key={i}
//                 cx={dot.x}
//                 cy={dot.y}
//                 r={1}
//                 fill="#c06080"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 0.8 }}
//                 transition={{ duration: 0.4, delay: 1.8 + i * 0.08 }}
//               />
//             ))}
//           </g>
//         )}
//       </svg>

//       {/* Breathing glow behind tree when celebrating */}
//       {celebrateAll && (
//         <motion.div
//           className="absolute bottom-0 right-0 w-48 h-48 rounded-full"
//           style={{
//             background: 'radial-gradient(circle, rgba(244,184,200,0.3) 0%, transparent 70%)',
//           }}
//           animate={{
//             scale: [1, 1.3, 1],
//             opacity: [0.4, 0.7, 0.4],
//           }}
//           transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
//         />
//       )}
//     </div>
//   );
// };

// interface FloatingPetalProps {
//   onComplete?: () => void;
// }

// export const FloatingPetal: React.FC<FloatingPetalProps> = ({ onComplete }) => {
//   const x = 15 + Math.random() * 70;
//   const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
//   const size = 7 + Math.random() * 7;

//   return (
//     <motion.div
//       className="fixed z-50 pointer-events-none"
//       style={{
//         left: `${x}%`,
//         top: '10%',
//         width: size,
//         height: size * 0.7,
//         background: `radial-gradient(ellipse, ${color}, ${color}99)`,
//         borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
//       }}
//       initial={{ y: 0, opacity: 0, rotate: 0, x: 0 }}
//       animate={{
//         y: '85vh',
//         x: (Math.random() - 0.5) * 120,
//         rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
//         opacity: [0, 0.9, 0.8, 0],
//       }}
//       transition={{ duration: 3.5, ease: 'easeIn' }}
//       onAnimationComplete={onComplete}
//     />
//   );
// };
