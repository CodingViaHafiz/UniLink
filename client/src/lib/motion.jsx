import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const pageTransition = { duration: 0.35, ease: "easeOut" };

export const MotionPage = ({ children, className }) => (
  <motion.main
    className={className}
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
  >
    {children}
  </motion.main>
);

export const MotionSection = ({ children, className, delay = 0 }) => (
  <motion.section
    className={className}
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.45, delay, ease: "easeOut" }}
  >
    {children}
  </motion.section>
);
