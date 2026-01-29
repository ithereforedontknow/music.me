// utils/motion.js
export const springExpressive = {
  type: "spring",
  stiffness: 100,
  damping: 15,
  mass: 1,
};

export const springExpressiveBouncy = {
  type: "spring",
  stiffness: 200,
  damping: 10,
  mass: 1,
};

export const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItems = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const buttonSpring = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3 },
};
