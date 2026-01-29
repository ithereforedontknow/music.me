// Updated GenerationSequence.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Zap,
  Brain,
  Music,
  Loader2,
  Target,
  Search,
  CheckCircle,
} from "lucide-react";
import { springExpressive, springExpressiveBouncy } from "../utils/motion";

const GenerationSequence = ({ progress, preferences, message }) => {
  const [currentIcon, setCurrentIcon] = useState(Music);
  const [particles, setParticles] = useState([]);

  const stageSequence = [
    { icon: Music, label: "Starting...", stage: 0 },
    { icon: Brain, label: "Thinking...", stage: 20 },
    { icon: Search, label: "Searching...", stage: 40 },
    { icon: Target, label: "Matching...", stage: 60 },
    { icon: Sparkles, label: "Perfecting...", stage: 80 },
    { icon: CheckCircle, label: "Ready!", stage: 95 },
  ];

  useEffect(() => {
    const currentStage = stageSequence.find(
      (stage, i) =>
        progress >= stage.stage &&
        (i === stageSequence.length - 1 ||
          progress < stageSequence[i + 1]?.stage),
    );
    if (currentStage) {
      setCurrentIcon(() => currentStage.icon);
    }

    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 2,
    }));
    setParticles(newParticles);
  }, [progress]);

  const CurrentIcon = currentIcon;

  return (
    <div className="relative w-full max-w-md mx-auto">
      <motion.div
        className="relative bg-white rounded-[28px] p-8 shadow-xl border border-gray-200"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={springExpressive}
      >
        <div className="flex flex-col items-center justify-center">
          {/* Central Icon Display */}
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
              className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center"
              key={currentIcon.name}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={springExpressiveBouncy}
            >
              <CurrentIcon className="w-12 h-12 text-purple-600" />
            </motion.div>
          </motion.div>

          {/* Progress Section */}
          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-800">
                  {stageSequence.find(
                    (s, i) =>
                      progress >= s.stage &&
                      (i === stageSequence.length - 1 ||
                        progress < stageSequence[i + 1]?.stage),
                  )?.label || "Processing..."}
                </span>
              </div>
              <motion.span
                className="text-lg font-semibold text-purple-500"
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
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
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
            className="absolute pointer-events-none text-lg text-purple-300"
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
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default GenerationSequence;
