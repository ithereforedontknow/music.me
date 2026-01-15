import { useState } from "react";
import { Play, ExternalLink, Download, Share2, Heart, X } from "lucide-react";

const BentoResults = ({ likedTracks, onBack, onStartNew }) => {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);

  const handlePlayPreview = (track, index) => {
    if (playingAudio) {
      playingAudio.pause();
    }

    if (selectedTrack === index && playingAudio) {
      setPlayingAudio(null);
      setSelectedTrack(null);
    } else {
      const audio = new Audio(track.preview || track.preview_url);
      audio.play();
      audio.onended = () => {
        setPlayingAudio(null);
        setSelectedTrack(null);
      };
      setPlayingAudio(audio);
      setSelectedTrack(index);
    }
  };

  const handleExport = () => {
    const playlist = likedTracks
      .map(
        (track, i) =>
          `${i + 1}. ${track.title || track.name} - ${track.artist?.name || track.artists?.[0]?.name}`,
      )
      .join("\n");

    const blob = new Blob([playlist], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "soundswipe-playlist.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareData = {
      title: "My SoundSwipe Bento",
      text: `I discovered ${likedTracks.length} amazing tracks on SoundSwipe!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      const playlistText = likedTracks
        .map(
          (track) =>
            `${track.title || track.name} by ${track.artist?.name || track.artists?.[0]?.name}`,
        )
        .join("\n");

      navigator.clipboard.writeText(`My SoundSwipe Bento:\n${playlistText}`);
      alert("Playlist copied to clipboard!");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-fade-in-up {
            animation: fadeInUp 0.5s ease-out forwards;
          }

          .animate-fade-in-scale {
            animation: fadeInScale 0.3s ease-out forwards;
          }

          .bento-grid {
            display: grid;
            gap: 0.5rem;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            grid-auto-rows: 180px;
          }

          @media (min-width: 640px) {
            .bento-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (min-width: 768px) {
            .bento-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (min-width: 1024px) {
            .bento-grid {
              grid-template-columns: repeat(4, 1fr);
            }
          }

          .bento-card {
            position: relative;
            background: #060010;
            border: 1px solid #392e4e;
            border-radius: 20px;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .bento-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 0 0 30px rgba(132, 0, 255, 0.2);
            border-color: rgba(132, 0, 255, 0.5);
          }

          .bento-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              rgba(132, 0, 255, 0.1) 0%,
              transparent 50%);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
          }

          .bento-card:hover::before {
            opacity: 1;
          }

          .bento-card-large {
            grid-column: span 2;
            grid-row: span 2;
          }

          .bento-card-wide {
            grid-column: span 2;
          }

          .bento-card-tall {
            grid-row: span 2;
          }

          @media (max-width: 639px) {
            .bento-card-large,
            .bento-card-wide,
            .bento-card-tall {
              grid-column: span 1;
              grid-row: span 1;
            }
          }

          .header-card {
            background: linear-gradient(135deg, rgba(132, 0, 255, 0.2) 0%, rgba(46, 24, 78, 0.2) 100%);
            border: 1px solid rgba(132, 0, 255, 0.3);
          }

          .stats-card {
            background: rgba(132, 0, 255, 0.05);
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

      <div className="animate-fade-in-up">
        {/* Header Card */}
        <div className="bento-grid mb-6">
          <div className="bento-card header-card bento-card-wide flex flex-col items-center justify-center p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 mb-3">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Your Bento Box
            </h1>
            <p className="text-gray-400 text-sm">
              {likedTracks.length} track{likedTracks.length !== 1 ? "s" : ""}{" "}
              saved
            </p>
          </div>

          {/* Stats Cards */}
          <div className="bento-card stats-card flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-white mb-1">
              {likedTracks.length}
            </div>
            <div className="text-sm text-gray-400">Tracks</div>
          </div>

          <div className="bento-card stats-card flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-white mb-1">
              {Math.floor(
                likedTracks.reduce(
                  (acc, track) => acc + (track.duration || 180),
                  0,
                ) / 60,
              )}
            </div>
            <div className="text-sm text-gray-400">Minutes</div>
          </div>

          {/* Action Cards */}
          <div
            className="bento-card flex flex-col items-center justify-center p-4 gap-2"
            onClick={handleExport}
          >
            <Download className="w-6 h-6 text-purple-400" />
            <span className="text-sm font-medium text-white">Export</span>
          </div>

          <div
            className="bento-card flex flex-col items-center justify-center p-4 gap-2"
            onClick={handleShare}
          >
            <Share2 className="w-6 h-6 text-purple-400" />
            <span className="text-sm font-medium text-white">Share</span>
          </div>
        </div>

        {/* Track Cards Grid */}
        <div className="bento-grid mb-6">
          {likedTracks.map((track, index) => {
            const isLarge = index % 7 === 0;
            const isWide = index % 5 === 0 && !isLarge;
            const isTall = index % 6 === 0 && !isLarge && !isWide;

            return (
              <div
                key={index}
                className={`bento-card animate-fade-in-scale ${isLarge ? "bento-card-large" : ""} ${isWide ? "bento-card-wide" : ""} ${isTall ? "bento-card-tall" : ""}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  e.currentTarget.style.setProperty("--mouse-x", `${x}%`);
                  e.currentTarget.style.setProperty("--mouse-y", `${y}%`);
                }}
              >
                {/* Album Art Background */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-20"
                  style={{
                    backgroundImage: `url(${track.album?.cover_big || track.album?.images?.[0]?.url})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-4">
                  {/* Top Section */}
                  <div className="flex items-start justify-between gap-2">
                    <img
                      src={
                        track.album?.cover_big || track.album?.images?.[0]?.url
                      }
                      className="w-12 h-12 rounded-lg object-cover shadow-lg"
                      alt={track.title}
                    />
                    <div className="flex items-center gap-1">
                      {track.preview || track.preview_url ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-500 rounded-full" />
                      )}
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                      {track.title || track.name}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-1 mb-3">
                      {track.artist?.name ||
                        track.artists?.map((a) => a.name).join(", ")}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPreview(track, index);
                        }}
                        disabled={!track.preview && !track.preview_url}
                        className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:opacity-50 rounded-full transition-colors"
                      >
                        {selectedTrack === index && playingAudio ? (
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
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-white" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Action */}
        <div className="text-center">
          <button
            onClick={onStartNew}
            className="px-8 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors"
          >
            Start New Discovery
          </button>
        </div>
      </div>
    </div>
  );
};

export default BentoResults;
