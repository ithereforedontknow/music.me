import { useState, useRef, useEffect } from "react";
import {
  Play,
  ExternalLink,
  Download,
  Heart,
  X,
  AlertCircle,
  Music2,
  Music,
} from "lucide-react";
import html2canvas from "html2canvas";

const BentoResults = ({ likedTracks, onBack, onStartNew }) => {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const bentoGridRef = useRef(null);

  const handlePlayPreview = (track, index) => {
    setAudioError(null);

    const audioUrl = track.preview || track.preview_url;
    if (!audioUrl) {
      setAudioError(
        `No audio preview available for "${track.title || track.name}"`,
      );
      return;
    }

    if (playingAudio) {
      playingAudio.pause();
      playingAudio.onerror = null;
    }

    if (selectedTrack === index && playingAudio) {
      setPlayingAudio(null);
      setSelectedTrack(null);
    } else {
      const audio = new Audio(audioUrl);

      audio.onerror = (e) => {
        setPlayingAudio(null);
        setSelectedTrack(null);
        setAudioError(
          `Failed to load audio preview for "${track.title || track.name}"`,
        );
      };

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          setPlayingAudio(null);
          setSelectedTrack(null);
          if (!error.message.includes("interrupted")) {
            setAudioError(
              `Cannot play audio preview for "${track.title || track.name}"`,
            );
          }
        });
      }

      audio.onended = () => {
        setPlayingAudio(null);
        setSelectedTrack(null);
      };

      setPlayingAudio(audio);
      setSelectedTrack(index);
    }
  };

  useEffect(() => {
    return () => {
      if (playingAudio) {
        playingAudio.pause();
        playingAudio.onerror = null;
      }
    };
  }, [playingAudio]);

  useEffect(() => {
    if (audioError) {
      const timer = setTimeout(() => {
        setAudioError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [audioError]);

  // Calculate grid pages with 4 rows x 3 columns = 12 tracks per page
  const getGridPages = () => {
    if (likedTracks.length === 0) return [];

    const pages = [];
    const tracksPerPage = 12; // 4 rows x 3 columns

    for (let i = 0; i < likedTracks.length; i += tracksPerPage) {
      const pageTracks = likedTracks.slice(i, i + tracksPerPage);
      pages.push(pageTracks);
    }

    return pages;
  };

  // Simple PNG Export
  const handleExportPNG = async () => {
    if (!bentoGridRef.current || likedTracks.length === 0) {
      alert("No tracks to export!");
      return;
    }

    setExporting(true);

    try {
      const canvas = await html2canvas(bentoGridRef.current, {
        backgroundColor: "#060010",
        scale: 1,
        useCORS: true,
        logging: false,
        allowTaint: true,
        width: bentoGridRef.current.scrollWidth,
        height: bentoGridRef.current.scrollHeight + 20,
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
      alert(
        "Could not export PNG. Try taking a screenshot instead (Ctrl+Shift+S).",
      );
    } finally {
      setExporting(false);
    }
  };

  const gridPages = getGridPages();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-fade-in-up {
            animation: fadeInUp 0.5s ease-out forwards;
          }

          .audio-error-toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(220, 38, 38, 0.95);
            color: white;
            padding: 12px 24px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideUp 0.3s ease-out;
            max-width: 90%;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }

          /* 4x3 Grid Layout */
          .bento-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(4, 1fr);
            gap: 1rem;
            margin: 0 auto;
            margin-bottom: 2rem;
          }

          @media (max-width: 768px) {
            .bento-grid {
              grid-template-columns: repeat(2, 1fr);
              grid-template-rows: repeat(6, 1fr);
            }
          }

          @media (max-width: 480px) {
            .bento-grid {
              grid-template-columns: 1fr;
              grid-template-rows: repeat(12, auto);
            }
          }

          .bento-grid-item {
            position: relative;
            background: rgba(6, 0, 16, 0.8);
            border: 1px solid rgba(57, 46, 78, 0.5);
            border-radius: 1rem;
            overflow: hidden;
            transition: all 0.3s ease;
            min-height: 180px;
          }

          .bento-grid-item:hover {
            border-color: rgba(132, 0, 255, 0.5);
            box-shadow: 0 0 30px rgba(132, 0, 255, 0.1);
            transform: translateY(-2px);
          }

          .col-span-1 {
            grid-column: span 1;
          }

          .row-span-1 {
            grid-row: span 1;
          }

          .track-card {
            padding: 1rem;
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .line-clamp-1 {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
          }

          .line-clamp-2 {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
          }
        `}
      </style>

      {audioError && (
        <div className="audio-error-toast">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4" />
            <span className="text-sm">{audioError}</span>
          </div>
        </div>
      )}

      <div className="animate-fade-in-up">
        {/* Header with Export Button at Top */}
        <div className="text-center mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">
                Your music.me Bento
              </h1>
            </div>

            {likedTracks.length > 0 && (
              <button
                onClick={handleExportPNG}
                disabled={exporting}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span>{exporting ? "Exporting..." : "Save Bento"}</span>
              </button>
            )}
          </div>

          <p className="text-gray-400">
            {likedTracks.length > 0
              ? `${likedTracks.length} tracks • Your personalized music collection`
              : "Start building your music collection"}
          </p>
        </div>

        {/* Multiple Bento Grids for all tracks */}
        <div ref={bentoGridRef}>
          {likedTracks.length === 0 ? (
            <div className="col-span-3 row-span-4 bento-grid-item flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="w-16 h-16 text-gray-500 mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                Your Bento Box Awaits
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Discover and save amazing tracks to create your personalized
                music bento box!
              </p>
              <button
                onClick={onStartNew}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium transition-all hover:scale-105"
              >
                Start Discovering Music
              </button>
            </div>
          ) : (
            gridPages.map((pageTracks, pageIndex) => (
              <div key={pageIndex} className="bento-grid mb-12">
                {/* All tracks on the page in 4x3 grid */}
                {pageTracks.map((track, trackIndex) => (
                  <div
                    key={`${pageIndex}-${trackIndex}`}
                    className="bento-grid-item col-span-1 row-span-1"
                    style={{
                      animationDelay: `${(pageIndex * 12 + trackIndex) * 0.05}s`,
                    }}
                  >
                    <div className="track-card">
                      {/* Background */}
                      <div className="absolute inset-0 opacity-20">
                        <img
                          src={
                            track.album?.cover_big ||
                            track.album?.images?.[0]?.url
                          }
                          className="w-full h-full object-cover"
                          alt=""
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="relative z-10 flex flex-col h-full">
                        {/* Top Section */}
                        <div className="flex items-start justify-between mb-3">
                          <img
                            src={
                              track.album?.cover_big ||
                              track.album?.images?.[0]?.url
                            }
                            className="w-12 h-12 rounded-lg object-cover shadow-lg"
                            alt={track.title}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                track.title || track.name,
                              )}&background=8400ff&color=fff&size=128`;
                            }}
                          />
                          <div className="flex items-center">
                            {track.preview || track.preview_url ? (
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            ) : (
                              <div className="w-2 h-2 bg-gray-500 rounded-full" />
                            )}
                          </div>
                        </div>

                        {/* Track Info */}
                        <div className="flex-1 mb-3">
                          <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                            {track.title || track.name}
                          </h3>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            {track.artist?.name ||
                              track.artists?.map((a) => a.name).join(", ")}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const globalIndex = pageIndex * 12 + trackIndex;
                              handlePlayPreview(track, globalIndex);
                            }}
                            disabled={!track.preview && !track.preview_url}
                            className={`p-2 rounded-full transition-all ${
                              track.preview || track.preview_url
                                ? "bg-purple-600 hover:bg-purple-700 hover:scale-110"
                                : "bg-gray-700 opacity-50 cursor-not-allowed"
                            }`}
                            title={
                              !track.preview && !track.preview_url
                                ? "No audio preview"
                                : selectedTrack ===
                                      pageIndex * 12 + trackIndex &&
                                    playingAudio
                                  ? "Stop preview"
                                  : "Play preview"
                            }
                          >
                            {selectedTrack === pageIndex * 12 + trackIndex &&
                            playingAudio ? (
                              <X className="w-3 h-3 text-white" />
                            ) : (
                              <Play className="w-3 h-3 text-white" />
                            )}
                          </button>
                          <a
                            href={`https://open.spotify.com/search/${encodeURIComponent(
                              `${track.title || track.name} ${track.artist?.name || track.artists?.[0]?.name}`,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110"
                            title="Open in Spotify"
                          >
                            <ExternalLink className="w-3 h-3 text-white" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Fill empty slots if less than 12 tracks on last page */}
                {pageTracks.length < 12 &&
                  Array.from({ length: 12 - pageTracks.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="bento-grid-item col-span-1 row-span-1 opacity-30"
                    >
                      <div className="track-card flex flex-col items-center justify-center h-full">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mb-3">
                          <Music className="w-6 h-6 text-gray-500" />
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Add more tracks
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ))
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <button
            onClick={onStartNew}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all hover:scale-105 border border-white/20 flex items-center gap-2"
          >
            <Music className="w-5 h-5" />
            <span>Discover More Music</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BentoResults;
