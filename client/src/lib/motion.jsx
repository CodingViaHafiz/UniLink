/**
 * motion.jsx — single source of truth for all animation primitives.
 *
 * Usage across the app:
 *   import { MotionPage, MotionSection, MotionCard, ... } from "../lib/motion";
 *
 * AnimatePresence is re-exported here so App.jsx imports from one place.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// ─── Spring presets ────────────────────────────────────────────────────────────
const gentle  = { type: "spring", stiffness: 80,  damping: 18 };
const snappy  = { type: "spring", stiffness: 300, damping: 30 };
const precise = { type: "spring", stiffness: 400, damping: 38 };

// ─── Page transition ───────────────────────────────────────────────────────────
// Used by MotionPage + AnimatePresence in App.jsx.
// Subtle: just opacity + tiny vertical shift so it feels instant but polished.
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

// ─── MotionPage ────────────────────────────────────────────────────────────────
// Wrap the root element of every page.
// Works in tandem with <AnimatePresence mode="wait"> in App.jsx.
export const MotionPage = ({ children, className = "", ...props }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      {...props}
      className={className}
      variants={reduce ? {} : pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

// ─── MotionSection ─────────────────────────────────────────────────────────────
// Scroll-reveal for page sections (fades + slides up as you scroll into view).
export const MotionSection = ({ children, className = "", delay = 0, ...props }) => {
  const reduce = useReducedMotion();
  return (
    <motion.section
      {...props}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ...gentle, delay }}
    >
      {children}
    </motion.section>
  );
};

// ─── MotionCard ────────────────────────────────────────────────────────────────
// Scroll-reveal for individual cards / list items.
export const MotionCard = ({ children, className = "", delay = 0, ...props }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      {...props}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ ...gentle, delay }}
    >
      {children}
    </motion.div>
  );
};

// ─── MotionFade ────────────────────────────────────────────────────────────────
// Simple opacity-only fade — for alerts, toasts, inline messages, dropdowns.
// Uses animate= so it works both standalone and inside AnimatePresence.
export const MotionFade = ({ children, className = "", delay = 0, ...props }) => (
  <motion.div
    {...props}
    className={className}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.18, delay }}
  >
    {children}
  </motion.div>
);

// ─── MotionSlide ───────────────────────────────────────────────────────────────
// Slides in from a direction. Good for sidebars, drawers, panels.
// direction: "up" | "down" | "left" | "right"
export const MotionSlide = ({
  children,
  className = "",
  direction = "up",
  delay = 0,
  ...props
}) => {
  const reduce = useReducedMotion();
  const dist = 24;
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const sign = direction === "right" || direction === "down" ? 1 : -1;

  return (
    <motion.div
      {...props}
      className={className}
      initial={reduce ? false : { opacity: 0, [axis]: sign * dist }}
      animate={{ opacity: 1, [axis]: 0 }}
      exit={{ opacity: 0, [axis]: sign * dist }}
      transition={{ ...snappy, delay }}
    >
      {children}
    </motion.div>
  );
};

// ─── MotionScale ───────────────────────────────────────────────────────────────
// Scales up from 95% — for modals, popovers, confirmation dialogs.
export const MotionScale = ({ children, className = "", ...props }) => (
  <motion.div
    {...props}
    className={className}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={precise}
  >
    {children}
  </motion.div>
);

// ─── MotionStagger ─────────────────────────────────────────────────────────────
// Container that staggers child entrances on scroll.
// Wrap a list of <motion.div variants={staggerChild}> with this.
export const MotionStagger = ({
  children,
  className = "",
  stagger = 0.055,
  ...props
}) => (
  <motion.div
    {...props}
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-40px" }}
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: stagger } },
    }}
  >
    {children}
  </motion.div>
);

// Child variant — use as `variants={staggerChild}` on children of MotionStagger
export const staggerChild = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

// ─── AnimatePresence re-export ─────────────────────────────────────────────────
// Import from here so the whole app has one import source for framer-motion.
export { AnimatePresence };
