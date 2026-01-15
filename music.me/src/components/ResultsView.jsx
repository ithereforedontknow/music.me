// components/ResultsView.jsx
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  X,
  Music,
  Trash2,
  ExternalLink,
  Play,
  Grid3x3,
} from "lucide-react";

const ResultsView = ({
  savedTracks,
  onClearResults,
  onRemoveSaved,
  onBackToSwipe,
  onNewDiscovery,
}) => {
  const maxTracks = 10;
  const remainingSlots = maxTracks - savedTracks.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Grid3x3 className="w-6 h-6 text-white" />
          <h2 className="text-2xl font-bold text-white">My Music Grid</h2>
        </div>
        <div className="inline-flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-green-400" />
            <span className="text-white font-medium">
              {savedTracks.length} saved
            </span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="text-gray-400">
            {remainingSlots > 0
              ? `${remainingSlots} slots remaining`
              : "Grid is full!"}
          </div>
        </div>
      </div>

      {/* Warning if grid is full */}
      {savedTracks.length >= maxTracks && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <p className="text-sm text-amber-300 text-center">
            ⚠️ Your grid is full (10/10). Remove tracks to add more.
          </p>
        </div>
      )}

      {/* Bento Grid */}
      {savedTracks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
          <Grid3x3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Empty Grid</h3>
          <p className="text-gray-400 mb-6">
            Start swiping to add tracks to your grid!
          </p>
          <button
            onClick={onBackToSwipe}
            className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
          >
            Start Swiping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {savedTracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group hover:bg-white/10 transition-all"
              >
                {/* Album art */}
                <div className="relative aspect-square">
                  <img
                    src={
                      track.album?.cover_big || track.album?.images?.[0]?.url
                    }
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100">
                      <Play className="w-5 h-5 text-black ml-0.5" />
                    </button>
                    <a
                      href={`https://open.spotify.com/search/${encodeURIComponent(track.title + " " + track.artist?.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100"
                    >
                      <ExternalLink className="w-4 h-4 text-black" />
                    </a>
                  </div>
                </div>

                {/* Track info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate text-sm">
                        {track.title || track.name}
                      </h4>
                      <p className="text-xs text-gray-400 truncate">
                        {track.artist?.name || track.artists?.[0]?.name}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveSaved(track.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors ml-2 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Album info */}
                  {track.album?.title && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                      <Music className="w-3 h-3" />
                      <span className="truncate">{track.album.title}</span>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      Saved
                    </span>
                    {track.lastfm_reason && (
                      <span className="text-xs text-gray-500 text-right">
                        {track.lastfm_reason}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty slots */}
          {Array.from({ length: remainingSlots }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-white/30" />
              </div>
              <p className="text-sm text-white/30">Empty Slot</p>
              <p className="text-xs text-white/20 mt-1">Save tracks to fill</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-8">
        <button
          onClick={onBackToSwipe}
          className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
        >
          ← Back to Swiping
        </button>

        <button
          onClick={onNewDiscovery}
          className="flex-1 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors"
        >
          New Discovery Session
        </button>
      </div>

      {/* Clear button */}
      {savedTracks.length > 0 && (
        <div className="text-center pt-4 border-t border-white/10">
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to clear all saved tracks?",
                )
              ) {
                onClearResults();
              }
            }}
            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Tracks
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsView;
