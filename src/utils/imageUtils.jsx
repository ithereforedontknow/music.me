// Unified image utility for the entire app
const LASTFM_IMAGE_SIZES = ["extralarge", "large", "medium", "small"];

export const getTrackImage = (track, size = "medium") => {
  if (!track) return generatePlaceholderImage("M", "A");

  // Try Last.fm image structure first (most reliable)
  if (track.image) {
    // Last.fm returns array of images: [{ "#text": "url", "size": "small" }, ...]
    const imageArray = track.image;
    const preferredSize = imageArray.find((img) => img.size === size);
    if (preferredSize && preferredSize["#text"]) {
      return preferredSize["#text"];
    }
    // Fallback through sizes
    for (const imageSize of LASTFM_IMAGE_SIZES) {
      const img = imageArray.find((img) => img.size === imageSize);
      if (img && img["#text"]) {
        return img["#text"];
      }
    }
  }

  // Try our service's image structure
  if (track.images) {
    if (track.images.large) return track.images.large;
    if (track.images.medium) return track.images.medium;
    if (track.images.small) return track.images.small;
  }

  // Try thumbnail
  if (track.thumbnail) return track.thumbnail;

  // Try album covers
  if (track.album) {
    if (track.album.cover_big) return track.album.cover_big;
    if (track.album.cover_small) return track.album.cover_small;
  }

  // Generate placeholder with initials
  const trackInitial = track.name ? track.name.charAt(0).toUpperCase() : "M";
  const artistInitial = track.artist?.name
    ? track.artist.name.charAt(0).toUpperCase()
    : "A";

  return generatePlaceholderImage(trackInitial, artistInitial);
};

export const generatePlaceholderImage = (firstLetter, secondLetter) => {
  // Generate consistent color based on letters
  const colors = [
    "bg-gradient-to-br from-pink-500 to-purple-500",
    "bg-gradient-to-br from-blue-500 to-teal-500",
    "bg-gradient-to-br from-orange-500 to-yellow-500",
    "bg-gradient-to-br from-green-500 to-emerald-500",
    "bg-gradient-to-br from-indigo-500 to-purple-500",
  ];

  const charSum =
    firstLetter.charCodeAt(0) + (secondLetter?.charCodeAt(0) || 0);
  const colorIndex = charSum % colors.length;

  return colors[colorIndex];
};

export const normalizeTrackData = (track) => {
  // Ensure consistent track structure across the app
  return {
    id:
      track.id ||
      track.mbid ||
      `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: track.name || track.title || "Unknown Track",
    artist: {
      name: track.artist?.name || track.artist || "Unknown Artist",
      mbid: track.artist?.mbid || track.artistMbid,
    },
    album: {
      title: track.album?.title || track.album || "Unknown Album",
      mbid: track.album?.mbid,
    },
    images:
      track.images ||
      (track.image
        ? {
            small: track.image.find((img) => img.size === "small")?.["#text"],
            medium: track.image.find((img) => img.size === "medium")?.["#text"],
            large: track.image.find((img) => img.size === "large")?.["#text"],
          }
        : {}),
    genre: track.genre || "Unknown",
    mood: track.mood || "neutral",
    reason: track.reason || "",
    year: track.year || 0,
    duration: track.duration || 180,
    url:
      track.url ||
      `https://www.last.fm/music/${encodeURIComponent(track.artist?.name || "Unknown")}/_/${encodeURIComponent(track.name || "Unknown")}`,
    source: track.source || "unknown",
    preview: track.preview,
  };
};
