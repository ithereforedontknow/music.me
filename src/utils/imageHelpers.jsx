// utils/imageHelpers.js - Smart Image Handling for Last.fm
import { Music } from "lucide-react";

/**
 * Get track image with intelligent fallbacks
 * Last.fm images are often missing or broken, so we need multiple strategies
 */
export const getTrackImage = (track) => {
  if (!track) return null;

  // Strategy 1: Try Last.fm image array
  if (track.image && Array.isArray(track.image)) {
    const sizes = ["extralarge", "large", "medium", "small"];
    for (const size of sizes) {
      const img = track.image.find((i) => i.size === size);
      if (
        img?.["#text"] &&
        img["#text"].trim() &&
        !img["#text"].includes("2a96cbd8b46e442fc41c2b86b821562f")
      ) {
        // Last.fm default placeholder has this hash - skip it
        return img["#text"];
      }
    }
  }

  // Strategy 2: Try images object (our normalized format)
  if (track.images?.large && !track.images.large.includes("ui-avatars")) {
    return track.images.large;
  }
  if (track.images?.medium && !track.images.medium.includes("ui-avatars")) {
    return track.images.medium;
  }
  if (track.images?.small && !track.images.small.includes("ui-avatars")) {
    return track.images.small;
  }

  // Strategy 3: Try to fetch from MusicBrainz Cover Art Archive using MBID
  if (track.mbid) {
    return `https://coverartarchive.org/release/${track.mbid}/front-250`;
  }

  // Strategy 4: Generate a nice gradient placeholder with initials
  const trackName = track.name || track.title || "Music";
  const artistName = track.artist?.name || track.artist || "Artist";
  const initials =
    trackName.charAt(0).toUpperCase() + artistName.charAt(0).toUpperCase();

  // Use a variety of colors based on first letter
  const colors = {
    A: "6366f1",
    B: "ec4899",
    C: "8b5cf6",
    D: "14b8a6",
    E: "f59e0b",
    F: "ef4444",
    G: "10b981",
    H: "3b82f6",
    I: "a855f7",
    J: "f97316",
    K: "06b6d4",
    L: "84cc16",
    M: "d946ef",
    N: "eab308",
    O: "22c55e",
    P: "0ea5e9",
    Q: "f43f5e",
    R: "8b5cf6",
    S: "06b6d4",
    T: "ec4899",
    U: "14b8a6",
    V: "f59e0b",
    W: "6366f1",
    X: "ef4444",
    Y: "10b981",
    Z: "a855f7",
  };

  const color = colors[trackName.charAt(0).toUpperCase()] || "7D5260";

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&size=500&bold=true&font-size=0.4`;
};

/**
 * Component for rendering track image with error handling
 */
export const TrackImage = ({ track, size = "large", className = "" }) => {
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const imageUrl = getTrackImage(track);

  if (error || !imageUrl) {
    return (
      <div
        className={`bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center ${className}`}
      >
        <Music className="w-1/3 h-1/3 text-accent/40" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={track.name || track.title}
      className={`${className} ${loading ? "opacity-0" : "opacity-100"} transition-opacity`}
      onLoad={() => setLoading(false)}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

/**
 * Preload image to check if it's valid
 */
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = reject;
    img.src = url;
  });
};
