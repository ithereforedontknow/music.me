import { useState } from "react";
import { motion } from "framer-motion";
import { buttonSpring } from "../utils/motion";

const genres = [
  { id: "pop", label: "Pop", color: "bg-pink-100" },
  { id: "rock", label: "Rock", color: "bg-red-100" },
  { id: "hip hop", label: "Hip Hop", color: "bg-purple-100" },
  { id: "electronic", label: "Electronic", color: "bg-blue-100" },
  { id: "indie", label: "Indie", color: "bg-green-100" },
  { id: "r&b", label: "R&B", color: "bg-yellow-100" },
  { id: "jazz", label: "Jazz", color: "bg-orange-100" },
  { id: "lofi", label: "Lofi", color: "bg-teal-100" },
  { id: "alternative", label: "Alternative", color: "bg-indigo-100" },
  { id: "metal", label: "Metal", color: "bg-gray-100" },
  { id: "folk", label: "Folk", color: "bg-emerald-100" },
  { id: "soul", label: "Soul", color: "bg-rose-100" },
  { id: "country", label: "Country", color: "bg-amber-100" },
  { id: "reggae", label: "Reggae", color: "bg-lime-100" },
  { id: "classical", label: "Classical", color: "bg-cyan-100" },
];

const GenreSelection = ({ onComplete, initialData = {}, compact = false }) => {
  const [selectedGenres, setSelectedGenres] = useState(
    initialData.genres || [],
  );

  const handleGenreToggle = (genreId) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((id) => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
  };

  const handleContinue = () => {
    if (onComplete) {
      onComplete({ genres: selectedGenres });
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <motion.button
              key={genre.id}
              onClick={() => handleGenreToggle(genre.id)}
              className={`px-3 py-2 rounded-full transition-all ${
                selectedGenres.includes(genre.id)
                  ? `${genre.color} border-2 border-accent`
                  : "bg-secondary hover:bg-tertiary"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm font-medium text-primary">
                {genre.label}
              </span>
            </motion.button>
          ))}
        </div>
        <button
          onClick={handleContinue}
          className="text-sm text-accent hover:underline"
        >
          {selectedGenres.length > 0
            ? `${selectedGenres.length} genre${selectedGenres.length > 1 ? "s" : ""} selected`
            : "Select genres (optional)"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">
          What genres do you like?
        </h2>
        <p className="text-secondary">
          Select one or more genres to personalize recommendations
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {genres.map((genre) => (
          <motion.button
            key={genre.id}
            onClick={() => handleGenreToggle(genre.id)}
            className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
              selectedGenres.includes(genre.id)
                ? `${genre.color} border-2 border-accent scale-105`
                : "bg-card border border-theme hover:border-accent"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="font-medium text-primary">{genre.label}</span>
            {selectedGenres.includes(genre.id) && (
              <div className="w-2 h-2 rounded-full bg-accent mt-1" />
            )}
          </motion.button>
        ))}
      </div>

      <div className="text-center">
        <motion.button
          onClick={handleContinue}
          className="bg-accent text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all font-medium"
          disabled={selectedGenres.length === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue with {selectedGenres.length} genre
          {selectedGenres.length !== 1 ? "s" : ""}
        </motion.button>
        <p className="text-sm text-secondary mt-4">
          You can select multiple genres or skip this step
        </p>
      </div>
    </div>
  );
};

export default GenreSelection;
