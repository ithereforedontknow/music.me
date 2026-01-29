import { motion } from "framer-motion";
import { Music, Filter, Palette, Home, Grid3x3 } from "lucide-react";
import { springExpressive } from "../utils/motion";

const TopBar = ({
  flowState,
  likedTracks,
  onHomeClick,
  onViewResults,
  onShowFilters,
  activeFilterCount,
  theme,
}) => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={springExpressive}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        {/* Brand Logo */}
        <motion.button
          onClick={onHomeClick}
          className="flex items-center gap-3 px-5 py-3 rounded-[28px] bg-card shadow-m3-2 border border-theme hover:shadow-m3-3 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="p-2 rounded-2xl bg-accent/10">
            <Music className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary">music.me</h1>
            <p className="text-xs text-secondary">Last.fm Discovery</p>
          </div>
        </motion.button>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Theme Picker */}
          <motion.button
            onClick={theme.toggleThemePicker}
            className="p-3 rounded-full bg-card shadow-m3-2 border border-theme hover:shadow-m3-3 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Palette className="w-5 h-5 text-primary" />
          </motion.button>

          {/* Home Button */}
          {flowState !== "prompt" && flowState !== "logo" && (
            <motion.button
              onClick={onHomeClick}
              className="p-3 rounded-full bg-card shadow-m3-2 border border-theme hover:shadow-m3-3 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5 text-primary" />
            </motion.button>
          )}

          {/* Bento Results Button */}
          {flowState === "swiping" && likedTracks.length > 0 && (
            <motion.button
              onClick={onViewResults}
              className="bg-accent text-on-accent px-5 py-3 rounded-full shadow-m3-2 hover:shadow-m3-3 transition-all hover:opacity-90 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Grid3x3 className="w-5 h-5" />
              <span className="font-medium">
                View Bento ({likedTracks.length})
              </span>
            </motion.button>
          )}

          {/* Filters Button */}
          {flowState === "prompt" && (
            <motion.button
              onClick={onShowFilters}
              className={`px-5 py-3 rounded-full shadow-m3-2 transition-all flex items-center gap-2 ${
                activeFilterCount > 0
                  ? "bg-accent text-on-accent hover:opacity-90"
                  : "bg-card border border-theme text-primary hover:shadow-m3-3"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default TopBar;
