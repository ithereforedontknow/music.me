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
  Music,
  PartyPopper,
  X,
  Grid3x3,
} from "lucide-react";
import { springExpressive, buttonSpring } from "../utils/motion";
import { fetchHighResArtwork } from "../services/seedRecommendationService";
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
  const [recommendations, setRecommendations] = useState([]);
  const currentTrack = deck[currentIndex];
  const MAX_SUGGESTED = 20;
  useEffect(() => {
    const hydrateImages = async () => {
      // Only hydrate the next 3 tracks to save API calls
      const tracksToHydrate = recommendations.slice(
        currentIndex,
        currentIndex + 3,
      );

      const updatedTracks = await Promise.all(
        tracksToHydrate.map(async (track) => {
          if (track.isHydrated) return track;
          const highRes = await fetchHighResArtwork(track);
          return { ...track, image: highRes, isHydrated: true };
        }),
      );

      // Update your state with the new high-res versions
      setRecommendations((prev) => {
        const newRecs = [...prev];
        updatedTracks.forEach((updated, i) => {
          newRecs[currentIndex + i] = updated;
        });
        return newRecs;
      });
    };

    if (recommendations.length > 0) {
      hydrateImages();
    }
  }, [currentIndex, recommendations.length]);
  useEffect(() => {
    const hydrateNext = async () => {
      // Look ahead 2 tracks so they are ready before the user swipes
      const nextTracks = deck.slice(currentIndex, currentIndex + 3);

      for (let track of nextTracks) {
        if (!track.isHydrated) {
          const highRes = await fetchHighResArtwork(track); // Use the utility we discussed
          track.image = highRes;
          track.isHydrated = true;
        }
      }
    };
    hydrateNext();
  }, [currentIndex, deck]);
  const getTrackImage = (track) => {
    if (!track) return "";
    // If we've already hydrated a high-res image, use it
    if (track.highResImage) return track.highResImage;
    // If Last.fm provided an image string, use it
    if (typeof track.image === "string" && track.image.startsWith("http"))
      return track.image;

    // Fallback if no image exists
    const initials =
      (track.name?.charAt(0) || "M") + (track.artist?.name?.charAt(0) || "A");
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=7D5260&color=fff`;
  };
  const trackImage = currentTrack ? getTrackImage(currentTrack) : null;
  const hasAudio = Boolean(currentTrack?.preview);

  const handleSwipe = (direction) => {
    if (swipeDirection) return;

    if (direction === "right") {
      if (likedTracks.length >= MAX_SUGGESTED) {
        setPendingSwipeAction({ direction, track: currentTrack });
        setShowMaxLikesModal(true);
        return;
      }
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
    setShowMaxLikesModal(false);

    if (choice === "add-more" && pendingSwipeAction && onSave) {
      onSave(pendingSwipeAction.track);
      proceedWithSwipe(pendingSwipeAction.direction);
    } else if (choice === "view-bento") {
      if (onViewResults) onViewResults();
    }

    setPendingSwipeAction(null);
  };

  const togglePlay = () => {
    if (!currentTrack?.preview) {
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
        <Music className="w-16 h-16 text-accent mb-4" />
        <h3 className="text-2xl font-semibold text-primary mb-2">
          No tracks found
        </h3>
        <p className="text-secondary mb-6">Try different seeds.</p>
        <motion.button
          onClick={onBack}
          className="bg-accent text-on-accent px-6 py-3 rounded-full shadow-m3-2 hover:shadow-m3-3 transition-all font-medium"
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
        <PartyPopper className="w-16 h-16 text-accent mb-4" />
        <h3 className="text-2xl font-semibold text-primary mb-3">
          Discovery Complete!
        </h3>
        <p className="text-secondary mb-6">
          You saved {likedTracks.length} out of {deck.length} tracks
        </p>
        <motion.button
          onClick={onBack}
          className="bg-accent text-on-accent px-6 py-3 rounded-full shadow-m3-2 hover:shadow-m3-3 transition-all font-medium flex items-center gap-2"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-card rounded-3xl p-6 max-w-md w-full shadow-2xl border border-theme"
            >
              <div className="text-center mb-6">
                <Grid3x3 className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-3">
                  Nice Collection! ({likedTracks.length} tracks)
                </h3>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full mb-4 border border-accent/20">
                  <p className="text-sm font-medium text-accent">
                    {likedTracks.length} tracks saved
                  </p>
                </div>
                <p className="text-secondary">
                  You can add more tracks or view your collection!
                </p>
              </div>

              <div className="space-y-3">
                <motion.button
                  onClick={() => handleModalChoice("add-more")}
                  className="bg-accent text-on-accent px-6 py-3 rounded-full shadow-m3-2 hover:shadow-m3-3 transition-all font-medium w-full flex items-center justify-center gap-2"
                  {...buttonSpring}
                >
                  <Plus className="w-4 h-4" />
                  Add This Track Anyway
                </motion.button>

                <motion.button
                  onClick={() => handleModalChoice("view-bento")}
                  className="border-2 border-theme text-primary px-6 py-3 rounded-full hover:border-accent hover:bg-accent/5 transition-all font-medium bg-card w-full flex items-center justify-center gap-2"
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
          <span className="text-secondary">
            Track {currentIndex + 1} of {deck.length}
          </span>
          {likedTracks.length > 0 && (
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-accent" />
              <span className="text-primary font-medium">
                {likedTracks.length} saved
              </span>
            </div>
          )}
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full transition-all duration-500"
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
              className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center"
            >
              {swipeDirection === "right" ? (
                <Heart className="w-16 h-16 text-accent fill-accent" />
              ) : (
                <X className="w-16 h-16 text-secondary" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Card */}
        <motion.div
          className="relative bg-card rounded-2xl overflow-hidden shadow-m3-3 border border-theme"
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
          <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5">
            {trackImage ? (
              <img
                src={trackImage}
                alt={currentTrack?.name}
                // ONLY apply crossOrigin if it's NOT a UI-Avatar link
                crossOrigin={
                  trackImage.includes("ui-avatars.com")
                    ? undefined
                    : "anonymous"
                }
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/500?text=No+Art";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-20 h-20 text-accent" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Play Button */}
            <motion.button
              onClick={togglePlay}
              className={`absolute top-3 right-3 w-12 h-12 rounded-full flex items-center justify-center shadow-m3-2 ${
                hasAudio
                  ? "bg-accent text-on-accent"
                  : "bg-secondary text-secondary cursor-not-allowed"
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
                    {currentTrack.reason}
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
                className="border-2 border-theme text-primary px-6 py-3 rounded-full hover:border-secondary hover:bg-secondary transition-all font-medium bg-card flex flex-col items-center gap-2"
                {...buttonSpring}
              >
                <ThumbsDown className="w-5 h-5" />
                <span className="text-sm font-medium">Not for me</span>
              </motion.button>

              <motion.button
                onClick={() => handleSwipe("right")}
                className="bg-accent text-on-accent px-6 py-3 rounded-full shadow-m3-2 hover:shadow-m3-3 transition-all font-medium flex flex-col items-center gap-2"
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
            `https://youtube.com/results?search_query=${encodeURIComponent(`${currentTrack.title || currentTrack.name} ${currentTrack.artist?.name}`)}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-theme text-primary px-6 py-3 rounded-full hover:border-accent hover:bg-accent/5 transition-all font-medium bg-card flex items-center justify-center gap-2"
          {...buttonSpring}
        >
          <ExternalLink className="w-4 h-4" />
          <span className="text-sm font-medium">Listen on YouTube</span>
        </motion.a>

        <motion.button
          onClick={onViewResults}
          disabled={likedTracks.length === 0}
          className={`flex items-center justify-center gap-2 py-3 rounded-full transition-all ${
            likedTracks.length > 0
              ? "bg-accent/10 text-accent px-6 shadow-m3-2 hover:shadow-m3-3 font-medium hover:bg-accent/20 border border-accent/20"
              : "bg-secondary text-secondary/60 px-6 cursor-not-allowed border border-theme"
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
          className="p-3 bg-accent/5 rounded-2xl border border-accent/20"
        >
          <h4 className="text-sm font-medium text-accent mb-2">
            Your Bento ({likedTracks.length} tracks)
          </h4>
          <div className="grid grid-cols-4 gap-1.5">
            {likedTracks.slice(0, 8).map((track, i) => {
              const trackImg = getTrackImage(track);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-square rounded-lg overflow-hidden bg-card border border-accent/20"
                >
                  {trackImg ? (
                    <img
                      src={trackImg}
                      className="w-full h-full object-cover"
                      alt=""
                      onError={(e) => {
                        e.target.style.display = "none";
                        const parent = e.target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-accent/10 rounded-lg">
                              <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                              </svg>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-accent/10">
                      <Music className="w-6 h-6 text-accent" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SwipeInterface;
