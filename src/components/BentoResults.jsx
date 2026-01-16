import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  ExternalLink,
  Download,
  Heart,
  X,
  AlertCircle,
  Music,
  Grid,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import html2canvas from "html2canvas";
import { springExpressive, buttonSpring, fadeInUp } from "../utils/motion";

const BentoResults = ({ likedTracks, onStartNew }) => {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const bentoGridRef = useRef(null);

  const getGridPages = () => {
    if (likedTracks.length === 0) return [];
    const pages = [];
    const tracksPerPage = 12;

    for (let i = 0; i < likedTracks.length; i += tracksPerPage) {
      const pageTracks = likedTracks.slice(i, i + tracksPerPage);
      pages.push(pageTracks);
    }

    return pages;
  };

  const handlePlayPreview = (track) => {
    setAudioError(null);

    if (track.preview && track.preview.includes("youtube.com")) {
      window.open(track.preview, "_blank");
      return;
    }

    if (!track.preview) {
      setAudioError(
        `No audio preview available for "${track.title || track.name}"`,
      );
      setTimeout(() => setAudioError(null), 3000);
      return;
    }

    if (playingAudio) {
      playingAudio.pause();
      setPlayingAudio(null);
      setSelectedTrack(null);
    } else {
      const audio = new Audio(track.preview);

      audio.onerror = () => {
        setAudioError(
          `Failed to load audio for "${track.title || track.name}"`,
        );
        setPlayingAudio(null);
        setSelectedTrack(null);
      };

      audio
        .play()
        .then(() => {
          setPlayingAudio(audio);
          setSelectedTrack(track.id);
        })
        .catch(() => {
          setAudioError(
            `Cannot play audio preview for "${track.title || track.name}"`,
          );
        });

      audio.onended = () => {
        setPlayingAudio(null);
        setSelectedTrack(null);
      };
    }
  };

  useEffect(() => {
    return () => {
      if (playingAudio) {
        playingAudio.pause();
      }
    };
  }, [playingAudio]);

  const handleExportPNG = async () => {
    if (!bentoGridRef.current || likedTracks.length === 0) {
      alert("No tracks to export!");
      return;
    }

    setExporting(true);

    try {
      const canvas = await html2canvas(bentoGridRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.download = `musicme-bento-${dateStr}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setExporting(false);
      }, 1000);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Could not export PNG");
      setExporting(false);
    }
  };

  const gridPages = getGridPages();

  return (
    <motion.div {...fadeInUp} className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Error Toast */}
      <AnimatePresence>
        {audioError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 p-4 bg-red-100 border border-red-200 rounded-xl shadow-lg max-w-sm"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{audioError}</p>
              <button
                onClick={() => setAudioError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="space-y-6 mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springExpressive}
              className="w-14 h-14 rounded-[20px] bg-pink-100 flex items-center justify-center"
            >
              <Grid className="w-7 h-7 text-pink-600" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Your Music Bento
              </h1>
              <p className="text-gray-600 mt-1">
                {likedTracks.length > 0
                  ? `${likedTracks.length} curated tracks`
                  : "Start building your music collection"}
              </p>
            </div>
          </div>

          {likedTracks.length > 0 && (
            <div className="flex gap-2">
              <motion.button
                onClick={handleExportPNG}
                disabled={exporting}
                className="bg-pink-500 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-pink-600 font-medium flex items-center gap-2 disabled:opacity-50"
                {...buttonSpring}
              >
                <Download className="w-4 h-4" />
                {exporting ? "Exporting..." : "Save Image"}
              </motion.button>
            </div>
          )}
        </div>

        {/* Stats */}
        {likedTracks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Total Tracks",
                value: likedTracks.length,
                icon: Heart,
                color: "text-pink-600",
                bg: "bg-pink-50",
              },
              {
                label: "Bento Pages",
                value: Math.ceil(likedTracks.length / 12),
                icon: Grid,
                color: "text-pink-600",
                bg: "bg-pink-50",
              },
              {
                label: "Unique Artists",
                value: new Set(likedTracks.map((t) => t.artist?.name)).size,
                icon: Music,
                color: "text-pink-600",
                bg: "bg-pink-50",
              },
              {
                label: "Taste Score",
                value: "100%",
                icon: Sparkles,
                color: "text-pink-600",
                bg: "bg-pink-50",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`${stat.bg} p-4 rounded-2xl`}
              >
                <div className={`text-xl font-semibold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <stat.icon className="w-3.5 h-3.5" />
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Bento Grid */}
      <div ref={bentoGridRef}>
        {likedTracks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border-2 border-gray-200"
          >
            <div className="text-5xl mb-4">🎵</div>
            <h3 className="text-xl font-medium text-gray-800 mb-3">
              Your Bento Awaits
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Discover and save amazing tracks to create your personalized music
              bento box
            </p>
            <motion.button
              onClick={onStartNew}
              className="bg-pink-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-pink-600 font-medium flex items-center gap-2"
              {...buttonSpring}
            >
              Start Discovering Music
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        ) : (
          gridPages.map((pageTracks, pageIndex) => (
            <div key={pageIndex} className="space-y-6 mb-12">
              {/* Page Header */}
              {gridPages.length > 1 && (
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                    Page {pageIndex + 1} of {gridPages.length}
                  </h3>
                  <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                    {pageTracks.length} tracks
                  </div>
                </div>
              )}

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {pageTracks.map((track, trackIndex) => {
                  const isPlaying = selectedTrack === track.id && playingAudio;

                  return (
                    <motion.div
                      key={`${pageIndex}-${trackIndex}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: (pageIndex * 12 + trackIndex) * 0.02,
                      }}
                      className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-all"
                    >
                      <div className="p-2">
                        {/* Track Info */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={track.album?.cover_big || track.thumbnail}
                              className="w-14 h-14 rounded-lg object-cover"
                              alt={track.title}
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(track.title || track.name)}&background=4f46e5&color=fff&size=128`;
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-800 truncate">
                              {track.title || track.name}
                            </h4>
                            <p className="text-xs text-gray-600 truncate">
                              {track.artist?.name}
                            </p>
                            {track.reason && (
                              <p className="text-xs text-gray-600 italic mt-1 line-clamp-2">
                                "{track.reason}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayPreview(track);
                            }}
                            disabled={!track.preview}
                            className={`p-2.5 rounded-full ${track.preview ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {isPlaying ? (
                              <X className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                          </motion.button>

                          <motion.a
                            href={
                              track.url ||
                              `https://open.spotify.com/search/${encodeURIComponent(`${track.title} ${track.artist?.name}`)}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-gray-200 text-gray-600 rounded-full"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </motion.a>

                          <div className="ml-auto">
                            <Heart className="w-4 h-4 text-pink-500" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center mt-10 pt-8 border-t border-gray-300"
      >
        <motion.button
          onClick={onStartNew}
          className="bg-pink-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-pink-600 font-medium flex items-center gap-2"
          {...buttonSpring}
        >
          <Music className="w-5 h-5" />
          Discover More Music
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default BentoResults;
