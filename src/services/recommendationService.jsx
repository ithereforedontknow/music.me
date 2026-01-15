const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY;

// Enhanced mood to genre mapping
const MOOD_TO_GENRES = {
  energetic: ["rock", "electronic", "metal", "punk", "dance", "hip hop"],
  chill: ["chillout", "ambient", "lofi", "jazz", "acoustic", "folk"],
  happy: ["pop", "indie", "happy", "disco", "reggae", "ska"],
  focused: ["classical", "instrumental", "jazz", "post-rock", "minimal"],
  melancholy: ["sad", "blues", "acoustic", "folk", "singer-songwriter"],
  party: ["dance", "house", "edm", "techno", "pop", "hip hop"],
  romantic: ["rnb", "soul", "love", "jazz", "acoustic"],
  nostalgic: ["oldies", "retro", "80s", "90s", "classic rock", "synth-pop"],
};

// Enhanced genre mapping for Last.fm
const GENRE_MAPPINGS = {
  "r&b": "rnb",
  "hip hop": "hip-hop",
  electronic: "electronic",
  alternative: "alternative",
  indie: "indie",
};

export const getLastfmGenreRecommendations = async (genres, limit = 30) => {
  try {
    if (!LASTFM_API_KEY || LASTFM_API_KEY === "your_default_key_here") {
      console.warn("Using fallback mock data for genres");
      return getMockGenreTracks(genres, limit);
    }

    let allTracks = [];

    // Fetch tracks for each genre with proper error handling
    for (const genre of genres.slice(0, 3)) {
      const lastFmGenre =
        GENRE_MAPPINGS[genre.toLowerCase()] || genre.toLowerCase();

      try {
        const response = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${encodeURIComponent(lastFmGenre)}&api_key=${LASTFM_API_KEY}&format=json&limit=20`,
        );

        if (!response.ok) continue;

        const data = await response.json();

        if (data.tracks?.track) {
          // Add genre information and score
          const tracksWithData = data.tracks.track.map((track) => ({
            ...track,
            genres: [genre],
            score: 3, // Base score for genre match
            source: "genre",
            sourceGenre: genre,
          }));

          allTracks = [...allTracks, ...tracksWithData];
        }
      } catch (error) {
        console.warn(`Failed to fetch genre ${genre}:`, error);
        continue;
      }
    }

    return removeDuplicates(allTracks).slice(0, limit);
  } catch (error) {
    console.error("Last.fm genre recommendations error:", error);
    return getMockGenreTracks(genres, limit);
  }
};

export const getMoodBasedTracks = async (moods) => {
  try {
    if (!LASTFM_API_KEY || LASTFM_API_KEY === "your_default_key_here") {
      console.warn("Using fallback mock data for moods");
      return getMockMoodTracks(moods);
    }

    let allTracks = [];

    for (const mood of moods) {
      const moodGenres = MOOD_TO_GENRES[mood] || [mood];

      for (const genre of moodGenres.slice(0, 3)) {
        try {
          const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${encodeURIComponent(genre)}&api_key=${LASTFM_API_KEY}&format=json&limit=10`,
          );

          if (!response.ok) continue;

          const data = await response.json();

          if (data.tracks?.track) {
            const moodTracks = data.tracks.track.map((track) => ({
              ...track,
              moods: [mood],
              score: 2.5, // Score for mood match
              source: "mood",
              sourceMood: mood,
              reason: `Matches your ${mood} mood`,
            }));

            allTracks = [...allTracks, ...moodTracks];
          }
        } catch (error) {
          console.warn(`Failed to fetch mood ${mood}, genre ${genre}:`, error);
          continue;
        }
      }
    }

    return removeDuplicates(allTracks);
  } catch (error) {
    console.error("Mood-based recommendations error:", error);
    return getMockMoodTracks(moods);
  }
};

export const getSimilarArtists = async (artistName, limit = 5) => {
  try {
    if (!LASTFM_API_KEY) return [];

    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`,
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.similarartists?.artist || [];
  } catch (error) {
    console.error("Last.fm similar artists error:", error);
    return [];
  }
};

export const getArtistTopTracks = async (artistName, limit = 8) => {
  try {
    if (!LASTFM_API_KEY) return [];

    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`,
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.toptracks?.track || [];
  } catch (error) {
    console.error("Last.fm artist top tracks error:", error);
    return [];
  }
};

// Improved scoring system
const calculateTrackScore = (track, userPreferences) => {
  let score = track.score || 0;
  const {
    genres: userGenres,
    moods: userMoods,
    referenceTrack,
  } = userPreferences;

  // Bonus for matching multiple criteria
  if (track.genres && userGenres) {
    const genreMatches = track.genres.filter((g) =>
      userGenres.some((ug) => ug.toLowerCase() === g.toLowerCase()),
    );
    score += genreMatches.length * 0.5;
  }

  if (track.moods && userMoods) {
    const moodMatches = track.moods.filter((m) =>
      userMoods.some((um) => um.toLowerCase() === m.toLowerCase()),
    );
    score += moodMatches.length * 0.5;
  }

  // Artist similarity bonus
  if (referenceTrack && track.artist) {
    const refArtist =
      referenceTrack.artist?.name || referenceTrack.artists?.[0]?.name;
    if (
      refArtist &&
      track.artist.name &&
      track.artist.name.toLowerCase().includes(refArtist.toLowerCase())
    ) {
      score += 2;
    }
  }

  // Add randomness for diversity
  score += Math.random() * 0.3;

  return score;
};

// Better duplicate removal
const removeDuplicates = (tracks) => {
  const seen = new Set();
  return tracks.filter((track) => {
    const key = `${track.name?.toLowerCase()}_${track.artist?.name?.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// Ensure artist diversity
const ensureArtistDiversity = (tracks, maxPerArtist = 3) => {
  const artistCount = {};
  const result = [];

  for (const track of tracks) {
    const artist = track.artist?.name;
    if (!artist) continue;

    artistCount[artist] = (artistCount[artist] || 0) + 1;
    if (artistCount[artist] <= maxPerArtist) {
      result.push(track);
    }
  }

  return result;
};

export const getCombinedRecommendations = async (preferences) => {
  const { moods, genres, referenceTrack } = preferences;
  let allTracks = [];

  // Fetch from different sources in parallel
  const [genreTracks, moodTracks] = await Promise.all([
    genres.length > 0
      ? getLastfmGenreRecommendations(genres, 25)
      : Promise.resolve([]),
    moods.length > 0 ? getMoodBasedTracks(moods) : Promise.resolve([]),
  ]);

  allTracks = [...genreTracks, ...moodTracks];

  // Add reference track recommendations if available
  if (referenceTrack) {
    const artistName =
      referenceTrack.artist?.name || referenceTrack.artists?.[0]?.name;
    if (artistName) {
      try {
        const similarArtists = await getSimilarArtists(artistName, 3);

        for (const artist of similarArtists) {
          const artistTracks = await getArtistTopTracks(artist.name, 5);
          const tracksWithReason = artistTracks.map((track) => ({
            ...track,
            reason: `Similar to ${artistName}`,
            via: artist.name,
            score: 2,
            source: "reference",
          }));
          allTracks = [...allTracks, ...tracksWithReason];
        }
      } catch (error) {
        console.warn("Reference track recommendations failed:", error);
      }
    }
  }

  // Remove duplicates
  let uniqueTracks = removeDuplicates(allTracks);

  // Calculate scores based on user preferences
  uniqueTracks = uniqueTracks.map((track) => ({
    ...track,
    score: calculateTrackScore(track, preferences),
  }));

  // Sort by score
  uniqueTracks.sort((a, b) => b.score - a.score);

  // Ensure artist diversity
  uniqueTracks = ensureArtistDiversity(uniqueTracks, 2);

  // Final shuffle for variety
  const shuffled = [
    ...uniqueTracks.slice(0, 20),
    ...uniqueTracks.slice(20).sort(() => Math.random() - 0.5),
  ];

  return shuffled.slice(0, 40); // Return more tracks for fallback
};

// Fallback mock data functions
const getMockGenreTracks = (genres, limit) => {
  const mockTracks = [];
  const artists = [
    "The Beatles",
    "Radiohead",
    "Daft Punk",
    "Kendrick Lamar",
    "Taylor Swift",
    "Tame Impala",
    "Billie Eilish",
    "Arctic Monkeys",
  ];

  genres.slice(0, 3).forEach((genre, genreIndex) => {
    for (let i = 0; i < 10; i++) {
      const artistIndex = (genreIndex * 3 + i) % artists.length;
      mockTracks.push({
        name: `${genre} Song ${i + 1}`,
        artist: { name: artists[artistIndex] },
        genre: genre,
        score: 2 + Math.random(),
        source: "genre",
      });
    }
  });

  return mockTracks.slice(0, limit);
};

const getMockMoodTracks = (moods) => {
  const mockTracks = [];
  const artists = [
    "Frank Ocean",
    "Lana Del Rey",
    "Mac DeMarco",
    "Khalid",
    "H.E.R.",
    "Daniel Caesar",
    "SZA",
    "Brent Faiyaz",
  ];

  moods.forEach((mood, moodIndex) => {
    for (let i = 0; i < 8; i++) {
      const artistIndex = (moodIndex * 2 + i) % artists.length;
      mockTracks.push({
        name: `${mood} Vibes ${i + 1}`,
        artist: { name: artists[artistIndex] },
        moods: [mood],
        score: 1.5 + Math.random(),
        source: "mood",
      });
    }
  });

  return mockTracks;
};
