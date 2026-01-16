// API Configuration
const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY || "";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// API Endpoints
const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Mood to Last.fm tag mapping
const MOOD_TO_TAGS = {
  energetic: ["energetic", "upbeat", "dance", "workout", "party"],
  chill: ["chill", "ambient", "lofi", "relax", "calm"],
  happy: ["happy", "uplifting", "feelgood", "positive", "sunny"],
  focused: ["focus", "study", "concentration", "work", "productive"],
  melancholy: ["sad", "melancholy", "emotional", "reflective", "somber"],
  party: ["party", "dance", "club", "festival", "celebration"],
  romantic: ["romantic", "love", "intimate", "passionate", "sensual"],
  nostalgic: ["nostalgic", "retro", "throwback", "classic", "oldies"],
};

// Genre to Last.fm tag mapping
const GENRE_MAPPINGS = {
  rock: "rock",
  pop: "pop",
  electronic: "electronic",
  "hip hop": "hiphop",
  jazz: "jazz",
  indie: "indie",
  alternative: "alternative",
  "r&b": "rnb",
  classical: "classical",
  metal: "metal",
  folk: "folk",
  soul: "soul",
  kpop: "kpop",
  lofi: "lofi",
  country: "country",
  reggae: "reggae",
};

// Last.fm API Service
export class LastFmService {
  constructor(apiKey) {
    this.apiKey = apiKey || LASTFM_API_KEY;
    this.baseUrl = LASTFM_API_URL;
  }

  async makeRequest(method, params) {
    try {
      const queryParams = new URLSearchParams({
        method,
        api_key: this.apiKey,
        format: "json",
        ...params,
      });

      const response = await fetch(`${this.baseUrl}?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Last.fm API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Last.fm request failed:", error);
      throw error;
    }
  }

  async getTopTracksByTag(tag, limit = 15) {
    try {
      const data = await this.makeRequest("tag.gettoptracks", {
        tag: tag.toLowerCase(),
        limit,
      });

      if (data?.tracks?.track) {
        return data.tracks.track.map((track) => ({
          id: track.mbid || track.url,
          name: track.name,
          artist: {
            name: track.artist.name,
            mbid: track.artist.mbid,
          },
          url: track.url,
          duration: track.duration ? parseInt(track.duration) / 1000 : 180,
          playcount: parseInt(track.playcount) || 0,
          listeners: parseInt(track.listeners) || 0,
          tag: tag,
          source: "lastfm_tag",
        }));
      }
      return [];
    } catch (error) {
      console.error(`Failed to get tracks for tag ${tag}:`, error);
      return [];
    }
  }

  async getSimilarTracks(artist, track, limit = 10) {
    try {
      const data = await this.makeRequest("track.getsimilar", {
        artist: artist,
        track: track,
        limit,
      });

      if (data?.similartracks?.track) {
        return data.similartracks.track.map((track) => ({
          id: track.mbid || track.url,
          name: track.name,
          artist: {
            name: track.artist.name,
            mbid: track.artist.mbid,
          },
          url: track.url,
          source: "lastfm_similar",
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to get similar tracks:", error);
      return [];
    }
  }

  async getArtistTopTracks(artist, limit = 8) {
    try {
      const data = await this.makeRequest("artist.gettoptracks", {
        artist: artist,
        limit,
      });

      if (data?.toptracks?.track) {
        return data.toptracks.track.map((track) => ({
          id: track.mbid || track.url,
          name: track.name,
          artist: {
            name: track.artist.name,
          },
          url: track.url,
          playcount: parseInt(track.playcount) || 0,
          source: "lastfm_artist",
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to get artist top tracks:", error);
      return [];
    }
  }

  async searchTracks(query, limit = 10) {
    try {
      const data = await this.makeRequest("track.search", {
        track: query,
        limit,
      });

      if (data?.results?.trackmatches?.track) {
        return data.results.trackmatches.track.map((track) => ({
          id: track.mbid || track.url,
          name: track.name,
          artist: {
            name: track.artist,
          },
          url: track.url,
          listeners: parseInt(track.listeners) || 0,
          source: "lastfm_search",
        }));
      }
      return [];
    } catch (error) {
      console.error("Search failed:", error);
      return [];
    }
  }

  async getTrackInfo(artist, track) {
    try {
      const data = await this.makeRequest("track.getInfo", {
        artist: artist,
        track: track,
      });

      if (data?.track) {
        return {
          id: data.track.mbid || data.track.url,
          name: data.track.name,
          artist: {
            name: data.track.artist.name,
            mbid: data.track.artist.mbid,
          },
          album: data.track.album?.title,
          duration: parseInt(data.track.duration) / 1000 || 180,
          playcount: parseInt(data.track.playcount) || 0,
          listeners: parseInt(data.track.listeners) || 0,
          tags: data.track.toptags?.tag?.map((t) => t.name) || [],
          url: data.track.url,
          wiki: data.track.wiki?.content,
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to get track info:", error);
      return null;
    }
  }
}

// Gemini AI Service
export class GeminiMusicService {
  constructor(apiKey) {
    this.apiKey = apiKey || GEMINI_API_KEY;
    this.baseUrl = GEMINI_API_URL;
  }

  async getAIRecommendations(preferences) {
    try {
      if (!this.apiKey) {
        return this.getMockAIRecommendations(preferences);
      }

      const prompt = this.buildRecommendationPrompt(preferences);

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseAIResponse(data);
    } catch (error) {
      console.error("Gemini API error:", error);
      return this.getMockAIRecommendations(preferences);
    }
  }

  buildRecommendationPrompt(preferences) {
    const { moods = [], genres = [], referenceTrack } = preferences;

    let prompt = `You are a music expert with deep knowledge of music across all genres and eras.
    Provide a list of 20 music recommendations in valid JSON format with this exact structure:

    [
      {
        "name": "Song Title",
        "artist": "Artist Name",
        "album": "Album Name (if known)",
        "reason": "Brief explanation of why this track matches the user's preferences (1-2 sentences)",
        "genre": "Primary genre",
        "mood": "Primary mood",
        "year": "Release year (if known)",
        "tags": ["tag1", "tag2", "tag3"]
      }
    ]

    User preferences:
    `;

    if (moods.length > 0) {
      prompt += `- Moods: ${moods.join(", ")}\n`;
    }

    if (genres.length > 0) {
      prompt += `- Genres: ${genres.join(", ")}\n`;
    }

    if (referenceTrack) {
      const trackName = referenceTrack.name || referenceTrack.title;
      const artistName =
        referenceTrack.artist?.name || referenceTrack.artists?.[0]?.name;
      prompt += `- Reference track: "${trackName}" by ${artistName}\n`;
    }

    prompt += `\nGuidelines:
    1. Return ONLY valid JSON, no additional text
    2. Include a mix of popular and underrated tracks
    3. Ensure artist diversity (same artist shouldn't appear more than twice)
    4. Match at least one user preference per track
    5. Include release years when known
    6. Add relevant tags for better categorization
    7. Make reasons insightful and personalized`;

    return prompt;
  }

  parseAIResponse(data) {
    try {
      const text = data.candidates[0].content.parts[0].text;
      // Clean the response text
      const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanedText);

      // Validate and enhance the data
      return parsed.map((track, index) => ({
        id: `ai_${Date.now()}_${index}`,
        name: track.name,
        artist: { name: track.artist },
        album: track.album ? { title: track.album } : undefined,
        reason: track.reason,
        genre: track.genre,
        mood: track.mood,
        year: track.year,
        tags: track.tags || [],
        source: "ai",
        score: 2.5, // Base score for AI recommendations
      }));
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return [];
    }
  }

  getMockAIRecommendations(preferences) {
    const { moods = ["chill"], genres = ["pop"] } = preferences;

    return [
      {
        id: "mock_1",
        name: "Blinding Lights",
        artist: { name: "The Weeknd" },
        album: { title: "After Hours" },
        reason: `A synth-pop masterpiece with 80s influences that perfectly captures ${moods[0]} energy while staying true to ${genres[0]} sensibilities.`,
        genre: genres[0] || "pop",
        mood: moods[0] || "energetic",
        year: 2019,
        tags: ["synth-pop", "80s", "chart-topper"],
        source: "ai_mock",
        score: 3.0,
      },
      {
        id: "mock_2",
        name: "Stay",
        artist: { name: "The Kid LAROI, Justin Bieber" },
        album: { title: "F*CK LOVE 3" },
        reason:
          "Emotional pop collaboration with heartfelt lyrics and a catchy melody that resonates with contemporary pop audiences.",
        genre: "pop",
        mood: "melancholy",
        year: 2021,
        tags: ["pop", "emotional", "collaboration"],
        source: "ai_mock",
        score: 2.8,
      },
      {
        id: "mock_3",
        name: "good 4 u",
        artist: { name: "Olivia Rodrigo" },
        album: { title: "SOUR" },
        reason:
          "Pop-punk influenced track with raw emotional delivery and angsty lyrics that bridge pop and alternative rock.",
        genre: "alternative",
        mood: "energetic",
        year: 2021,
        tags: ["pop-punk", "angsty", "breakup"],
        source: "ai_mock",
        score: 2.9,
      },
    ];
  }
}

// Main Recommendation Service
export class MusicRecommendationService {
  constructor(lastfmApiKey, geminiApiKey) {
    this.lastfmService = new LastFmService(lastfmApiKey);
    this.geminiService = new GeminiMusicService(geminiApiKey);
    this.useLastFm =
      !!lastfmApiKey && lastfmApiKey !== "your_lastfm_api_key_here";
  }

  async getCombinedRecommendations(preferences) {
    const { moods, genres, referenceTrack } = preferences;
    let allTracks = [];

    try {
      console.log("Generating recommendations for:", {
        moods,
        genres,
        referenceTrack,
      });

      // Get Last.fm recommendations by genre
      if (genres && genres.length > 0 && this.useLastFm) {
        console.log("Fetching genre-based recommendations from Last.fm...");
        for (const genre of genres.slice(0, 3)) {
          const lastfmTag =
            GENRE_MAPPINGS[genre.toLowerCase()] || genre.toLowerCase();
          try {
            const genreTracks = await this.lastfmService.getTopTracksByTag(
              lastfmTag,
              10,
            );
            console.log(
              `Found ${genreTracks.length} tracks for genre: ${genre}`,
            );

            const tracksWithMetadata = genreTracks.map((track) => ({
              ...track,
              genre: genre,
              mood: this.detectMoodFromTags(track.tags || [], genre),
              reason: `Top ${genre} track with ${track.playcount.toLocaleString()} plays`,
              score: 3 + track.playcount / 1000000 + Math.random() * 0.3,
              source: "lastfm_genre",
            }));

            allTracks = [...allTracks, ...tracksWithMetadata];
          } catch (error) {
            console.warn(`Failed to get ${genre} recommendations:`, error);
          }
        }
      }

      // Get Last.fm recommendations by mood
      if (moods && moods.length > 0 && this.useLastFm) {
        console.log("Fetching mood-based recommendations from Last.fm...");
        for (const mood of moods.slice(0, 2)) {
          const moodTags = MOOD_TO_TAGS[mood] || [mood];

          for (const tag of moodTags.slice(0, 2)) {
            try {
              const moodTracks = await this.lastfmService.getTopTracksByTag(
                tag,
                8,
              );
              console.log(
                `Found ${moodTracks.length} tracks for mood tag: ${tag}`,
              );

              const tracksWithMetadata = moodTracks.map((track) => ({
                ...track,
                mood: mood,
                reason: `Perfect for ${mood} moments`,
                score: 2.5 + track.listeners / 10000 + Math.random() * 0.3,
                source: "lastfm_mood",
              }));

              allTracks = [...allTracks, ...tracksWithMetadata];
            } catch (error) {
              console.warn(`Failed to get ${tag} mood recommendations:`, error);
            }
          }
        }
      }

      // Get AI recommendations for enhanced diversity and personalization
      if (allTracks.length < 15) {
        console.log("Fetching AI recommendations for diversity...");
        try {
          const aiRecommendations =
            await this.geminiService.getAIRecommendations(preferences);
          console.log(
            `AI provided ${aiRecommendations.length} recommendations`,
          );

          // Add AI tracks with proper metadata
          allTracks = [...allTracks, ...aiRecommendations];
        } catch (error) {
          console.warn("AI recommendations failed:", error);
        }
      }

      // Get similar tracks if reference track is provided
      if (referenceTrack && allTracks.length < 20) {
        const trackName = referenceTrack.name || referenceTrack.title;
        const artistName =
          referenceTrack.artist?.name || referenceTrack.artists?.[0]?.name;

        if (trackName && artistName && this.useLastFm) {
          console.log("Fetching similar tracks from Last.fm...");
          try {
            const similarTracks = await this.lastfmService.getSimilarTracks(
              artistName,
              trackName,
              6,
            );

            const tracksWithMetadata = similarTracks.map((track) => ({
              ...track,
              reason: `Similar to "${trackName}" by ${artistName}`,
              score: 2.8 + Math.random() * 0.4,
              source: "lastfm_similar",
            }));

            allTracks = [...allTracks, ...tracksWithMetadata];
          } catch (error) {
            console.warn("Similar tracks search failed:", error);
          }
        }
      }

      // Remove duplicates based on track name and artist
      const uniqueTracks = this.removeDuplicates(allTracks);
      console.log(`Total unique tracks: ${uniqueTracks.length}`);

      // If we still don't have enough tracks, add fallback
      if (uniqueTracks.length < 8) {
        console.log("Adding fallback tracks...");
        const fallbackTracks = this.getFallbackRecommendations(preferences);
        allTracks = [...uniqueTracks, ...fallbackTracks];
      } else {
        allTracks = uniqueTracks;
      }

      // Calculate final scores with user preference bonuses
      const scoredTracks = allTracks.map((track) => ({
        ...track,
        score: this.calculateScore(track, preferences),
        hasPreview: false, // Last.fm doesn't provide audio previews
      }));

      // Sort by score
      scoredTracks.sort((a, b) => b.score - a.score);

      // Ensure artist diversity in top results
      const diverseTracks = this.ensureArtistDiversity(scoredTracks, 2);

      // Final list with enhanced metadata
      const finalTracks = diverseTracks
        .slice(0, 25)
        .map((track) => this.enhanceTrackMetadata(track));

      console.log("Final track count:", finalTracks.length);
      return finalTracks;
    } catch (error) {
      console.error("Combined recommendations failed:", error);
      return this.getFallbackRecommendations(preferences);
    }
  }

  detectMoodFromTags(tags, genre) {
    const moodKeywords = {
      energetic: ["energetic", "upbeat", "dance", "party", "workout"],
      chill: ["chill", "calm", "relax", "ambient", "peaceful"],
      happy: ["happy", "joyful", "uplifting", "positive", "sunny"],
      focused: ["focus", "study", "concentration", "work", "productive"],
    };

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (
        keywords.some((keyword) =>
          tags.some((tag) => tag.toLowerCase().includes(keyword)),
        )
      ) {
        return mood;
      }
    }

    return "chill"; // Default mood
  }

  removeDuplicates(tracks) {
    const seen = new Set();
    return tracks.filter((track) => {
      const key = `${track.name?.toLowerCase()}_${track.artist?.name?.toLowerCase()}`;
      if (seen.has(key) || !track.name || !track.artist?.name) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  ensureArtistDiversity(tracks, maxPerArtist = 2) {
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
  }

  calculateScore(track, preferences) {
    let score = track.score || 1;
    const { moods = [], genres = [] } = preferences;

    // Bonus for matching user preferences
    if (
      track.genre &&
      genres.some(
        (g) =>
          g.toLowerCase().includes(track.genre.toLowerCase()) ||
          track.genre.toLowerCase().includes(g.toLowerCase()),
      )
    ) {
      score += 0.8;
    }

    if (
      track.mood &&
      moods.some(
        (m) =>
          m.toLowerCase().includes(track.mood.toLowerCase()) ||
          track.mood.toLowerCase().includes(m.toLowerCase()),
      )
    ) {
      score += 0.7;
    }

    // Source bonus (Last.fm > AI > Mock)
    if (track.source?.startsWith("lastfm")) {
      score += 0.3;
    } else if (track.source?.startsWith("ai")) {
      score += 0.2;
    }

    // Popularity bonus for Last.fm tracks
    if (track.playcount) {
      score += Math.min(track.playcount / 1000000, 0.5);
    }

    // Random factor for diversity
    score += Math.random() * 0.2;

    return Math.min(score, 5);
  }

  enhanceTrackMetadata(track) {
    // Generate placeholder image based on track/artist name
    const placeholderText = encodeURIComponent(
      (track.name?.charAt(0) || "M") + (track.artist?.name?.charAt(0) || "A"),
    );

    return {
      ...track,
      // Add placeholder images for UI
      images: {
        small: `https://ui-avatars.com/api/?name=${placeholderText}&background=7D5260&color=fff&size=150`,
        medium: `https://ui-avatars.com/api/?name=${placeholderText}&background=7D5260&color=fff&size=300`,
        large: `https://ui-avatars.com/api/?name=${placeholderText}&background=7D5260&color=fff&size=500`,
      },
      // Add album info if missing
      album: track.album || { title: "Unknown Album" },
      // Ensure duration
      duration: track.duration || 180,
    };
  }

  getFallbackRecommendations(preferences) {
    console.log("Using fallback recommendations");
    const { moods = ["chill"], genres = ["pop"] } = preferences;

    const fallbackTracks = [
      {
        id: "fallback_1",
        name: "Blinding Lights",
        artist: { name: "The Weeknd" },
        album: { title: "After Hours" },
        images: {
          small:
            "https://i.scdn.co/image/ab67616d00001e02/4c5a1d3c7c20caa2ef52a2b0b9f8b1a8",
          medium:
            "https://i.scdn.co/image/ab67616d00001e02/4c5a1d3c7c20caa2ef52a2b0b9f8b1a8",
          large:
            "https://i.scdn.co/image/ab67616d00001e02/4c5a1d3c7c20caa2ef52a2b0b9f8b1a8",
        },
        reason: `A synth-pop masterpiece that captures ${moods[0]} energy`,
        genre: genres[0] || "pop",
        mood: moods[0] || "energetic",
        year: 2019,
        duration: 200,
        playcount: 250000000,
        source: "fallback",
        score: 3.5,
        hasPreview: false,
      },
      {
        id: "fallback_2",
        name: "Stay",
        artist: { name: "The Kid LAROI, Justin Bieber" },
        album: { title: "F*CK LOVE 3" },
        images: {
          small:
            "https://i.scdn.co/image/ab67616d00001e02/5b2f6dfb0e0a0b0a0a0a0a0a0a0a0a0a",
          medium:
            "https://i.scdn.co/image/ab67616d00001e02/5b2f6dfb0e0a0b0a0a0a0a0a0a0a0a0a",
          large:
            "https://i.scdn.co/image/ab67616d00001e02/5b2f6dfb0e0a0b0a0a0a0a0a0a0a0a0a",
        },
        reason: "Emotional pop collaboration with heartfelt lyrics",
        genre: "pop",
        mood: "melancholy",
        year: 2021,
        duration: 141,
        playcount: 200000000,
        source: "fallback",
        score: 3.2,
        hasPreview: false,
      },
      {
        id: "fallback_3",
        name: "good 4 u",
        artist: { name: "Olivia Rodrigo" },
        album: { title: "SOUR" },
        images: {
          small:
            "https://i.scdn.co/image/ab67616d00001e02/6b9b6c9e6b9b6c9e6b9b6c9e6b9b6c9e",
          medium:
            "https://i.scdn.co/image/ab67616d00001e02/6b9b6c9e6b9b6c9e6b9b6c9e6b9b6c9e",
          large:
            "https://i.scdn.co/image/ab67616d00001e02/6b9b6c9e6b9b6c9e6b9b6c9e6b9b6c9e",
        },
        reason: "Pop-punk influenced track with raw emotional delivery",
        genre: "alternative",
        mood: "energetic",
        year: 2021,
        duration: 178,
        playcount: 180000000,
        source: "fallback",
        score: 3.0,
        hasPreview: false,
      },
      {
        id: "fallback_4",
        name: "Heat Waves",
        artist: { name: "Glass Animals" },
        album: { title: "Dreamland" },
        images: {
          small:
            "https://i.scdn.co/image/ab67616d00001e02/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5",
          medium:
            "https://i.scdn.co/image/ab67616d00001e02/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5",
          large:
            "https://i.scdn.co/image/ab67616d00001e02/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5",
        },
        reason: "Dreamy indie electronic perfect for chill sessions",
        genre: "indie",
        mood: "chill",
        year: 2020,
        duration: 238,
        playcount: 220000000,
        source: "fallback",
        score: 2.8,
        hasPreview: false,
      },
      {
        id: "fallback_5",
        name: "As It Was",
        artist: { name: "Harry Styles" },
        album: { title: "Harry's House" },
        images: {
          small:
            "https://i.scdn.co/image/ab67616d00001e02/b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
          medium:
            "https://i.scdn.co/image/ab67616d00001e02/b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
          large:
            "https://i.scdn.co/image/ab67616d00001e02/b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
        },
        reason: "Catchy pop with nostalgic 80s influence",
        genre: "pop",
        mood: "nostalgic",
        year: 2022,
        duration: 167,
        playcount: 190000000,
        source: "fallback",
        score: 2.7,
        hasPreview: false,
      },
    ];

    return fallbackTracks;
  }
}

// Export singleton instance
let recommendationServiceInstance = null;

export const getCombinedRecommendations = async (preferences) => {
  if (!recommendationServiceInstance) {
    const lastfmApiKey = import.meta.env.VITE_LASTFM_API_KEY;
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    recommendationServiceInstance = new MusicRecommendationService(
      lastfmApiKey,
      geminiApiKey,
    );
  }

  return recommendationServiceInstance.getCombinedRecommendations(preferences);
};

// Export individual services for specific use cases
export const searchLastFmTracks = async (query) => {
  const lastfmApiKey = import.meta.env.VITE_LASTFM_API_KEY;
  const service = new LastFmService(lastfmApiKey);
  return service.searchTracks(query);
};

export const getTrackInfo = async (artist, track) => {
  const lastfmApiKey = import.meta.env.VITE_LASTFM_API_KEY;
  const service = new LastFmService(lastfmApiKey);
  return service.getTrackInfo(artist, track);
};
