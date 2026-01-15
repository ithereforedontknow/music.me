import { motion } from "framer-motion";
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
} from "lucide-react";

// Last.fm compatible genres
export const GENRES = [
  { id: "rock", icon: Guitar, label: "Rock", color: "text-red-500" },
  { id: "pop", icon: Music, label: "Pop", color: "text-pink-500" },
  {
    id: "electronic",
    icon: Volume2,
    label: "Electronic",
    color: "text-blue-500",
  },
  { id: "hip hop", icon: Mic2, label: "Hip Hop", color: "text-purple-500" },
  { id: "jazz", icon: Radio, label: "Jazz", color: "text-yellow-500" },
  { id: "indie", icon: Star, label: "Indie", color: "text-green-500" },
  {
    id: "alternative",
    icon: Headphones,
    label: "Alternative",
    color: "text-orange-500",
  },
  { id: "r&b", icon: Disc, label: "R&B", color: "text-indigo-500" },
  { id: "classical", icon: Music, label: "Classical", color: "text-gray-400" },
  { id: "metal", icon: Guitar, label: "Metal", color: "text-gray-600" },
  { id: "folk", icon: Music, label: "Folk", color: "text-amber-700" },
  { id: "soul", icon: Mic2, label: "Soul", color: "text-red-400" },
];

const GenreSelection = ({ onComplete, initialData }) => {
  const [selectedGenres, setSelectedGenres] = useState(
    initialData.genres || [],
  );

  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((id) => id !== genreId);
      } else if (prev.length < 3) {
        return [...prev, genreId];
      }
      return prev;
    });
  };

  const handleContinue = () => {
    onComplete({ genres: selectedGenres });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {GENRES.map((genre, index) => {
          const Icon = genre.icon;
          return (
            <motion.button
              key={genre.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => toggleGenre(genre.id)}
              className={`relative p-4 rounded-xl border transition-all duration-200 ${
                selectedGenres.includes(genre.id)
                  ? "border-white bg-white/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${selectedGenres.includes(genre.id) ? "bg-white/10" : ""}`}
                >
                  <Icon className={`w-6 h-6 ${genre.color}`} />
                </div>
                <div className="text-sm font-medium text-white">
                  {genre.label}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-400">
          {selectedGenres.length} of 3 selected
        </p>
        {selectedGenres.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Select at least one to continue
          </p>
        )}
      </div>

      <button
        onClick={handleContinue}
        disabled={selectedGenres.length === 0}
        className={`w-full py-3 rounded-xl font-medium transition-all ${
          selectedGenres.length > 0
            ? "bg-white text-black hover:bg-gray-100"
            : "bg-white/10 text-white/40 cursor-not-allowed"
        }`}
      >
        {selectedGenres.length > 0
          ? "Continue to Recommendations"
          : "Select Genres to Continue"}
      </button>
    </div>
  );
};

export default GenreSelection;
