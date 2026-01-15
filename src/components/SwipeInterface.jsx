import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Heart,
  X,
  Music,
  SkipForward,
  SkipBack,
  ListMusic,
  VolumeX,
  AlertCircle,
  Eye,
  Plus,
} from "lucide-react";

const SwipeInterface = ({
  deck,
  onBack,
  onSave,
  onViewResults,
  savedCount,
  likedTracks,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [showNoAudioAlert, setShowNoAudioAlert] = useState(false);
  const audioRef = useRef(new Audio());
  const [showMaxLikesModal, setShowMaxLikesModal] = useState(false);
  const [pendingSwipeAction, setPendingSwipeAction] = useState(null);

  const currentTrack = deck[currentIndex];
  const audioUrl = currentTrack?.preview || currentTrack?.preview_url;
  const hasAudio = Boolean(audioUrl);
  const MAX_LIKES = 10;

  // Reset audio when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setAudioLoaded(false);

      if (audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        setAudioLoaded(true);
        setShowNoAudioAlert(false);
      } else {
        setShowNoAudioAlert(true);
      }
    }
  }, [currentIndex, audioUrl]);

  const handleSwipe = (direction) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    setSwipeDirection(direction);

    // If user tries to like (right swipe) and has reached max likes
    if (direction === "right" && likedTracks.length >= MAX_LIKES) {
      setPendingSwipeAction({ direction, track: currentTrack });
      setShowMaxLikesModal(true);
      return;
    }

    proceedWithSwipe(direction);
  };

  // Helper function to handle the actual swipe action
  const proceedWithSwipe = (direction) => {
    // If it's a right swipe (like), call onSave
    if (direction === "right" && onSave) {
      onSave(currentTrack);
    }

    // Animate and move to next track
    setTimeout(() => {
      setSwipeDirection(null);
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // All tracks swiped, automatically go to results
        setTimeout(() => {
          if (onViewResults) onViewResults();
        }, 1000);
      }
    }, 300);
  };

  // Handle modal actions
  const handleModalChoice = (choice) => {
    if (choice === "add-more" && pendingSwipeAction && onSave) {
      onSave(pendingSwipeAction.track);

      setSwipeDirection(pendingSwipeAction.direction);
      setTimeout(() => {
        setSwipeDirection(null);
        if (currentIndex < deck.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setTimeout(() => {
            if (onViewResults) onViewResults();
          }, 1000);
        }
      }, 300);
    } else if (choice === "view-bento") {
      // Direct to results
      if (onViewResults) {
        onViewResults();
      }
    }

    setShowMaxLikesModal(false);
    setPendingSwipeAction(null);
  };

  // Toggle play/pause with alert for no audio
  const togglePlay = () => {
    if (!hasAudio) {
      // Show a better message
      setShowNoAudioAlert(true);
      setTimeout(() => setShowNoAudioAlert(false), 3000);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  // Skip to next/previous
  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      handleSwipe("left");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;

    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  if (deck.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h3 className="text-2xl font-bold text-white mb-2">
          No playable tracks found
        </h3>
        <p className="text-gray-400 mb-6">Try different moods or genres.</p>
        <button
          onClick={onBack}
          className="bg-white text-black px-6 py-3 rounded-xl"
        >
          Try again
        </button>
      </div>
    );
  }
  if (!currentTrack) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <h3 className="text-2xl font-bold text-white mb-4">
          Discovery Complete!
        </h3>
        <p className="text-gray-400 mb-6 text-center">
          You saved {likedTracks.length} out of {deck.length} tracks
        </p>
        <button
          onClick={onBack}
          className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
        >
          Start New Discovery
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto px-4">
      {/* Max Likes Modal */}
      <AnimatePresence>
        {showMaxLikesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => {
              setShowMaxLikesModal(false);
              setPendingSwipeAction(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-[#060010] border border-purple-500/40 rounded-2xl p-8 max-w-md w-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
              style={{
                boxShadow: "0 0 60px rgba(132, 0, 255, 0.3)",
              }}
            >
              {/* Simplified decorative corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-purple-500/60 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-purple-500/60 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-purple-500/60 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-purple-500/60 rounded-br-lg"></div>

              <div className="text-center mb-8">
                {/* Simplified icon - removed animation to reduce lag */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-900/40 border border-purple-500/40 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-purple-300" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  Your Bento is Full!
                </h3>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 mb-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-white">
                    {likedTracks.length} tracks saved
                  </p>
                </div>
                <p className="text-gray-300 text-sm">
                  Continue adding tracks or view your complete bento.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleModalChoice("add-more")}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add More Tracks</span>
                </button>

                <button
                  onClick={() => handleModalChoice("view-bento")}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View My Bento</span>
                </button>

                <button
                  onClick={() => {
                    setShowMaxLikesModal(false);
                    setPendingSwipeAction(null);
                  }}
                  className="w-full py-3 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-lg font-medium transition-colors border border-gray-700"
                >
                  Continue Swiping
                </button>
              </div>

              {/* Simplified bottom element */}
              <div className="mt-6 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-500 text-center">
                  Music collection complete
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* No audio alert */}
      <AnimatePresence>
        {showNoAudioAlert && !hasAudio && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-300">
              No audio preview available for this track
            </p>
            <button
              onClick={() => setShowNoAudioAlert(false)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            Track {currentIndex + 1} of {deck.length}
          </span>
          {likedTracks.length > 0 && (
            <div className="text-sm text-gray-400 flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{likedTracks.length} saved</span>
            </div>
          )}
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Swipe feedback */}
      <AnimatePresence>
        {swipeDirection && (
          <motion.div
            key="swipe-feedback"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none ${
              swipeDirection === "right" ? "text-purple-400" : "text-gray-400"
            }`}
          >
            <div className="text-7xl font-bold opacity-90">
              {swipeDirection === "right" ? "❤️" : "✕"}
            </div>
            <div
              className={`text-lg font-bold mt-2 ${
                swipeDirection === "right" ? "text-purple-300" : "text-gray-300"
              }`}
            >
              {swipeDirection === "right" ? "Added!" : "Skipped"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(e, info) => {
          if (Math.abs(info.offset.x) > 100) {
            handleSwipe(info.offset.x > 0 ? "right" : "left");
          }
        }}
        className="relative bg-[#060010] border border-purple-500/30 rounded-2xl overflow-hidden"
        animate={{
          x:
            swipeDirection === "left"
              ? -300
              : swipeDirection === "right"
                ? 300
                : 0,
          rotate:
            swipeDirection === "left"
              ? -10
              : swipeDirection === "right"
                ? 10
                : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          boxShadow: "0 0 40px rgba(132, 0, 255, 0.2)",
        }}
      >
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-purple-500/50 rounded-tl-md"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-purple-500/50 rounded-tr-md"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-purple-500/50 rounded-bl-md"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-purple-500/50 rounded-br-md"></div>

        {/* Album art */}
        <div className="aspect-square relative overflow-hidden">
          <img
            src={
              currentTrack.album?.cover_big ||
              currentTrack.album?.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop"
            }
            alt={currentTrack.title || currentTrack.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Track info overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white truncate">
              {currentTrack.title || currentTrack.name}
            </h3>
            <p className="text-gray-300 text-sm truncate">
              {currentTrack.artist?.name ||
                currentTrack.artists?.map((a) => a.name).join(", ")}
            </p>
          </div>

          {/* Play overlay */}
          <button
            onClick={togglePlay}
            className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center ${
              hasAudio
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-700 cursor-not-allowed"
            } transition-colors`}
          >
            {!hasAudio ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Action buttons */}
        <div className="p-6">
          <div className="flex gap-3">
            <button
              onClick={() => handleSwipe("left")}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-300" />
              </div>
              <span className="text-sm font-medium text-gray-300">Skip</span>
            </button>

            <button
              onClick={() => handleSwipe("right")}
              className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 border border-purple-500/30 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-white">
                Add to Bento
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Navigation controls */}
      <div className="flex items-center justify-center gap-4 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`p-2 rounded-lg ${
            currentIndex === 0
              ? "text-white/20 cursor-not-allowed"
              : "text-white hover:bg-white/10"
          } transition-colors`}
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-1">
                <X className="w-3 h-3 text-gray-300" />
              </div>
              <span className="text-xs text-gray-300">Swipe left</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mb-1">
                <Heart className="w-3 h-3 text-purple-300" />
              </div>
              <span className="text-xs text-purple-300">Swipe right</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === deck.length - 1}
          className={`p-2 rounded-lg ${
            currentIndex === deck.length - 1
              ? "text-white/20 cursor-not-allowed"
              : "text-white hover:bg-white/10"
          } transition-colors`}
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Audio warning */}
      {!hasAudio && (
        <div className="px-4">
          <div className="py-2 bg-white/5 border border-white/10 rounded-lg text-center">
            <span className="text-xs text-gray-400">
              No audio preview available
            </span>
          </div>
        </div>
      )}

      {/* Spotify link */}
      <div className="px-4">
        <a
          href={`https://open.spotify.com/search/${encodeURIComponent(
            `${currentTrack.title || currentTrack.name} ${
              currentTrack.artist?.name || currentTrack.artists?.[0]?.name
            }`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 text-center bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20 flex items-center justify-center gap-2"
        >
          <span className="text-sm text-white font-medium">
            Listen on Spotify
          </span>
        </a>
      </div>

      {/* Bento preview */}
      {likedTracks.length > 0 && (
        <div className="px-4">
          <div className="py-3 border-t border-white/10">
            <h4 className="text-sm text-gray-400 mb-2">
              Your Bento ({likedTracks.length})
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {likedTracks.slice(0, 10).map((track, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/5"
                >
                  <img
                    src={
                      track.album?.cover_big ||
                      "https://via.placeholder.com/100"
                    }
                    className="w-full h-full object-cover"
                    alt=""
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/100";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeInterface;
