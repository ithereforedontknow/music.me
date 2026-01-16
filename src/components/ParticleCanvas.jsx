import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { springExpressive } from "../utils/motion";

const ParticleCanvas = ({ isActive }) => {
  const [blobs, setBlobs] = useState([]);

  useEffect(() => {
    // Create 8 blobs with different shapes and positions
    const newBlobs = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      type: i % 4, // 0: circle, 1: blob, 2: squiggle, 3: wave
      size: Math.random() * 80 + 40, // 40-120px
      x: Math.random() * 100, // 0-100% horizontal position
      y: Math.random() * 100, // 0-100% vertical position
      rotation: Math.random() * 360,
      color: `rgba(${
        Math.floor(Math.random() * 100 + 155) // Pinkish colors 155-255
      }, ${Math.floor(Math.random() * 50 + 100)}, ${Math.floor(
        Math.random() * 100 + 155,
      )}, ${Math.random() * 0.1 + 0.05})`, // 0.05-0.15 opacity
      delay: i * 0.3,
    }));
    setBlobs(newBlobs);
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className="absolute"
          style={{
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            backgroundColor: blob.color,
            filter: "blur(20px)",
          }}
          initial={{
            scale: 0,
            rotate: blob.rotation,
            borderRadius:
              blob.type === 0
                ? "50%"
                : blob.type === 1
                  ? "40% 60% 60% 40% / 60% 30% 70% 40%"
                  : blob.type === 2
                    ? "63% 37% 54% 46% / 55% 48% 52% 45%"
                    : "30% 70% 70% 30% / 30% 30% 70% 70%",
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [blob.rotation, blob.rotation + 180, blob.rotation + 360],
            x: [0, Math.sin(blob.id) * 50, 0],
            y: [0, Math.cos(blob.id) * 50, 0],
            borderRadius:
              blob.type === 0
                ? ["50%", "60% 40% 30% 70% / 60% 30% 70% 40%", "50%"]
                : blob.type === 1
                  ? [
                      "40% 60% 60% 40% / 60% 30% 70% 40%",
                      "50%",
                      "40% 60% 60% 40% / 60% 30% 70% 40%",
                    ]
                  : blob.type === 2
                    ? [
                        "63% 37% 54% 46% / 55% 48% 52% 45%",
                        "70% 30% 30% 70% / 70% 40% 60% 30%",
                        "63% 37% 54% 46% / 55% 48% 52% 45%",
                      ]
                    : [
                        "30% 70% 70% 30% / 30% 30% 70% 70%",
                        "40% 60% 60% 40% / 40% 40% 60% 60%",
                        "30% 70% 70% 30% / 30% 30% 70% 70%",
                      ],
          }}
          transition={{
            duration: 8 + blob.id,
            repeat: Infinity,
            ease: "easeInOut",
            delay: blob.delay,
          }}
        />
      ))}

      {/* Corner decorative shapes */}
      <motion.div
        className="absolute top-10 left-10 w-24 h-24 bg-pink-200/20 rounded-full"
        animate={{
          rotate: 360,
          scale: [1, 1.3, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="absolute top-10 right-10 w-20 h-20 bg-purple-200/20"
        style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
        animate={{
          rotate: -360,
          y: [0, -20, 0],
        }}
        transition={{
          rotate: { duration: 25, repeat: Infinity, ease: "linear" },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="absolute bottom-10 left-10 w-28 h-28 bg-pink-300/15"
        style={{ borderRadius: "63% 37% 54% 46% / 55% 48% 52% 45%" }}
        animate={{
          rotate: 180,
          scale: [1, 1.4, 1],
        }}
        transition={{
          rotate: { duration: 15, repeat: Infinity, ease: "linear" },
          scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="absolute bottom-10 right-10 w-32 h-32 bg-purple-300/10 rounded-full"
        animate={{
          rotate: -180,
          borderRadius: ["50%", "40% 60% 60% 40% / 60% 30% 70% 40%", "50%"],
        }}
        transition={{
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          borderRadius: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Floating music note shapes */}
      <motion.div
        className="absolute top-1/4 left-1/4 text-4xl opacity-20"
        animate={{
          y: [0, -30, 0],
          rotate: [0, 360],
        }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
        }}
      >
        🎵
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-1/3 text-3xl opacity-15"
        animate={{
          y: [0, 40, 0],
          rotate: [0, -360],
        }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 12, repeat: Infinity, ease: "linear" },
        }}
      >
        🎶
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-1/3 text-5xl opacity-10"
        animate={{
          y: [0, -50, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🎧
      </motion.div>
    </div>
  );
};

export default ParticleCanvas;
