import { motion, useReducedMotion } from "framer-motion";

/* ---------------------------------- */
/* Page Wrapper Animation */
/* ---------------------------------- */

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

/* ---------------------------------- */
/* Scroll Reveal Section */
/* ---------------------------------- */

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