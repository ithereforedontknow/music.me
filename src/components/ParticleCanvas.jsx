import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Music2, Music, Headphones, Disc } from "lucide-react";
import { springExpressive } from "../utils/motion";

const ParticleCanvas = ({ isActive }) => {
  const [blobs, setBlobs] = useState([]);

  useEffect(() => {
    const newBlobs = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      type: i % 4,
      size: Math.random() * 80 + 40,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      color: `rgba(${Math.floor(
        Math.random() * 100 + 155,
      )}, ${Math.floor(Math.random() * 50 + 100)}, ${Math.floor(
        Math.random() * 100 + 155,
      )}, ${Math.random() * 0.1 + 0.05})`,
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

      {/* Floating music icons */}
      <motion.div
        className="absolute top-1/4 left-1/4 text-purple-300 opacity-20"
        animate={{
          y: [0, -30, 0],
          rotate: [0, 360],
        }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
        }}
      >
        <Music2 className="w-10 h-10" />
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-1/3 text-pink-300 opacity-15"
        animate={{
          y: [0, 40, 0],
          rotate: [0, -360],
        }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 12, repeat: Infinity, ease: "linear" },
        }}
      >
        <Music className="w-8 h-8" />
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-1/3 text-purple-200 opacity-10"
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
        <Headphones className="w-12 h-12" />
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 right-1/4 text-pink-200 opacity-10"
        animate={{
          rotate: 360,
          scale: [1, 1.3, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <Disc className="w-14 h-14" />
      </motion.div>
    </div>
  );
};

export default ParticleCanvas;
