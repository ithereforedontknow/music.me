import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Search, Music, Zap } from "lucide-react";

const GenerationSequence = ({ progress, preferences, message }) => {
  const [crawlText, setCrawlText] = useState("");
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate crawl text based on preferences
    let text = "music.me DISCOVERY ENGINE\n\n";

    if (preferences.moods.length > 0) {
      text += `MOODS: ${preferences.moods.join(", ").toUpperCase()}\n`;
    }

    if (preferences.genres.length > 0) {
      text += `GENRES: ${preferences.genres.join(", ").toUpperCase()}\n`;
    }

    if (preferences.referenceTrack) {
      const trackName =
        preferences.referenceTrack.name || preferences.referenceTrack.title;
      const artistName =
        preferences.referenceTrack.artists?.[0]?.name ||
        preferences.referenceTrack.artist?.name;
      text += `REFERENCE: ${trackName} by ${artistName}\n`;
    }

    text += "\nQUERYING LAST.FM DATABASE...\n";
    text += "ANALYZING MUSIC PATTERNS...\n";
    text += "COMPILING DIVERSE SELECTION...\n\n";
    text += message
      ? message.toUpperCase()
      : "PREPARING YOUR DISCOVERY DECK...";

    setCrawlText(text);

    // Generate particles
    const newParticles = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
      });
    }
    setParticles(newParticles);
  }, [preferences, message]);

  return (
    <div className="relative h-[400px] overflow-hidden perspective-1000">
      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 / particle.speed,
            repeat: Infinity,
            delay: particle.id * 0.2,
          }}
        />
      ))}

      {/* Crawl effect */}
      <motion.div
        className="absolute top-0 left-0 right-0 text-center transform-gpu"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(45deg)",
        }}
        animate={{ y: "100%" }}
        transition={{
          duration: 25,
          ease: "linear",
        }}
      >
        <div className="text-white font-mono text-lg leading-relaxed whitespace-pre-line">
          {crawlText}
        </div>
      </motion.div>

      {/* Progress overlay */}
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <div className="inline-flex items-center gap-3 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full">
          <Search className="w-5 h-5 text-white animate-pulse" />
          <span className="text-sm text-white">
            {message || "Finding music..."} {progress}%
          </span>
        </div>
      </div>

      {/* Center icon */}
      {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 border border-white/20 rounded-full flex items-center justify-center"
        >
          <Music className="w-10 h-10 text-white/60" />
        </motion.div>
      </div>*/}
    </div>
  );
};

export default GenerationSequence;
