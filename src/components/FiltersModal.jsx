import { motion } from "framer-motion";
import { ArrowLeft, Filter, X } from "lucide-react";
import { springExpressive } from "../utils/motion";
import MoodSelection from "./MoodSelection";
import GenreSelection from "./GenreSelection";

const FiltersModal = ({ filters, onUpdate, onClose }) => {
  const handleMoodComplete = (moods) => {
    onUpdate({ ...filters, moods });
  };

  const handleGenreComplete = (genres) => {
    onUpdate({ ...filters, genres });
  };

  const handleClearAll = () => {
    onUpdate({ moods: [], genres: [] });
  };

  return (
    <motion.div
      key="filters"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="py-8"
    >
      <div className="flex items-center gap-4 mb-6">
        <motion.button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-tertiary transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">Filters</h1>
          <p className="text-secondary">
            Optional: Add moods or genres to refine your search
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Active Filters Summary */}
        {(filters.moods.length > 0 || filters.genres.length > 0) && (
          <div className="bg-card rounded-2xl p-4 border border-theme">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-primary">
                Active Filters
              </h3>
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-800 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.moods.map((mood) => (
                <span
                  key={`mood_${mood}`}
                  className="px-3 py-1 text-xs bg-accent/10 text-accent rounded-full border border-accent/20"
                >
                  {mood} mood
                </span>
              ))}
              {filters.genres.map((genre) => (
                <span
                  key={`genre_${genre}`}
                  className="px-3 py-1 text-xs bg-accent/10 text-accent rounded-full border border-accent/20"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mood Selection */}
        <div className="bg-card rounded-3xl p-6 shadow-m3-2 border border-theme">
          <h2 className="text-lg font-semibold text-primary mb-4">Moods</h2>
          <MoodSelection
            onComplete={handleMoodComplete}
            initialData={{ moods: filters.moods }}
            compact
          />
        </div>

        {/* Genre Selection */}
        <div className="bg-card rounded-3xl p-6 shadow-m3-2 border border-theme">
          <h2 className="text-lg font-semibold text-primary mb-4">Genres</h2>
          <GenreSelection
            onComplete={handleGenreComplete}
            initialData={{ genres: filters.genres }}
            compact
          />
        </div>

        {/* Apply Button */}
        <motion.button
          onClick={onClose}
          className="w-full bg-accent text-on-accent px-6 py-3 rounded-full shadow-m3-2 hover:shadow-m3-3 transition-all hover:opacity-90 font-medium flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Filter className="w-5 h-5" />
          Apply Filters
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FiltersModal;
