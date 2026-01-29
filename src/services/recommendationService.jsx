const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY || "";

// Enhanced keyword detection patterns
const SIMILARITY_KEYWORDS = [
  "like",
  "similar",
  "sounds like",
  "reminds me of",
  "style of",
];
const MOOD_KEYWORDS = [
  "sad",
  "happy",
  "energetic",
  "chill",
  "angry",
  "peaceful",
  "romantic",
];

class LastFMService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://ws.audioscrobbler.com/2.0/";
  }

  async makeRequest(method, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        method,
        api_key: this.apiKey,
        format: "json",
        ...params,
      });

      const response = await fetch(`${this.baseUrl}?${queryParams}`);
      if (!response.ok)
        throw new Error(`Last.fm API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Last.fm request failed:", error);
      return null;
    }
  }

  getAlbumArt(track) {
    if (track.image && Array.isArray(track.image)) {
      const sizes = ["extralarge", "large", "medium"];
      for (const size of sizes) {
        const img = track.image.find((i) => i.size === size);
        // Skip Last.fm's default placeholder (has this specific hash)
        if (
          img?.["#text"] &&
          img["#text"].trim() &&
          !img["#text"].includes("2a96cbd8b46e442fc41c2b86b821562f")
        ) {
          return img["#text"];
        }
      }
    }

    const trackName = track.name || track.title || "M";
    const artistName = track.artist?.name || track.artist || "A";
    const initials =
      trackName.charAt(0).toUpperCase() + artistName.charAt(0).toUpperCase();

    const colors = [
      "6366f1",
      "ec4899",
      "8b5cf6",
      "14b8a6",
      "f59e0b",
      "ef4444",
      "10b981",
      "3b82f6",
    ];
    const color = colors[trackName.charCodeAt(0) % colors.length];

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&size=500&bold=true&font-size=0.4`;
  }

  normalizeTrack(track, source = "search") {
    return {
      id:
        track.mbid ||
        `lastfm_${source}_${track.name}_${track.artist?.name || track.artist}`,
      name: track.name,
      title: track.name,
      artist: {
        name: track.artist?.name || track.artist || "Unknown Artist",
        mbid: track.artist?.mbid || null,
      },
      url: track.url,
      listeners: parseInt(track.listeners) || 0,
      playcount: parseInt(track.playcount) || 0,
      images: {
        large: this.getAlbumArt(track),
        medium: this.getAlbumArt(track),
        small: this.getAlbumArt(track),
      },
      mbid: track.mbid || null,
      preview: null,
      source: "lastfm",
    };
  }

  async searchTracks(query, limit = 15) {
    const data = await this.makeRequest("track.search", {
      track: query,
      limit,
    });
    if (!data?.results?.trackmatches?.track) return [];

    const tracks = Array.isArray(data.results.trackmatches.track)
      ? data.results.trackmatches.track
      : [data.results.trackmatches.track];

    return tracks.map((t) => this.normalizeTrack(t, "search"));
  }

  async searchArtists(query, limit = 5) {
    const data = await this.makeRequest("artist.search", {
      artist: query,
      limit,
    });
    if (!data?.results?.artistmatches?.artist) return [];

    const artists = Array.isArray(data.results.artistmatches.artist)
      ? data.results.artistmatches.artist
      : [data.results.artistmatches.artist];

    return artists;
  }

  async getSimilarArtists(artistName, limit = 10) {
    const data = await this.makeRequest("artist.getsimilar", {
      artist: artistName,
      limit,
    });

    if (!data?.similarartists?.artist) return [];

    const artists = Array.isArray(data.similarartists.artist)
      ? data.similarartists.artist
      : [data.similarartists.artist];

    return artists;
  }

  async getArtistTopTracks(artistName, limit = 5) {
    const data = await this.makeRequest("artist.gettoptracks", {
      artist: artistName,
      limit,
    });

    if (!data?.toptracks?.track) return [];

    const tracks = Array.isArray(data.toptracks.track)
      ? data.toptracks.track
      : [data.toptracks.track];

    return tracks.map((t) => this.normalizeTrack(t, "artist_top"));
  }

  async getSimilarTracks(artist, track, limit = 10) {
    const data = await this.makeRequest("track.getsimilar", {
      artist,
      track,
      limit,
    });

    if (!data?.similartracks?.track) return [];

    const tracks = Array.isArray(data.similartracks.track)
      ? data.similartracks.track
      : [data.similartracks.track];

    return tracks.map((t) => this.normalizeTrack(t, "similar"));
  }

  async getTopTracksByTag(tag, limit = 10) {
    const data = await this.makeRequest("tag.gettoptracks", {
      tag: tag.toLowerCase(),
      limit,
    });
    if (!data?.tracks?.track) return [];

    const tracks = Array.isArray(data.tracks.track)
      ? data.tracks.track
      : [data.tracks.track];

    return tracks.map((t) => ({
      ...this.normalizeTrack(t, "tag"),
      tag,
      reason: `Popular ${tag} track`,
    }));
  }

  async getTopTracks(limit = 15) {
    const data = await this.makeRequest("chart.gettoptracks", { limit });
    if (!data?.tracks?.track) return [];

    const tracks = Array.isArray(data.tracks.track)
      ? data.tracks.track
      : [data.tracks.track];

    return tracks.map((t) => ({
      ...this.normalizeTrack(t, "chart"),
      reason: "Trending globally",
    }));
  }
}

class RecommendationService {
  constructor() {
    this.lastFM = new LastFMService(LASTFM_API_KEY);
  }

  // Detect query intent
  analyzeQuery(prompt) {
    const lower = prompt.toLowerCase();

    // Check for similarity queries: "radiohead like songs", "similar to radiohead"
    const hasSimilarityKeyword = SIMILARITY_KEYWORDS.some((keyword) =>
      lower.includes(keyword),
    );

    if (hasSimilarityKeyword) {
      // Extract artist name
      const words = prompt.split(/\s+/);
      const filteredWords = words.filter(
        (w) =>
          !SIMILARITY_KEYWORDS.some((k) => k.includes(w.toLowerCase())) &&
          !["songs", "music", "tracks", "artists"].includes(w.toLowerCase()),
      );

      return {
        type: "similar_artist",
        artist: filteredWords.join(" ").trim(),
        originalPrompt: prompt,
      };
    }

    // Check for mood queries
    const moodMatch = MOOD_KEYWORDS.find((mood) => lower.includes(mood));
    if (moodMatch) {
      return {
        type: "mood",
        mood: moodMatch,
        originalPrompt: prompt,
      };
    }

    // Default to general search
    return {
      type: "general",
      query: prompt,
      originalPrompt: prompt,
    };
  }

  async getTextBasedRecommendations(prompt, limit = 15) {
    console.log("Getting recommendations for:", prompt);

    if (!LASTFM_API_KEY || LASTFM_API_KEY.includes("your_lastfm_api_key")) {
      console.warn("No Last.fm API key configured, using mock data");
      return getMockRecommendations(prompt);
    }

    const intent = this.analyzeQuery(prompt);
    console.log("Query intent:", intent);

    try {
      let allTracks = [];

      if (intent.type === "similar_artist") {
        // Get similar artists, then get their top tracks
        const similarArtists = await this.lastFM.getSimilarArtists(
          intent.artist,
          8,
        );
        console.log(
          `Found ${similarArtists.length} similar artists to ${intent.artist}`,
        );

        for (const artist of similarArtists) {
          const topTracks = await this.lastFM.getArtistTopTracks(
            artist.name,
            3,
          );
          allTracks.push(
            ...topTracks.map((track) => ({
              ...track,
              reason: `Similar to ${intent.artist}`,
              score: parseFloat(artist.match) || 0.8,
            })),
          );
        }

        // Also get the original artist's top tracks (fewer of them)
        const originalTracks = await this.lastFM.getArtistTopTracks(
          intent.artist,
          2,
        );
        allTracks.push(
          ...originalTracks.map((track) => ({
            ...track,
            reason: `By ${intent.artist}`,
            score: 0.6,
          })),
        );
      } else if (intent.type === "mood") {
        // Use tag-based search for moods
        const moodTracks = await this.lastFM.getTopTracksByTag(intent.mood, 15);
        allTracks.push(
          ...moodTracks.map((track) => ({
            ...track,
            score: 1.0,
          })),
        );
      } else {
        // General search - try multiple strategies

        // Strategy 1: Direct search
        const directTracks = await this.lastFM.searchTracks(prompt, 8);
        allTracks.push(
          ...directTracks.map((track) => ({
            ...track,
            reason: `Matches "${prompt}"`,
            score: 1.0,
          })),
        );

        // Strategy 2: Extract keywords and search
        const keywords = this.extractKeywords(prompt);
        for (const keyword of keywords.slice(0, 2)) {
          const keywordTracks = await this.lastFM.searchTracks(keyword, 4);
          allTracks.push(
            ...keywordTracks.map((track) => ({
              ...track,
              reason: `Related to ${keyword}`,
              score: 0.8,
            })),
          );
        }

        // Strategy 3: Tag-based if we have genre keywords
        const genreKeywords = [
          "rock",
          "pop",
          "jazz",
          "electronic",
          "hip hop",
          "indie",
          "metal",
          "classical",
        ];
        const matchedGenre = genreKeywords.find((g) =>
          prompt.toLowerCase().includes(g),
        );
        if (matchedGenre) {
          const genreTracks = await this.lastFM.getTopTracksByTag(
            matchedGenre,
            5,
          );
          allTracks.push(
            ...genreTracks.map((track) => ({
              ...track,
              score: 0.7,
            })),
          );
        }
      }

      // Remove duplicates and sort by score
      const uniqueTracks = this.removeDuplicates(allTracks);
      return uniqueTracks
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return getMockRecommendations(prompt);
    }
  }

  async getMoodBasedRecommendations(moods = [], limit = 15) {
    if (!LASTFM_API_KEY || LASTFM_API_KEY.includes("your_lastfm_api_key")) {
      return getMockRecommendations("mood music");
    }

    const MOOD_TO_TAGS = {
      energetic: ["workout", "party", "upbeat"],
      chill: ["chill", "relax", "ambient"],
      happy: ["happy", "upbeat"],
      focused: ["study", "concentration"],
      melancholy: ["sad", "melancholy"],
      party: ["party", "dance"],
      romantic: ["love", "romantic"],
      nostalgic: ["retro", "classic"],
    };

    let allTracks = [];

    try {
      for (const mood of moods.slice(0, 3)) {
        const tags = MOOD_TO_TAGS[mood] || [mood];
        for (const tag of tags.slice(0, 2)) {
          const tracks = await this.lastFM.getTopTracksByTag(tag, 5);
          allTracks.push(
            ...tracks.map((track) => ({
              ...track,
              reason: `Perfect for ${mood} moments`,
              mood,
              score: 0.9,
            })),
          );
        }
      }

      return this.removeDuplicates(allTracks).slice(0, limit);
    } catch (error) {
      console.error("Error getting mood recommendations:", error);
      return getMockRecommendations("mood music");
    }
  }

  async getGenreBasedRecommendations(genres = [], limit = 15) {
    if (!LASTFM_API_KEY || LASTFM_API_KEY.includes("your_lastfm_api_key")) {
      return getMockRecommendations("genre music");
    }

    let allTracks = [];

    try {
      for (const genre of genres.slice(0, 3)) {
        const tracks = await this.lastFM.getTopTracksByTag(genre, 6);
        allTracks.push(
          ...tracks.map((track) => ({
            ...track,
            reason: `Top ${genre} track`,
            genre,
            score: 0.9,
          })),
        );
      }

      return this.removeDuplicates(allTracks).slice(0, limit);
    } catch (error) {
      console.error("Error getting genre recommendations:", error);
      return getMockRecommendations("genre music");
    }
  }

  extractKeywords(prompt) {
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "music",
      "songs",
      "tracks",
      "like",
      "similar",
      "sounds",
      "reminds",
      "style",
    ]);

    return prompt
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));
  }

  removeDuplicates(tracks) {
    const seen = new Set();
    return tracks.filter((track) => {
      const key = `${track.name}_${track.artist?.name}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

// Singleton
let recommendationService = null;

export const getTextBasedRecommendations = async (prompt) => {
  if (!recommendationService) {
    recommendationService = new RecommendationService();
  }
  return recommendationService.getTextBasedRecommendations(prompt, 15);
};

export const getMoodBasedRecommendations = async (moods) => {
  if (!recommendationService) {
    recommendationService = new RecommendationService();
  }
  return recommendationService.getMoodBasedRecommendations(moods, 15);
};

export const getGenreBasedRecommendations = async (genres) => {
  if (!recommendationService) {
    recommendationService = new RecommendationService();
  }
  return recommendationService.getGenreBasedRecommendations(genres, 15);
};

export const getMockRecommendations = (prompt) => {
  return [
    {
      id: "mock_1",
      name: "Paranoid Android",
      title: "Paranoid Android",
      artist: { name: "Radiohead" },
      reason: `Matches "${prompt}"`,
      images: {
        large:
          "https://ui-avatars.com/api/?name=PR&background=6366f1&color=fff&size=500&bold=true",
      },
      preview: null,
      source: "mock",
    },
    {
      id: "mock_2",
      name: "Everything In Its Right Place",
      title: "Everything In Its Right Place",
      artist: { name: "Radiohead" },
      reason: "Popular track",
      images: {
        large:
          "https://ui-avatars.com/api/?name=ER&background=ec4899&color=fff&size=500&bold=true",
      },
      preview: null,
      source: "mock",
    },
    {
      id: "mock_3",
      name: "Fake Plastic Trees",
      title: "Fake Plastic Trees",
      artist: { name: "Radiohead" },
      reason: "Classic track",
      images: {
        large:
          "https://ui-avatars.com/api/?name=FR&background=8b5cf6&color=fff&size=500&bold=true",
      },
      preview: null,
      source: "mock",
    },
  ];
};
