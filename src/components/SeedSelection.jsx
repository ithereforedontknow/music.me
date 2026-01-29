import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Music,
  Disc,
  Tag,
  ChevronRight,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { springExpressive, buttonSpring } from "../utils/motion";
import { searchSeeds } from "../services/seedRecommendationService";

const SEARCH_TYPES = [
  {
    id: "artist",
    label: "Artist",
    icon: Music,
    description: "Find similar artists",
  },
  {
    id: "track",
    label: "Track",
    icon: Disc,
    description: "Find similar songs",
  },
  { id: "tag", label: "Genre/Mood", icon: Tag, description: "Explore by tag" },
];

const SeedSelection = ({ onSeedsSelected }) => {
  const [searchType, setSearchType] = useState("artist");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSeeds, setSelectedSeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const results = await searchSeeds(searchType, query);
      if (results.length === 0) {
        setError("No results found. Try a different search term.");
      }
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const addSeed = (item) => {
    if (selectedSeeds.length >= 3) {
      setError("Maximum 3 seeds allowed");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (selectedSeeds.find((s) => s.id === item.id)) {
      setError("This seed is already added");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setSelectedSeeds([...selectedSeeds, { ...item, type: searchType }]);
    setQuery("");
    setSearchResults([]);
    setError("");
  };

  const removeSeed = (id) => {
    setSelectedSeeds(selectedSeeds.filter((s) => s.id !== id));
  };

  const handleGenerate = () => {
    if (selectedSeeds.length === 0) return;
    onSeedsSelected(selectedSeeds);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={springExpressive}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/20 mb-4"
        >
          <Sparkles className="w-8 h-8 text-accent" />
        </motion.div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Start with something you love
        </h1>
        <p className="text-secondary">
          Pick 1-3 artists, tracks, or genres to discover similar music
        </p>
      </div>

      {/* Selected Seeds */}
      <AnimatePresence>
        {selectedSeeds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card rounded-2xl p-4 border border-theme shadow-m3-2"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-primary">
                Your Seeds ({selectedSeeds.length}/3)
              </h3>
              <button
                onClick={() => setSelectedSeeds([])}
                className="text-xs text-red-600 hover:text-red-800 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedSeeds.map((seed) => (
                <motion.div
                  key={seed.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-2 rounded-full border border-accent/20"
                >
                  {seed.image && (
                    <img
                      src={seed.image}
                      alt={seed.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium">{seed.name}</span>
                  <button
                    onClick={() => removeSeed(seed.id)}
                    className="hover:bg-accent/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Type Selection */}
      <div className="bg-card rounded-2xl p-6 border border-theme shadow-m3-2">
        <h3 className="text-sm font-medium text-primary mb-4">
          What do you want to search for?
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {SEARCH_TYPES.map((type) => {
            const IconComponent = type.icon;
            return (
              <motion.button
                key={type.id}
                onClick={() => {
                  setSearchType(type.id);
                  setSearchResults([]);
                  setError("");
                }}
                className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all border ${
                  searchType === type.id
                    ? "bg-accent/10 border-accent"
                    : "bg-secondary border-theme hover:border-accent"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconComponent
                  className={`w-6 h-6 ${searchType === type.id ? "text-accent" : "text-primary"}`}
                />
                <div className="text-center">
                  <div
                    className={`text-sm font-medium ${searchType === type.id ? "text-accent" : "text-primary"}`}
                  >
                    {type.label}
                  </div>
                  <div className="text-xs text-secondary mt-1">
                    {type.description}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setError("");
              }}
              onKeyPress={handleKeyPress}
              placeholder={`Search for ${searchType === "artist" ? "an artist" : searchType === "track" ? "a track" : "a genre/tag"}...`}
              className="w-full px-4 py-3 pr-12 bg-secondary rounded-xl border-2 border-theme focus:border-accent focus:outline-none text-primary placeholder-secondary/60 transition-colors"
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-accent text-on-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600"
            >
              {error}
            </motion.p>
          )}

          {/* Search Results */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-h-60 overflow-y-auto space-y-2 border border-theme rounded-xl p-2"
              >
                {searchResults.map((result) => (
                  <motion.button
                    key={result.id}
                    onClick={() => addSeed(result)}
                    className="w-full flex items-center gap-3 p-3 bg-secondary hover:bg-tertiary rounded-lg transition-colors text-left"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {result.image && (
                      <img
                        src={result.image}
                        alt={result.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    {!result.image && (
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Music className="w-6 h-6 text-accent" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-primary truncate">
                        {result.name}
                      </div>
                      {result.artist && (
                        <div className="text-sm text-secondary truncate">
                          {/* CHANGE THIS: */}
                          {typeof result.artist === "object"
                            ? result.artist.name
                            : result.artist}
                        </div>
                      )}
                      {result.listeners && (
                        <div className="text-xs text-secondary">
                          {parseInt(result.listeners).toLocaleString()}{" "}
                          listeners
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Generate Button */}
      <AnimatePresence>
        {selectedSeeds.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={handleGenerate}
            className="w-full bg-accent text-on-accent px-6 py-4 rounded-full shadow-m3-2 hover:shadow-m3-3 transition-all font-medium flex items-center justify-center gap-2"
            {...buttonSpring}
          >
            <Sparkles className="w-5 h-5" />
            Discover Similar Music
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="bg-accent/5 rounded-2xl p-4 border border-accent/20">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-primary mb-2">Pro Tips</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Use 1 seed for pure recommendations based on that item</li>
              <li>• Use 2-3 seeds to find music that bridges your tastes</li>
              <li>• Mix artists + tracks + tags for more varied results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeedSelection;
