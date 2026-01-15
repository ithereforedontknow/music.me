import { motion } from "framer-motion";
import { useEffect } from "react";
import { Music } from "lucide-react";

const LogoMorph = ({ onComplete }) => {
  useEffect(() => {
    // Faster completion - 0.8 seconds
    const timer = setTimeout(() => {
      onComplete?.();
    }, 800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative">
      {/* Fast animations */}
      <motion.div
        className="absolute inset-0 border-2 border-white/30 rounded-3xl"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
      />

      <motion.div
        className="absolute inset-4 border-2 border-white/20 rounded-2xl"
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
      />

      <motion.div
        className="relative w-24 h-24 bg-white rounded-2xl flex items-center justify-center"
        initial={{ scale: 0, rotate: 45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
      >
        <Music className="w-10 h-10 text-black" />
      </motion.div>

      {/* Quick text fade */}
      {/* <motion.div
        className="absolute -bottom-16 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h1 className="text-3xl font-black text-white mb-2">SoundSwipe</h1>
      </motion.div>*/}
    </div>
  );
};

export default LogoMorph;
