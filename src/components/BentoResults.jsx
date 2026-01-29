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
  Trash2,
  Share2,
  Copy,
  Check,
  Pause,
} from "lucide-react";
import html2canvas from "html2canvas";
import { springExpressive, buttonSpring, fadeInUp } from "../utils/motion";
import { fetchHighResArtwork } from "../services/seedRecommendationService";
const BentoResults = ({ likedTracks, onStartNew, onClearTracks }) => {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const bentoGridRef = useRef(null);
  const [displayTracks, setDisplayTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const finalizeBento = async () => {
      setIsLoading(true);

      // Hydrate all liked tracks for the final display
      const hydrated = await Promise.all(
        likedTracks.map(async (track) => ({
          ...track,
          image: await fetchHighResArtwork(track),
        })),
      );

      setDisplayTracks(hydrated);
      setIsLoading(false);
    };

    finalizeBento();
  }, [likedTracks]);
  const getTrackImage = (track) => {
    if (!track) return null;

    // 1. Try to find the largest Last.fm image (usually at the end of the array)
    const images = track.images || track.album?.image || track.image;

    if (Array.isArray(images) && images.length > 0) {
      // If it's Last.fm, the last index is usually 'extralarge' or 'mega'
      const lastImage = images[images.length - 1];

      // Check for Spotify (.url) or Last.fm (["#text"])
      const imgUrl =
        lastImage.url ||
        lastImage["#text"] ||
        (typeof lastImage === "string" ? lastImage : null);

      if (imgUrl && imgUrl !== "") return imgUrl;
    }

    // 2. Direct property checks (Spotify style)
    if (track.album?.images?.[0]?.url) return track.album.images[0].url;
    if (typeof track.image === "string" && track.image !== "")
      return track.image;

    // 3. Fallback to Avatar
    const initials =
      (track.name?.charAt(0) || "M") + (track.artist?.name?.charAt(0) || "A");
    const colors = ["6366f1", "ec4899", "8b5cf6", "14b8a6", "f59e0b"];
    const color = colors[initials.charCodeAt(0) % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&size=500&bold=true`;
  };

  const getGridPages = () => {
    if (likedTracks.length === 0) return [];
    const pages = [];
    const tracksPerPage = 12;
    for (let i = 0; i < likedTracks.length; i += tracksPerPage) {
      pages.push(likedTracks.slice(i, i + tracksPerPage));
    }
    return pages;
  };

  const handlePlayPreview = (track) => {
    setAudioError(null);

    // Check both common preview property names
    const previewUrl = track.preview || track.preview_url;

    if (previewUrl && previewUrl.includes("youtube.com")) {
      window.open(previewUrl, "_blank");
      return;
    }

    if (!previewUrl) {
      setAudioError(
        `No audio preview available for "${track.title || track.name}"`,
      );
      setTimeout(() => setAudioError(null), 3000);
      return;
    }

    // Logic for switching/stopping tracks
    if (playingAudio) {
      playingAudio.pause();

      // If clicking the SAME track, just stop and exit
      if (selectedTrack === track.id) {
        setPlayingAudio(null);
        setSelectedTrack(null);
        return;
      }
    }

    // Play the new track
    const audio = new Audio(previewUrl);
    audio.onerror = () => {
      setAudioError(`Failed to load audio for "${track.title || track.name}"`);
      setPlayingAudio(null);
      setSelectedTrack(null);
    };

    audio
      .play()
      .then(() => {
        setPlayingAudio(audio);
        setSelectedTrack(track.id);
      })
      .catch((err) => {
        console.error("Playback error:", err);
        setAudioError("Browser blocked autoplay. Try clicking again.");
      });

    audio.onended = () => {
      setPlayingAudio(null);
      setSelectedTrack(null);
    };
  };

  const handleExportPNG = async () => {
    if (!bentoGridRef.current || likedTracks.length === 0) {
      alert("No tracks to export!");
      return;
    }

    setExporting(true);

    try {
      const canvas = await html2canvas(bentoGridRef.current, {
        useCORS: true, // CHANGE: Ensure this is true
        scale: 2, // CHANGE: Makes the PNG 2x sharper
        logging: false,
      });

      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.download = `musicme-bento-${dateStr}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Could not export PNG. Please try again or take a screenshot.");
    } finally {
      setExporting(false);
    }
  };

  const handleCopyAsText = async () => {
    const text = likedTracks
      .map(
        (track, index) => `${index + 1}. ${track.name} - ${track.artist?.name}`,
      )
      .join("\n");

    try {
      await navigator.clipboard.writeText(`My Music Bento:\n\n${text}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Music Bento",
          text: `Check out my music bento with ${likedTracks.length} tracks!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      setShowShareOptions(true);
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        `Are you sure you want to clear all ${likedTracks.length} tracks from your bento?`,
      )
    ) {
      if (onClearTracks) onClearTracks();
    }
  };

  useEffect(() => {
    return () => {
      if (playingAudio) playingAudio.pause();
    };
  }, [playingAudio]);

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
            className="fixed top-20 right-4 z-50 p-4 bg-red-100 border border-red-200 rounded-xl shadow-m3-3 max-w-sm"
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
              className="w-14 h-14 rounded-[20px] bg-accent/10 flex items-center justify-center border border-accent/20"
            >
              <Grid className="w-7 h-7 text-accent" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-semibold text-primary">
                Your Music Bento
              </h1>
              <p className="text-secondary mt-1">
                {likedTracks.length > 0
                  ? `${likedTracks.length} curated tracks saved`
                  : "Start building your music collection"}
              </p>
            </div>
          </div>

          {likedTracks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <motion.button
                onClick={handleExportPNG}
                disabled={exporting}
                className="bg-card border border-theme text-primary px-4 py-2 rounded-full shadow-m3-2 hover:shadow-m3-3 transition-all hover:bg-secondary font-medium flex items-center gap-2 disabled:opacity-50"
                {...buttonSpring}
              >
                <Download className="w-4 h-4" />
                {exporting ? "Exporting..." : "Save Image"}
              </motion.button>

              <motion.button
                onClick={handleCopyAsText}
                className="bg-card border border-theme text-primary px-4 py-2 rounded-full shadow-m3-2 hover:shadow-m3-3 transition-all hover:bg-secondary font-medium flex items-center gap-2"
                {...buttonSpring}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy Text"}
              </motion.button>

              <motion.button
                onClick={handleShare}
                className="bg-card border border-theme text-primary px-4 py-2 rounded-full shadow-m3-2 hover:shadow-m3-3 transition-all hover:bg-secondary font-medium flex items-center gap-2"
                {...buttonSpring}
              >
                <Share2 className="w-4 h-4" />
                Share
              </motion.button>

              <motion.button
                onClick={handleClearAll}
                className="bg-card border border-red-300 text-red-600 px-4 py-2 rounded-full shadow-m3-2 hover:shadow-m3-3 transition-all hover:bg-red-50 font-medium flex items-center gap-2"
                {...buttonSpring}
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </motion.button>
            </div>
          )}
        </div>

        {/* Stats */}
        {likedTracks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Tracks", value: likedTracks.length, icon: Heart },
              {
                label: "Bento Pages",
                value: Math.ceil(likedTracks.length / 12),
                icon: Grid,
              },
              {
                label: "Unique Artists",
                value: new Set(likedTracks.map((t) => t.artist?.name)).size,
                icon: Music,
              },
              { label: "Taste Score", value: "100%", icon: Sparkles },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-accent/10 p-4 rounded-2xl border border-accent/20"
              >
                <div className="text-xl font-semibold text-accent">
                  {stat.value}
                </div>
                <div className="text-sm text-secondary flex items-center gap-2 mt-1">
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
            className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-card rounded-3xl border-2 border-theme"
          >
            <Music className="w-16 h-16 text-accent mb-4" />
            <h3 className="text-xl font-medium text-primary mb-3">
              Your Bento Awaits
            </h3>
            <p className="text-secondary mb-6 max-w-md">
              Discover and save amazing tracks to create your personalized music
              bento box
            </p>
            <motion.button
              onClick={onStartNew}
              className="bg-accent text-on-accent px-6 py-3 rounded-full shadow-m3-2 hover:shadow-m3-3 transition-all font-medium flex items-center gap-2"
              {...buttonSpring}
            >
              Start Discovering Music
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        ) : (
          gridPages.map((pageTracks, pageIndex) => (
            <div key={pageIndex} className="space-y-6 mb-12">
              {gridPages.length > 1 && (
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                    Page {pageIndex + 1} of {gridPages.length}
                  </h3>
                  <div className="text-sm text-secondary bg-secondary px-3 py-1.5 rounded-full">
                    {pageTracks.length} tracks
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {pageTracks.map((track, trackIndex) => {
                  const isPlaying = selectedTrack === track.id && playingAudio;
                  const trackImage = getTrackImage(track);

                  return (
                    <motion.div
                      key={`${pageIndex}-${trackIndex}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: (pageIndex * 12 + trackIndex) * 0.02,
                      }}
                      className="bg-card rounded-xl shadow-m3-2 p-4 border border-theme hover:shadow-m3-3 transition-all"
                    >
                      <div className="p-2">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={track.image}
                              // ONLY apply crossOrigin if it's NOT a UI-Avatar link
                              crossOrigin={
                                trackImage.includes("ui-avatars.com")
                                  ? undefined
                                  : "anonymous"
                              }
                              className="w-14 h-14 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/500?text=No+Art";
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-primary truncate">
                              {track.title || track.name}
                            </h4>
                            <p className="text-xs text-secondary truncate">
                              {track.artist?.name}
                            </p>
                            {track.reason && (
                              <p className="text-xs text-secondary italic mt-1 line-clamp-2">
                                "{track.reason}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayPreview(track);
                            }}
                            disabled={!track.preview}
                            className={`p-2.5 rounded-full ${track.preview ? "bg-accent text-on-accent" : "bg-secondary text-secondary cursor-not-allowed"}`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {isPlaying ? (
                              <Pause className="w-3.5 h-3.5" />
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
                            className="p-2.5 bg-secondary text-primary rounded-full"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </motion.a>

                          <div className="ml-auto">
                            <Heart className="w-4 h-4 text-accent fill-accent" />
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
        className="flex flex-col sm:flex-row justify-center gap-3 mt-10 pt-8 border-t border-theme"
      >
        <motion.button
          onClick={onStartNew}
          className="bg-accent text-on-accent px-6 py-3 rounded-full shadow-m3-2 hover:shadow-m3-3 transition-all font-medium flex items-center justify-center gap-2"
          {...buttonSpring}
        >
          <Music className="w-5 h-5" />
          Discover More Music
          <ChevronRight className="w-5 h-5" />
        </motion.button>

        {likedTracks.length > 0 && (
          <motion.button
            onClick={handleClearAll}
            className="border-2 border-red-300 text-red-600 px-6 py-3 rounded-full hover:bg-red-50 transition-all font-medium flex items-center justify-center gap-2"
            {...buttonSpring}
          >
            <Trash2 className="w-5 h-5" />
            Clear All Tracks
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BentoResults;
