// Bouncy animation presets
export const bouncySpring = {
  type: "spring",
  stiffness: 400,
  damping: 20,
  mass: 0.8,
};

export const gentleSpring = {
  type: "spring",
  stiffness: 300,
  damping: 25,
  mass: 1,
};

export const bouncyTransition = {
  duration: 0.6,
  ease: [0.34, 1.56, 0.64, 1],
};

// Page transitions
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: bouncySpring,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
    },
  },
};

// Button animations
export const buttonHover = {
  scale: 1.05,
  transition: bouncySpring,
};

export const buttonTap = {
  scale: 0.95,
  transition: {
    duration: 0.1,
  },
};

// Card animations
export const cardHover = {
  y: -8,
  transition: bouncySpring,
};

// Stagger children animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const fadeInUp = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: bouncySpring,
  },
};

// Bounce animation for emojis
export const bounce = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

// Shake animation
export const shake = {
  animate: {
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
    },
  },
};

// Pulse animation
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
    },
  },
};
