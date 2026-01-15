import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Music, SkipForward } from "lucide-react";

export const ReferenceTrack = ({ onComplete, initialData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(
    initialData.referenceTrack || null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  const searchTracks = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Using CORS proxy
      const proxyUrl = "https://corsproxy.io/?";
      const apiUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=5`;

      const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
      const data = await response.json();
      setSearchResults(data.data || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchTracks(value);
    }, 300);
  };

  const handleSelectTrack = (track) => {
    setSelectedTrack(track);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveTrack = () => {
    setSelectedTrack(null);
  };

  const handleContinue = () => {
    onComplete({ referenceTrack: selectedTrack });
  };

  const handleSkip = () => {
    onComplete({ referenceTrack: null });
  };

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for a track, artist, or album..."
            className="w-full bg-white/10 border border-white/20 text-white pl-12 pr-4 py-3 rounded-2xl text-base placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-all duration-300"
            disabled={!!selectedTrack}
          />
          {isSearching && (
            <div className="absolute right-4 top-4">
              <div className="w-5 h-5 border-2 border-white/20 border-t-violet-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Search results dropdown */}
        <AnimatePresence>
          {searchResults.length > 0 && !selectedTrack && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute w-full mt-2 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-10 max-h-80 overflow-y-auto"
            >
              {searchResults.map((track, index) => (
                <motion.button
                  key={track.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectTrack(track)}
                  className="w-full p-3 hover:bg-white/5 text-left border-b border-white/5 last:border-b-0 transition-colors duration-300 flex items-center gap-3"
                >
                  <img
                    src={track.album.cover_small}
                    alt=""
                    className="w-12 h-12 rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">
                      {track.title}
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                      {track.artist.name}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.floor(track.duration / 60)}:
                    {(track.duration % 60).toString().padStart(2, "0")}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected track preview */}
      <AnimatePresence>
        {selectedTrack && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-violet-600/20 border border-white/10 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTrack.album.cover_small}
                  alt=""
                  className="w-14 h-14 rounded-xl"
                />
                <div>
                  <h4 className="font-bold text-white">
                    {selectedTrack.title}
                  </h4>
                  <p className="text-sm text-gray-300">
                    {selectedTrack.artist.name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveTrack}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper text */}
      <div className="text-center">
        <p className="text-sm text-gray-400">
          {selectedTrack
            ? "Great choice! This will help personalize your recommendations."
            : "Skip if you want completely fresh discoveries"}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSkip}
          className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <SkipForward className="w-4 h-4" />
          Skip & Discover Fresh
        </button>

        <motion.button
          onClick={handleContinue}
          className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue to Generation
        </motion.button>
      </div>
    </div>
  );
};

export default ReferenceTrack;
