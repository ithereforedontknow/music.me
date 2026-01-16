import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles, Zap, Brain, Music } from "lucide-react";
import { springExpressive, springExpressiveBouncy } from "../utils/motion";

const GenerationSequence = ({ progress, preferences, message }) => {
  const [currentEmoji, setCurrentEmoji] = useState("🎵");
  const [particles, setParticles] = useState([]);

  const emojiSequence = [
    { emoji: "🎵", label: "Starting...", stage: 0 },
    { emoji: "🧠", label: "Thinking...", stage: 20 },
    { emoji: "🔍", label: "Searching...", stage: 40 },
    { emoji: "🎯", label: "Matching...", stage: 60 },
    { emoji: "✨", label: "Perfecting...", stage: 80 },
    { emoji: "🚀", label: "Ready!", stage: 95 },
  ];

  useEffect(() => {
    const currentStage = emojiSequence.find(
      (stage, i) =>
        progress >= stage.stage &&
        (i === emojiSequence.length - 1 ||
          progress < emojiSequence[i + 1]?.stage),
    );
    if (currentStage) {
      setCurrentEmoji(currentStage.emoji);
    }

    // Generate particles
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 2,
    }));
    setParticles(newParticles);
  }, [progress]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <motion.div
        className="relative bg-white rounded-[28px] p-8 shadow-xl border border-gray-200"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={springExpressive}
      >
        {/* Main Content */}
        <div className="flex flex-col items-center justify-center">
          {/* Central Emoji Display */}
          <motion.div
            className="relative mb-8"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="text-7xl"
              key={currentEmoji}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springExpressiveBouncy}
            >
              {currentEmoji}
            </motion.div>
          </motion.div>

          {/* Progress Section */}
          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-gray-800">
                  {emojiSequence.find(
                    (s, i) =>
                      progress >= s.stage &&
                      (i === emojiSequence.length - 1 ||
                        progress < emojiSequence[i + 1]?.stage),
                  )?.label || "Processing..."}
                </span>
              </div>
              <motion.span
                className="text-lg font-semibold text-pink-500"
                key={Math.floor(progress)}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {Math.round(progress)}%
              </motion.span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-pink-500 rounded-full transition-all duration-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={springExpressive}
              />
            </div>
          </div>

          {/* Message Display */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            key={message}
            transition={springExpressive}
            className="text-center mb-6"
          >
            <p className="text-gray-700 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              {message || "Finding your perfect music..."}
            </p>
          </motion.div>

          {/* Status Info */}
          <motion.div
            className="text-center"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Brain className="w-3.5 h-3.5" />
              <span>AI-Powered Music Discovery</span>
            </div>
          </motion.div>
        </div>

        {/* Floating Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute pointer-events-none text-lg text-pink-300"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -40],
              opacity: [0, 0.5, 0],
              rotate: [0, 180],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: particle.id * 0.2,
            }}
          >
            ✨
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default GenerationSequence;
