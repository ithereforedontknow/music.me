const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY;

export const getLastfmGenreRecommendations = async (genres, limit = 25) => {
  try {
    // Add validation for API key
    if (!LASTFM_API_KEY || LASTFM_API_KEY === "your_default_key_here") {
      console.error(
        "Last.fm API key is missing. Please add VITE_LASTFM_API_KEY to your .env file",
      );
      return [];
    }

    let allTracks = [];

    for (const genre of genres.slice(0, 3)) {
      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${encodeURIComponent(genre)}&api_key=${LASTFM_API_KEY}&format=json&limit=15`,
      );

      if (!response.ok) {
        throw new Error(`Last.fm API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.tracks?.track) {
        const tracksWithGenre = data.tracks.track.map((track) => ({
          ...track,
          genre: genre,
        }));
        allTracks = [...allTracks, ...tracksWithGenre];
      }
    }

    // Remove duplicates and shuffle
    const uniqueTracks = allTracks.filter(
      (track, index, self) =>
        index ===
        self.findIndex(
          (t) => t.name === track.name && t.artist.name === track.artist.name,
        ),
    );

    return uniqueTracks.sort(() => Math.random() - 0.5).slice(0, limit);
  } catch (error) {
    console.error("Last.fm genre recommendations error:", error);
    return [];
  }
};

// Similar updates for other functions...
export const getSimilarArtists = async (artistName, limit = 5) => {
  try {
    if (!LASTFM_API_KEY || LASTFM_API_KEY === "your_default_key_here") {
      return [];
    }

    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`,
    );

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    return data.similarartists?.artist || [];
  } catch (error) {
    console.error("Last.fm similar artists error:", error);
    return [];
  }
};

export const getArtistTopTracks = async (artistName, limit = 10) => {
  try {
    if (!LASTFM_API_KEY || LASTFM_API_KEY === "your_default_key_here") {
      return [];
    }

    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`,
    );

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    return data.toptracks?.track || [];
  } catch (error) {
    console.error("Last.fm artist top tracks error:", error);
    return [];
  }
};

export const getMoodBasedTracks = async (moods) => {
  try {
    if (!LASTFM_API_KEY || LASTFM_API_KEY === "your_default_key_here") {
      return [];
    }

    const moodTags = {
      energetic: ["rock", "electronic", "punk"],
      chill: ["chillout", "ambient", "lofi"],
      happy: ["pop", "indie", "happy"],
      focused: ["classical", "jazz", "instrumental"],
      melancholy: ["sad", "blues", "acoustic"],
      party: ["dance", "house", "party"],
      romantic: ["rnb", "soul", "love"],
      nostalgic: ["oldies", "retro", "80s"],
    };

    let allTracks = [];

    for (const mood of moods) {
      const tags = moodTags[mood] || [mood];
      for (const tag of tags.slice(0, 2)) {
        const response = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${tag}&api_key=${LASTFM_API_KEY}&format=json&limit=8`,
        );

        if (!response.ok) continue;

        const data = await response.json();
        if (data.tracks?.track) {
          const moodTracks = data.tracks.track.map((track) => ({
            ...track,
            mood: mood,
            reason: `Matches your ${mood} mood`,
          }));
          allTracks = [...allTracks, ...moodTracks];
        }
      }
    }

    return allTracks.filter(
      (track, index, self) =>
        index ===
        self.findIndex(
          (t) => t.name === track.name && t.artist.name === track.artist.name,
        ),
    );
  } catch (error) {
    console.error("Mood-based recommendations error:", error);
    return [];
  }
};

export const getCombinedRecommendations = async (preferences) => {
  const { moods, genres, referenceTrack } = preferences;
  let allTracks = [];

  // Get genre-based recommendations
  if (genres.length > 0) {
    const genreTracks = await getLastfmGenreRecommendations(genres, 20);
    allTracks = [...allTracks, ...genreTracks];
  }

  // Get mood-based recommendations
  if (moods.length > 0) {
    const moodTracks = await getMoodBasedTracks(moods);
    allTracks = [...allTracks, ...moodTracks];
  }

  // Get recommendations based on reference track
  if (referenceTrack) {
    const artistName =
      referenceTrack.artist?.name || referenceTrack.artists?.[0]?.name;
    if (artistName) {
      const similarArtists = await getSimilarArtists(artistName, 3);

      for (const artist of similarArtists) {
        const artistTracks = await getArtistTopTracks(artist.name, 5);
        const tracksWithReason = artistTracks.map((track) => ({
          ...track,
          reason: `Similar to ${artistName}`,
          via: artist.name,
        }));
        allTracks = [...allTracks, ...tracksWithReason];
      }
    }
  }

  // Remove duplicates
  const uniqueTracks = allTracks.filter(
    (track, index, self) =>
      index ===
      self.findIndex(
        (t) => t.name === track.name && t.artist.name === track.artist.name,
      ),
  );

  // Ensure diversity
  const shuffled = [];
  const artistCount = {};

  uniqueTracks.forEach((track) => {
    const artist = track.artist.name;
    artistCount[artist] = (artistCount[artist] || 0) + 1;
  });

  const sorted = [...uniqueTracks].sort((a, b) => {
    const countA = artistCount[a.artist.name];
    const countB = artistCount[b.artist.name];
    return countA - countB;
  });

  return sorted.slice(0, 30);
};
