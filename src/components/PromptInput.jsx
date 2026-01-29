import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { springExpressive } from "../utils/motion";

const PromptInput = ({ onSearch, onBack, onShowFilters }) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExamples, setShowExamples] = useState(true);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError("Please describe what you're looking for");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Pass the prompt string to parent
      await onSearch(prompt.trim());
    } catch (error) {
      console.error("Search error:", error);
      setError(
        "Couldn't find recommendations. Try different keywords or use the filters.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const examplePrompts = [
    "rock music for workout",
    "chill study beats",
    "happy indie songs",
    "sad rainy day music",
    "party dance tracks",
    "jazz classics",
    "electronic vibes",
    "folk storytelling",
    "r&b slow jams",
    "metal energy",
    "lofi hip hop",
    "disco funk",
    "classical focus",
    "reggae summer",
    "alternative rock",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {onBack && (
          <motion.button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </motion.button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">Discover Music</h1>
          <p className="text-secondary">Describe what you want to listen to</p>
        </div>
      </div>

      {/* Main Input Section */}
      <div className="bg-card rounded-3xl p-6 shadow-m3-2 border border-theme">
        <div className="space-y-6">
          {/* Input */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-accent" />
              <label className="text-sm font-medium text-primary">
                What kind of music are you looking for?
              </label>
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="Examples: 'rock music for workout', 'chill study beats', 'happy indie songs'..."
                className="w-full h-32 px-4 py-3 bg-secondary rounded-2xl border-2 border-theme focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none text-primary placeholder-secondary/60 resize-none transition-all"
                disabled={loading}
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 mt-2"
                >
                  {error}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <motion.button
                onClick={handleSubmit}
                disabled={loading || !prompt.trim()}
                className={`flex-1 px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-all ${
                  loading || !prompt.trim()
                    ? "bg-secondary text-secondary/60 cursor-not-allowed"
                    : "bg-accent text-on-accent hover:shadow-m3-3 shadow-m3-2"
                }`}
                whileHover={!loading && prompt.trim() ? { scale: 1.02 } : {}}
                whileTap={!loading && prompt.trim() ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching Last.fm...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Find Music
                  </>
                )}
              </motion.button>

              {onShowFilters && (
                <motion.button
                  onClick={onShowFilters}
                  className="px-6 py-3 rounded-full border-2 border-theme text-primary hover:border-accent hover:text-accent transition-all font-medium flex items-center gap-2 bg-card"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </motion.button>
              )}
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="pt-4 border-t border-theme">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-2 text-sm font-medium text-primary mb-3 hover:text-accent transition-colors"
            >
              {showExamples ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              Quick suggestions
            </button>

            {showExamples && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex flex-wrap gap-2"
              >
                {examplePrompts.map((example, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setPrompt(example)}
                    className="px-3 py-1.5 text-sm bg-secondary hover:bg-tertiary text-primary rounded-full transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {example}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-accent/10 border border-accent/20 rounded-2xl p-4"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-accent mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-primary mb-1">
              How it works
            </h3>
            <p className="text-sm text-secondary">
              Describe any music vibe using genres, moods, or activities. We'll
              search Last.fm's extensive database to find tracks that match your
              description.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PromptInput;
