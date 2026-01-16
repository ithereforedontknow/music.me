import { motion } from "framer-motion";
import { useEffect } from "react";
import { Music, Sparkles } from "lucide-react";
import { springExpressive, springExpressiveBouncy } from "../utils/motion";

const LogoMorph = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      {/* Main Logo Container */}
      <motion.div
        className="relative w-32 h-32 bg-pink-100 rounded-3xl flex items-center justify-center shadow-m3-3"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={springExpressiveBouncy}
      >
        {/* Sparkles Decoration */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity },
          }}
        >
          <Sparkles className="w-6 h-6 text-pink-600" />
        </motion.div>

        {/* Music Icon */}
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Music className="w-16 h-16 text-pink-600" />
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.div
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, ...springExpressive }}
      >
        <motion.h1
          className="display-small font-bold text-on-surface mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          music.me
        </motion.h1>
        <motion.p
          className="body-large text-on-surface-variant"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Discover your next favorite song
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LogoMorph;
