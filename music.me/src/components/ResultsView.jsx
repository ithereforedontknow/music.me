import { motion } from "framer-motion";
import {
  Music,
  X,
  Play,
  ExternalLink,
  Download,
  Share2,
  Heart,
} from "lucide-react";
import { useState } from "react";

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
    // Create a playlist text
    const playlist = likedTracks
      .map(
        (track, i) =>
          `${i + 1}. ${track.title || track.name} - ${track.artist?.name || track.artists?.[0]?.name}`,
      )
      .join("\n");

    // Create a blob and download
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
      // Fallback: copy to clipboard
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Your Bento Box</h1>
        <p className="text-gray-400">
          You saved {likedTracks.length} track
          {likedTracks.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {likedTracks.length}
          </div>
          <div className="text-sm text-gray-400">Tracks Saved</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {Math.floor(
              likedTracks.reduce(
                (acc, track) => acc + (track.duration || 0),
                0,
              ) / 60,
            )}
          </div>
          <div className="text-sm text-gray-400">Total Minutes</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={handleExport}
          className="flex-1 py-3 bg-white border border-white/20 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Export</span>
        </button>
        <button
          onClick={handleShare}
          className="flex-1 py-3 bg-white border border-white/20 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>

      {/* Track List */}
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
        {likedTracks.map((track, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
          >
            <div className="relative">
              <img
                src={track.album?.cover_big || track.album?.images?.[0]?.url}
                className="w-12 h-12 rounded-lg object-cover"
                alt={track.title}
              />
              <button
                onClick={() => handlePlayPreview(track, index)}
                className={`absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg transition-opacity ${
                  track.preview || track.preview_url
                    ? "opacity-0 hover:opacity-100"
                    : "opacity-50"
                }`}
                disabled={!track.preview && !track.preview_url}
              >
                {selectedTrack === index && playingAudio ? (
                  <div className="w-4 h-4 bg-white rounded-sm" />
                ) : (
                  <Play className="w-4 h-4 text-white" />
                )}
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white truncate">
                {track.title || track.name}
              </h4>
              <p className="text-sm text-gray-400 truncate">
                {track.artist?.name ||
                  track.artists?.map((a) => a.name).join(", ")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {track.preview || track.preview_url ? (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              ) : (
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              )}
              <a
                href={`https://open.spotify.com/search/${encodeURIComponent(
                  `${track.title || track.name} ${track.artist?.name || track.artists?.[0]?.name}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="flex gap-3 pt-6">
        <button
          onClick={onBack}
          className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors text-white"
        >
          Continue Swiping
        </button>
        <button
          onClick={onStartNew}
          className="flex-1 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors"
        >
          Start New Discovery
        </button>
      </div>
    </motion.div>
  );
};

export default BentoResults;
