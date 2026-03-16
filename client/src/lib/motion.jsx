import { motion, useReducedMotion } from "framer-motion";

/* ──────────────────────────────────
   Page Wrapper Animation
   ────────────────────────────────── */

export const MotionPage = ({ children, className = "", ...props }) => {
  const shouldReduceMotion = useReducedMotion();

  const pageVariants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 40,
      scale: shouldReduceMotion ? 1 : 0.98,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
        when: "beforeChildren",
        staggerChildren: 0.08,
      },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -20,
      scale: shouldReduceMotion ? 1 : 0.98,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.main
      {...props}
      className={`will-change-transform ${className}`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.main>
  );
};

/* ──────────────────────────────────
   Scroll Reveal Section
   ────────────────────────────────── */

export const MotionSection = ({
  children,
  className = "",
  delay = 0,
  ...props
}) => {
  return (
    <motion.section
      {...props}
      className={`will-change-transform ${className}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        type: "spring",
        stiffness: 70,
        damping: 18,
        delay,
      }}
    >
      {children}
    </motion.section>
  );
};

/* ──────────────────────────────────
   Scroll Reveal Card
   Fades in + slides up on scroll.
   Use inside a grid or list.
   ────────────────────────────────── */

export const MotionCard = ({
  children,
  className = "",
  delay = 0,
  ...props
}) => {
  return (
    <motion.div
      {...props}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 16,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};

/* ──────────────────────────────────
   Stagger Container
   Wrap around MotionCard items to
   automatically stagger their entry.
   ────────────────────────────────── */

export const MotionStagger = ({
  children,
  className = "",
  stagger = 0.06,
  ...props
}) => {
  return (
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
};

/* Child variant for use with MotionStagger */
export const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 16 },
  },
};
