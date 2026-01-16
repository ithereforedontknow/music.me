import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Music,
  SkipForward,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import {
  springExpressive,
  staggerContainer,
  staggerItems,
  buttonSpring,
} from "../../utils/motion";

const ReferenceTrack = ({ onComplete, initialData, onSkip }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(
    initialData.referenceTrack || null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const searchTimeoutRef = useRef(null);

  const searchTracks = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockResults = [
        {
          id: "1",
          title: "Blinding Lights",
          artist: { name: "The Weeknd" },
          thumbnail: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg",
          duration: 200,
          url: "https://youtube.com/watch?v=4NRXx6U8ABQ",
        },
        {
          id: "2",
          title: "Stay",
          artist: { name: "The Kid LAROI, Justin Bieber" },
          thumbnail: "https://i.ytimg.com/vi/kTJczUoc26U/hqdefault.jpg",
          duration: 141,
          url: "https://youtube.com/watch?v=kTJczUoc26U",
        },
        {
          id: "3",
          title: "good 4 u",
          artist: { name: "Olivia Rodrigo" },
          thumbnail: "https://i.ytimg.com/vi/gNi_6U5Pm_o/hqdefault.jpg",
          duration: 178,
          url: "https://youtube.com/watch?v=gNi_6U5Pm_o",
        },
        {
          id: "4",
          title: "Heat Waves",
          artist: { name: "Glass Animals" },
          thumbnail: "https://i.ytimg.com/vi/mRD0-GxqHVo/hqdefault.jpg",
          duration: 238,
          url: "https://youtube.com/watch?v=mRD0-GxqHVo",
        },
        {
          id: "5",
          title: "As It Was",
          artist: { name: "Harry Styles" },
          thumbnail: "https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg",
          duration: 167,
          url: "https://youtube.com/watch?v=H5v3kku4y6Q",
        },
      ].filter(
        (track) =>
          track.title.toLowerCase().includes(query.toLowerCase()) ||
          track.artist.name.toLowerCase().includes(query.toLowerCase()),
      );

      setSearchResults(mockResults);
    } catch (error) {
      setSearchError("Search failed. Using demo data instead.");
      console.error("Search error:", error);
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

    if (value.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchTracks(value);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectTrack = (track) => {
    setSelectedTrack({
      ...track,
      name: track.title,
      album: { cover_small: track.thumbnail },
    });
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
    onSkip?.();
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-20">
      {/* M3: Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={springExpressive}
          className="inline-flex items-center justify-center w-16 h-16 rounded-[28px] bg-tertiary-container mb-4"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            <Music className="w-8 h-8 text-on-tertiary-container" />
          </motion.div>
        </motion.div>

        <div className="space-y-2">
          <h2 className="headline-small text-on-surface">
            Find Your Sound Reference
          </h2>
          <p className="body-large text-on-surface-variant">
            Add a track you love for personalized recommendations
          </p>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, ...springExpressive }}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container-high rounded-full mt-3"
        >
          <AlertCircle className="w-3 h-3 text-tertiary" />
          <span className="label-small text-on-surface-variant">
            Optional - skip for fresh discoveries
          </span>
        </motion.div>
      </div>

      {/* M3: Search */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for a song, artist, or album..."
              className="w-full bg-surface-container-high text-on-surface pl-12 pr-10 py-3 rounded-2xl body-medium placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant"
              disabled={!!selectedTrack}
            />

            {isSearching && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <div className="w-4 h-4 border-2 border-outline-variant border-t-primary rounded-full" />
              </motion.div>
            )}
          </div>

          {/* Search Results */}
          <AnimatePresence>
            {searchResults.length > 0 && !selectedTrack && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute w-full mt-2 bg-surface-container-high border border-outline-variant rounded-2xl shadow-m3-2 z-10 max-h-64 overflow-y-auto"
              >
                {searchResults.map((track, index) => (
                  <motion.button
                    key={track.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectTrack(track)}
                    className="w-full p-3 hover:bg-surface-container text-left border-b border-outline-variant last:border-b-0 flex items-center gap-3"
                    whileHover={{ x: 2 }}
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={track.thumbnail}
                        alt=""
                        className="w-12 h-12 object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="label-medium font-medium text-on-surface truncate">
                        {track.title}
                      </div>
                      <div className="body-small text-on-surface-variant truncate">
                        {track.artist.name}
                      </div>
                    </div>
                    <div className="label-small text-on-surface-variant bg-surface-variant px-2 py-1 rounded-full">
                      {Math.floor(track.duration / 60)}:
                      {(track.duration % 60).toString().padStart(2, "0")}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Error */}
        {searchError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-error-container rounded-xl body-small text-on-error-container"
          >
            ⚠️ {searchError}
          </motion.div>
        )}
      </div>

      {/* Selected Track */}
      <AnimatePresence>
        {selectedTrack && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-primary-container/20 border border-primary/20 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ rotate: 5 }} className="relative">
                  <img
                    src={selectedTrack.album?.cover_small}
                    alt=""
                    className="w-16 h-16 rounded-xl"
                  />
                </motion.div>
                <div>
                  <h4 className="title-medium font-medium text-on-surface">
                    {selectedTrack.title || selectedTrack.name}
                  </h4>
                  <p className="body-small text-on-surface-variant">
                    {selectedTrack.artist?.name}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={handleRemoveTrack}
                className="text-on-surface-variant hover:text-on-surface p-2 hover:bg-surface-container rounded-full"
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 pt-3 border-t border-primary/10 flex items-center gap-2"
            >
              <div className="p-1.5 bg-primary/10 rounded-full">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="body-small text-on-surface-variant">
                Perfect! We'll find similar vibes for you
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Picks */}
      {!selectedTrack && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-6 border-t border-outline-variant mb-8"
        >
          <h4 className="label-large font-medium text-on-surface mb-3">
            Popular picks to get started
          </h4>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {[
              { title: "Blinding Lights", artist: "The Weeknd", emoji: "💡" },
              { title: "Stay", artist: "Kid LAROI, Bieber", emoji: "⏳" },
              { title: "good 4 u", artist: "Olivia Rodrigo", emoji: "⚡" },
            ].map((track, index) => (
              <motion.button
                key={index}
                variants={staggerItems}
                onClick={() =>
                  handleSelectTrack({
                    id: `quick_${index}`,
                    title: track.title,
                    artist: { name: track.artist },
                    thumbnail: `https://via.placeholder.com/150/4f46e5/ffffff?text=${encodeURIComponent(track.emoji)}`,
                    duration: 180,
                  })
                }
                className="p-3 bg-surface-container-high hover:bg-surface-container border border-outline-variant rounded-xl text-left"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{track.emoji}</span>
                  <span className="label-medium font-medium text-on-surface">
                    {track.title}
                  </span>
                </div>
                <div className="body-small text-on-surface-variant">
                  {track.artist}
                </div>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          onClick={handleSkip}
          className="m3-button-outlined flex-1 py-3 flex items-center justify-center gap-2"
          {...buttonSpring}
        >
          <SkipForward className="w-5 h-5 text-tertiary" />
          <span className="label-large font-medium">Skip & Discover Fresh</span>
        </motion.button>

        <motion.button
          onClick={handleContinue}
          disabled={!selectedTrack}
          className={`flex-1 py-3 rounded-2xl label-large font-medium flex items-center justify-center gap-2 ${
            selectedTrack
              ? "m3-button-filled"
              : "bg-surface-container text-on-surface-variant cursor-not-allowed"
          }`}
          whileHover={selectedTrack ? { scale: 1.02 } : {}}
          whileTap={selectedTrack ? { scale: 0.98 } : {}}
        >
          {selectedTrack ? (
            <>
              <span>Continue to Discovery</span>
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            </>
          ) : (
            "Select a track or skip"
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default ReferenceTrack;
