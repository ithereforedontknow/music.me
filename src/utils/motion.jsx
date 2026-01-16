import { spring } from "framer-motion";

// M3 Expressive Motion Configuration
export const springExpressive = {
  type: "spring",
  stiffness: 300,
  damping: 25,
  mass: 1,
  bounce: 0.2,
};

export const springExpressiveSubtle = {
  type: "spring",
  stiffness: 200,
  damping: 15,
  mass: 1.2,
  bounce: 0.3,
};

export const springExpressiveBouncy = {
  type: "spring",
  stiffness: 400,
  damping: 10,
  mass: 0.8,
  bounce: 0.5,
};

export const springExpressiveGentle = {
  type: "spring",
  stiffness: 150,
  damping: 20,
  mass: 1.5,
  bounce: 0.1,
};

// Page Transitions
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: springExpressive,
};

export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: springExpressiveBouncy,
};

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: springExpressive,
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: springExpressive,
};

export const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: springExpressive,
};

// Stagger Children
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItems = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: springExpressiveSubtle,
};

// Button Animations
export const buttonTap = {
  whileTap: { scale: 0.95 },
  whileHover: { scale: 1.05 },
};

export const buttonSpring = {
  whileHover: {
    scale: 1.05,
    transition: springExpressiveBouncy,
  },
  whileTap: {
    scale: 0.95,
    transition: springExpressiveGentle,
  },
};

// Card Animations
export const cardHover = {
  whileHover: {
    y: -4,
    transition: springExpressiveSubtle,
  },
};

export const cardTap = {
  whileTap: {
    scale: 0.98,
    transition: springExpressiveGentle,
  },
};

// Icon Animations
export const iconRotate = {
  whileHover: { rotate: 90 },
  transition: springExpressive,
};

export const iconBounce = {
  whileHover: {
    scale: 1.2,
    rotate: [0, 10, -10, 0],
  },
  transition: {
    rotate: {
      repeat: Infinity,
      duration: 0.5,
    },
    scale: springExpressiveBouncy,
  },
};

// List Item Animations
export const listItem = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: springExpressive,
};

// Modal/Sheet Animations
export const modalSlideUp = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" },
  transition: springExpressiveGentle,
};

export const modalFadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

// Special Effects
export const morphTransition = {
  transition: {
    type: "spring",
    stiffness: 200,
    damping: 20,
    mass: 1,
  },
};

export const wobble = {
  animate: {
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: "loop",
      repeatDelay: 2,
    },
  },
};

export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Combine animations
export const expressiveButton = {
  ...buttonSpring,
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: springExpressiveBouncy,
};

export const expressiveCard = {
  ...cardHover,
  ...cardTap,
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: springExpressiveSubtle,
};
