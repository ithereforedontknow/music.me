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
} from "lucide-react";

const SwipeInterface = ({
  deck,
  onBack,
  onSave,
  onViewResults,
  savedCount,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedTracks, setLikedTracks] = useState([]);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [showNoAudioAlert, setShowNoAudioAlert] = useState(false);
  const audioRef = useRef(new Audio());

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

  // Handle swipe
  const handleSwipe = (direction) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    setSwipeDirection(direction);

    if (likedTracks.length >= MAX_LIKES) {
      const proceed = window.confirm(
        "You’ve reached 10 saved songs. Add more anyway?",
      );
      if (!proceed) return;
    }
    setLikedTracks([...likedTracks, currentTrack]);

    setTimeout(() => {
      setSwipeDirection(null);
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setTimeout(() => onBack(), 1000);
      }
    }, 300);
  };

  // Toggle play/pause with alert for no audio
  const togglePlay = () => {
    if (!hasAudio) {
      alert("This track has no audio preview available.");
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

  // if (!currentTrack || deck.length === 0) {
  //   return (
  //     <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
  //       <h3 className="text-2xl font-bold text-white mb-4">
  //         Discovery Complete!
  //       </h3>
  //       <p className="text-gray-400 mb-6 text-center">
  //         You saved {likedTracks.length} out of {deck.length} tracks
  //       </p>
  //       <button
  //         onClick={onBack}
  //         className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
  //       >
  //         Start New Discovery
  //       </button>
  //     </div>
  //   );
  // }
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
          {savedCount > 0 && (
            <button
              onClick={() => onViewResults?.()}
              className="text-sm text-white hover:text-gray-300 transition-colors flex items-center gap-1"
            >
              <ListMusic className="w-4 h-4" />
              <span>{savedCount} saved</span>
            </button>
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
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none ${
              swipeDirection === "right" ? "text-green-500" : "text-red-500"
            }`}
          >
            <div className="text-6xl">
              {swipeDirection === "right" ? "✓" : "✕"}
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
        className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
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
      >
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Play overlay */}
          <button
            onClick={togglePlay}
            className={`absolute ... ${
              hasAudio
                ? "bg-white hover:bg-gray-100"
                : "bg-red-500/40 cursor-not-allowed"
            }`}
          >
            {!hasAudio ? (
              <VolumeX className="w-6 h-6 text-black" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 text-black" />
            ) : (
              <Play className="w-6 h-6 text-black ml-1" />
            )}
          </button>
        </div>

        {/* Track info */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white truncate">
              {currentTrack.title || currentTrack.name}
            </h3>
            <p className="text-gray-400 text-sm truncate">
              {currentTrack.artist?.name ||
                currentTrack.artists?.map((a) => a.name).join(", ")}
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {currentTrack.album && (
              <div className="flex items-center gap-1">
                <Music className="w-4 h-4" />
                <span className="truncate">
                  {currentTrack.album.title || currentTrack.album.name}
                </span>
              </div>
            )}
            {currentTrack.duration && (
              <span>
                {Math.floor(currentTrack.duration / 60)}:
                {(currentTrack.duration % 60).toString().padStart(2, "0")}
              </span>
            )}
          </div>

          {/* CLEARER Action buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => handleSwipe("left")}
              className="flex-1 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                <X className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-sm font-bold text-red-400">
                Not my vibe
              </span>
              {/* <span className="text-xs text-gray-400">REMOVE to Bento</span>*/}
            </button>

            <button
              onClick={() => handleSwipe("right")}
              className="flex-1 py-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <Heart className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm font-bold text-green-400">
                Add to Bento
              </span>
              {/* <span className="text-xs text-gray-400">Add to Bento</span>*/}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Navigation controls */}
      <div className="flex items-center justify-center gap-6 px-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`p-3 rounded-full ${
            currentIndex === 0
              ? "text-white/20 cursor-not-allowed"
              : "text-white hover:bg-white/10"
          }`}
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">Swipe or tap buttons</p>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mb-1">
                <X className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-xs text-red-400">Swipe left</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mb-1">
                <Heart className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-xs text-green-400">Swipe right</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === deck.length - 1}
          className={`p-3 rounded-full ${
            currentIndex === deck.length - 1
              ? "text-white/20 cursor-not-allowed"
              : "text-white hover:bg-white/10"
          }`}
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
      {!hasAudio && (
        <span className="absolute bottom-4 text-xs text-red-400">
          No preview available
        </span>
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
      {likedTracks.length > 0 && (
        <div className="px-4">
          <h4 className="text-sm text-gray-400 mb-2">
            Your Bento ({likedTracks.length})
          </h4>

          <div className="grid grid-cols-5 gap-2">
            {likedTracks.slice(0, 10).map((track, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg overflow-hidden border border-white/10"
              >
                <img
                  src={track.album?.cover_big}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeInterface;
