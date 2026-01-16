import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Music,
  Guitar,
  Headphones,
  Volume2,
  Mic2,
  Disc,
  Radio,
  Star,
  Heart,
  Zap,
  Moon,
  Sun,
  Palette,
  Drum,
  Piano,
  Disc3,
  ChevronRight,
  Check,
} from "lucide-react";
import {
  springExpressive,
  staggerContainer,
  staggerItems,
  buttonSpring,
  fadeInUp,
} from "../../utils/motion";

export const GENRES = [
  { id: "rock", icon: Guitar, label: "Rock" },
  { id: "pop", icon: Music, label: "Pop" },
  { id: "electronic", icon: Volume2, label: "Electronic" },
  { id: "hip hop", icon: Mic2, label: "Hip Hop" },
  { id: "jazz", icon: Radio, label: "Jazz" },
  { id: "indie", icon: Star, label: "Indie" },
  { id: "alternative", icon: Headphones, label: "Alternative" },
  { id: "r&b", icon: Disc, label: "R&B" },
  { id: "classical", icon: Piano, label: "Classical" },
  { id: "metal", icon: Drum, label: "Metal" },
  { id: "folk", icon: Music, label: "Folk" },
  { id: "soul", icon: Heart, label: "Soul" },
  { id: "kpop", icon: Zap, label: "K-Pop" },
  { id: "lofi", icon: Moon, label: "Lo-Fi" },
  { id: "country", icon: Sun, label: "Country" },
  { id: "reggae", icon: Palette, label: "Reggae" },
  { id: "punk", icon: Guitar, label: "Punk" },
  { id: "funk", icon: Disc3, label: "Funk" },
  { id: "disco", icon: Disc, label: "Disco" },
];

const GenreSelection = ({ onComplete, initialData }) => {
  const [selectedGenres, setSelectedGenres] = useState(
    initialData.genres || [],
  );

  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreId)) return prev.filter((id) => id !== genreId);
      if (prev.length < 5) return [...prev, genreId];
      return prev;
    });
  };

  return (
    <motion.div {...fadeInUp} className="w-full max-w-6xl mx-auto pb-20">
      {/* Header Section */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={springExpressive}
          className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-pink-100 mb-6"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            <Music className="w-10 h-10 text-pink-600" />
          </motion.div>
        </motion.div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-800">
            Choose Your Sound
          </h2>
          <p className="text-gray-600">Select up to 5 genres</p>
        </div>

        {/* Selection Counter */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, ...springExpressive }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full mt-4"
        >
          <span className="text-lg font-semibold text-pink-600">
            {selectedGenres.length}
          </span>
          <span className="text-gray-600">/ 5 selected</span>
        </motion.div>
      </div>

      {/* Genre Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
      >
        {GENRES.map((genre, index) => {
          const isSelected = selectedGenres.includes(genre.id);
          const Icon = genre.icon;

          return (
            <motion.button
              key={genre.id}
              variants={staggerItems}
              onClick={() => toggleGenre(genre.id)}
              className={`relative flex flex-col items-center p-4 aspect-square rounded-2xl ${
                isSelected
                  ? "bg-pink-100 border-2 border-pink-500"
                  : "bg-white border border-gray-200"
              } shadow-lg hover:shadow-xl transition-all`}
              whileHover={{
                scale: 1.05,
                y: -2,
                transition: springExpressive,
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Icon */}
              <motion.div
                className={`my-5 p-3 rounded-xl ${
                  isSelected
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
                animate={
                  isSelected
                    ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }
                    : {}
                }
                transition={{ duration: 0.6 }}
              >
                <Icon className="w-6 h-6" />
              </motion.div>

              {/* Label */}
              <span
                className={`text-sm font-medium ${isSelected ? "text-pink-700" : "text-gray-800"}`}
              >
                {genre.label}
              </span>

              {/* Selection Indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={springExpressive}
                    className="absolute top-2 right-2 w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Continue Button */}
      <AnimatePresence>
        {selectedGenres.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30"
          >
            <motion.button
              onClick={() => onComplete({ genres: selectedGenres })}
              className="bg-pink-500 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-pink-600 font-medium flex items-center gap-3"
              {...buttonSpring}
            >
              <span className="font-medium">
                Continue with {selectedGenres.length} genre
                {selectedGenres.length !== 1 ? "s" : ""}
              </span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GenreSelection;
