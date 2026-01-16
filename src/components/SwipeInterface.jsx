import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Heart,
  VolumeX,
  AlertCircle,
  Eye,
  Plus,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from "lucide-react";
import { springExpressive, buttonSpring } from "../utils/motion";

const SwipeInterface = ({
  deck,
  onBack,
  onSave,
  onViewResults,
  likedTracks,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showNoAudioAlert, setShowNoAudioAlert] = useState(false);
  const [showMaxLikesModal, setShowMaxLikesModal] = useState(false);
  const [pendingSwipeAction, setPendingSwipeAction] = useState(null);

  const currentTrack = deck[currentIndex];
  const audioUrl = currentTrack?.preview;
  const hasAudio = Boolean(audioUrl);
  const MAX_LIKES = 10;

  const handleSwipe = (direction) => {
    if (direction === "right" && likedTracks.length >= MAX_LIKES) {
      setPendingSwipeAction({ direction, track: currentTrack });
      setShowMaxLikesModal(true);
      return;
    }

    proceedWithSwipe(direction);
  };

  const proceedWithSwipe = (direction) => {
    if (direction === "right" && onSave) {
      onSave(currentTrack);
    }

    setSwipeDirection(direction);

    setTimeout(() => {
      setSwipeDirection(null);
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setTimeout(() => {
          if (onViewResults) onViewResults();
        }, 800);
      }
    }, 300);
  };

  const handleModalChoice = (choice) => {
    if (choice === "add-more" && pendingSwipeAction && onSave) {
      onSave(pendingSwipeAction.track);
      proceedWithSwipe(pendingSwipeAction.direction);
    } else if (choice === "view-bento") {
      if (onViewResults) onViewResults();
    }

    setShowMaxLikesModal(false);
    setPendingSwipeAction(null);
  };

  const togglePlay = () => {
    if (!hasAudio) {
      setShowNoAudioAlert(true);
      setTimeout(() => setShowNoAudioAlert(false), 3000);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  // Empty deck state
  if (deck.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={springExpressive}
        className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center"
      >
        <div className="text-5xl mb-4">🎵</div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          No tracks found
        </h3>
        <p className="text-gray-600 mb-6">Try different moods or genres.</p>
        <motion.button
          onClick={onBack}
          className="bg-pink-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-pink-600 font-medium"
          {...buttonSpring}
        >
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  // End of deck state
  if (!currentTrack) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={springExpressive}
        className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">
          Discovery Complete!
        </h3>
        <p className="text-gray-600 mb-6">
          You saved {likedTracks.length} out of {deck.length} tracks
        </p>
        <motion.button
          onClick={onBack}
          className="bg-pink-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-pink-600 font-medium flex items-center gap-2"
          {...buttonSpring}
        >
          Start New Discovery
          <Sparkles className="w-4 h-4" />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 max-w-md mx-auto px-4">
      {/* Max Likes Modal */}
      <AnimatePresence>
        {showMaxLikesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200"
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🍱</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Your Bento is Full!
                </h3>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-100 rounded-full mb-4">
                  <p className="text-sm font-medium text-pink-800">
                    {likedTracks.length} tracks saved
                  </p>
                </div>
                <p className="text-gray-600">
                  Continue adding or view your complete bento collection!
                </p>
              </div>

              <div className="space-y-3">
                <motion.button
                  onClick={() => handleModalChoice("add-more")}
                  className="bg-pink-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-pink-600 font-medium w-full flex items-center justify-center gap-2"
                  {...buttonSpring}
                >
                  <Plus className="w-4 h-4" />
                  Add More Tracks
                </motion.button>

                <motion.button
                  onClick={() => handleModalChoice("view-bento")}
                  className="border-2 border-gray-300 text-pink-500 px-6 py-3 rounded-full hover:border-pink-500 hover:bg-pink-50 transition-all font-medium bg-white w-full flex items-center justify-center gap-2"
                  {...buttonSpring}
                >
                  <Eye className="w-4 h-4" />
                  View My Bento
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            Track {currentIndex + 1} of {deck.length}
          </span>
          {likedTracks.length > 0 && (
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-gray-800 font-medium">
                {likedTracks.length} saved
              </span>
            </div>
          )}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-pink-500 rounded-full transition-all duration-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
            transition={springExpressive}
          />
        </div>
      </div>

      {/* Swipe Card */}
      <div className="relative">
        {/* Swipe Feedback */}
        <AnimatePresence>
          {swipeDirection && (
            <motion.div
              key="swipe-feedback"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className={`absolute inset-0 z-30 pointer-events-none flex items-center justify-center ${
                swipeDirection === "right" ? "text-pink-500" : "text-gray-500"
              }`}
            >
              <div className="text-6xl">
                {swipeDirection === "right" ? "❤️" : "✕"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Card */}
        <motion.div
          className="relative bg-white rounded-2xl overflow-hidden shadow-xl"
          animate={{
            x:
              swipeDirection === "left"
                ? -300
                : swipeDirection === "right"
                  ? 300
                  : 0,
          }}
          transition={springExpressive}
        >
          {/* Album Art */}
          <div className="aspect-square relative overflow-hidden bg-gray-100">
            {currentTrack.album?.cover_big || currentTrack.thumbnail ? (
              <img
                src={currentTrack.album?.cover_big || currentTrack.thumbnail}
                alt={currentTrack.title || currentTrack.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center">
                      <div class="text-4xl">🎵</div>
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-4xl">🎵</div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Play Button */}
            <motion.button
              onClick={togglePlay}
              className={`absolute top-3 right-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                hasAudio
                  ? "bg-pink-500 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
              whileHover={hasAudio ? { scale: 1.1 } : {}}
              whileTap={hasAudio ? { scale: 0.9 } : {}}
            >
              {!hasAudio ? (
                <VolumeX className="w-5 h-5" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </motion.button>

            {/* Track Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="space-y-0.5">
                <h3 className="text-lg font-semibold text-white">
                  {currentTrack.title || currentTrack.name}
                </h3>
                <p className="text-gray-200">{currentTrack.artist?.name}</p>
                {currentTrack.reason && (
                  <p className="text-sm text-gray-300 italic">
                    "{currentTrack.reason}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={() => handleSwipe("left")}
                className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-full hover:border-gray-400 hover:bg-gray-50 transition-all font-medium bg-white flex flex-col items-center gap-2"
                {...buttonSpring}
              >
                <ThumbsDown className="w-5 h-5" />
                <span className="text-sm font-medium">Not for me</span>
              </motion.button>

              <motion.button
                onClick={() => handleSwipe("right")}
                className="bg-pink-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-pink-600 font-medium flex flex-col items-center gap-2"
                {...buttonSpring}
              >
                <ThumbsUp className="w-5 h-5" />
                <span className="text-sm font-medium">Add to Bento</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Audio Warning */}
      <AnimatePresence>
        {showNoAudioAlert && !hasAudio && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-amber-100 border border-amber-200 rounded-xl flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-amber-800">No audio preview available</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <motion.a
          href={
            currentTrack.url ||
            `https://youtube.com/results?search_query=${encodeURIComponent(`${currentTrack.title} ${currentTrack.artist?.name}`)}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-gray-300 text-pink-500 px-6 py-3 rounded-full hover:border-pink-500 hover:bg-pink-50 transition-all font-medium bg-white flex items-center justify-center gap-2"
          {...buttonSpring}
        >
          <ExternalLink className="w-4 h-4" />
          <span className="text-sm font-medium">Listen on YouTube</span>
        </motion.a>

        <motion.button
          onClick={onViewResults}
          disabled={likedTracks.length === 0}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl ${
            likedTracks.length > 0
              ? "bg-pink-100 text-pink-800 px-6 rounded-full shadow hover:shadow-lg transition-all font-medium hover:bg-pink-200"
              : "bg-gray-200 text-gray-500 px-6 py-3 rounded-xl cursor-not-allowed"
          }`}
          {...buttonSpring}
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">
            View Bento ({likedTracks.length})
          </span>
        </motion.button>
      </div>

      {/* Bento Preview */}
      {likedTracks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-pink-50 rounded-2xl border border-pink-100"
        >
          <h4 className="text-sm font-medium text-pink-800 mb-2">
            Your Bento Preview ({likedTracks.length}/10)
          </h4>
          <div className="grid grid-cols-4 gap-1.5">
            {likedTracks.slice(0, 8).map((track, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="aspect-square rounded-lg overflow-hidden bg-white border border-pink-200"
              >
                {track.album?.cover_big || track.thumbnail ? (
                  <img
                    src={track.album?.cover_big || track.thumbnail}
                    className="w-full h-full object-cover"
                    alt=""
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-pink-100 rounded-lg">
                          <div class="text-lg">🎵</div>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-pink-100 rounded-lg">
                    <div className="text-lg">🎵</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SwipeInterface;
