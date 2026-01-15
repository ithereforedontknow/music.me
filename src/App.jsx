import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleCanvas from "./components/ParticleCanvas";
import LogoMorph from "./components/LogoMorph";
import OnboardingFlow from "./components/Onboarding/OnboardingFlow";
import GenerationSequence from "./components/GenerationSequence";
import SwipeInterface from "./components/SwipeInterface";
import BentoResults from "./components/BentoResults";
import { Music } from "lucide-react";
import { getCombinedRecommendations } from "./services/recommendationService";

const App = () => {
  const [flowState, setFlowState] = useState("logo");
  const [userPreferences, setUserPreferences] = useState({
    moods: [],
    genres: [],
    referenceTrack: null,
  });
  const [generatedDeck, setGeneratedDeck] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleLogoComplete = () => {
    setTimeout(() => setFlowState("onboarding"), 800);
  };

  const handleOnboardingComplete = async (preferences) => {
    console.log("Onboarding complete with preferences:", preferences);
    setUserPreferences(preferences);
    setFlowState("generating");
    await generateDeckWithLastfm(preferences);
  };

  // Function to try multiple CORS proxies
  const fetchWithProxies = async (url, retries = 3) => {
    const proxies = [
      "https://corsproxy.io/?", // Primary proxy
      "https://api.allorigins.win/raw?url=", // Backup 1
      "https://cors-anywhere.herokuapp.com/", // Backup 2 (but often blocked)
    ];

    for (let i = 0; i < proxies.length && retries > 0; i++) {
      try {
        const proxyUrl = proxies[i] + encodeURIComponent(url);
        console.log(`Trying proxy ${i}: ${proxyUrl}`);

        const response = await fetch(proxyUrl, {
          headers: i === 2 ? { Origin: window.location.origin } : {}, // Add origin header for cors-anywhere
        });

        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn(`Proxy ${i} failed:`, error);
        retries--;
      }
    }

    throw new Error("All proxies failed");
  };

  const generateDeckWithLastfm = async (preferences) => {
    const updateProgress = (progress, message) => {
      setLoadingProgress(progress);
      setLoadingMessage(message);
    };

    try {
      updateProgress(10, "Analyzing your music taste...");

      // Ensure we have at least some preferences for "Surprise Me"
      const finalPreferences = {
        ...preferences,
        moods:
          preferences.moods && preferences.moods.length > 0
            ? preferences.moods
            : ["chill", "energetic"],
        genres:
          preferences.genres && preferences.genres.length > 0
            ? preferences.genres
            : ["pop", "rock"],
      };

      updateProgress(30, "Getting recommendations...");
      const lastfmTracks = await getCombinedRecommendations(finalPreferences);

      if (lastfmTracks.length === 0) {
        console.log("No Last.fm tracks found, using mock data");
        return generateMockDeck(finalPreferences);
      }

      updateProgress(60, "Finding track previews...");
      const tracksWithPreviews = await enrichTracksWithDeezer(lastfmTracks);

      // Filter to only tracks with previews for better UX
      const playableTracks = tracksWithPreviews.filter(
        (track) => track.preview || track.preview_url,
      );

      // If we have few playable tracks, try to add more
      if (playableTracks.length < 5) {
        console.log(
          `Only ${playableTracks.length} playable tracks, adding mock data`,
        );
        const mockTracks = generateMockTracks(finalPreferences);
        playableTracks.push(...mockTracks);
      }

      // Remove duplicates
      const uniqueTracks = playableTracks
        .filter(
          (track, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.name === track.name && t.artist?.name === track.artist?.name,
            ),
        )
        .slice(0, 30);

      if (uniqueTracks.length === 0) {
        throw new Error("NO_PLAYABLE_TRACKS");
      }

      setGeneratedDeck(uniqueTracks);
      setLikedTracks([]);

      updateProgress(90, "Finalizing your discovery deck...");
      updateProgress(100, "Ready to discover!");

      setTimeout(() => {
        setFlowState("swiping");
        setLoadingProgress(0);
        setLoadingMessage("");
      }, 1000);
    } catch (error) {
      console.error("Deck generation failed:", error);

      // Fallback to mock data
      console.log("Falling back to mock data");
      const mockDeck = generateMockDeck(preferences);
      setGeneratedDeck(mockDeck);
      setLikedTracks([]);

      setTimeout(() => {
        setFlowState("swiping");
        setLoadingProgress(0);
        setLoadingMessage("");
      }, 1000);
    }
  };

  // Generate mock deck as fallback
  const generateMockDeck = (preferences) => {
    const moods = preferences.moods || ["chill", "energetic"];
    const genres = preferences.genres || ["pop", "rock"];

    const mockTracks = generateMockTracks({ moods, genres });
    return mockTracks.slice(0, 15);
  };

  // Generate mock tracks
  const generateMockTracks = (preferences) => {
    const { moods = [], genres = [] } = preferences;

    const mockTracks = [
      {
        name: "Blinding Lights",
        artist: { name: "The Weeknd" },
        preview:
          "https://cdns-preview-7.dzcdn.net/stream/c-7b2a1d75dde45d821e114758f9102d64-4.mp3",
        preview_url:
          "https://cdns-preview-7.dzcdn.net/stream/c-7b2a1d75dde45d821e114758f9102d64-4.mp3",
        album: {
          title: "After Hours",
          name: "After Hours",
          cover_big:
            "https://e-cdns-images.dzcdn.net/images/cover/4c5a1d3c7c20caa2ef52a2b0b9f8b1a8/500x500-000000-80-0-0.jpg",
          cover_small:
            "https://e-cdns-images.dzcdn.net/images/cover/4c5a1d3c7c20caa2ef52a2b0b9f8b1a8/150x150-000000-80-0-0.jpg",
        },
        duration: 200,
        reason: "Popular track",
      },
      {
        name: "Levitating",
        artist: { name: "Dua Lipa" },
        preview:
          "https://cdns-preview-0.dzcdn.net/stream/c-0d756772a3d5f8a1297e7d3bd0c9b0b9-4.mp3",
        preview_url:
          "https://cdns-preview-0.dzcdn.net/stream/c-0d756772a3d5f8a1297e7d3bd0c9b0b9-4.mp3",
        album: {
          title: "Future Nostalgia",
          name: "Future Nostalgia",
          cover_big:
            "https://e-cdns-images.dzcdn.net/images/cover/6b9b6c9e6b9b6c9e6b9b6c9e6b9b6c9e/500x500-000000-80-0-0.jpg",
          cover_small:
            "https://e-cdns-images.dzcdn.net/images/cover/6b9b6c9e6b9b6c9e6b9b6c9e6b9b6c9e/150x150-000000-80-0-0.jpg",
        },
        duration: 203,
        reason: "Top pop track",
      },
      {
        name: "Stay",
        artist: { name: "The Kid LAROI, Justin Bieber" },
        preview:
          "https://cdns-preview-1.dzcdn.net/stream/c-1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6-4.mp3",
        preview_url:
          "https://cdns-preview-1.dzcdn.net/stream/c-1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6-4.mp3",
        album: {
          title: "F*CK LOVE 3",
          name: "F*CK LOVE 3",
          cover_big:
            "https://e-cdns-images.dzcdn.net/images/cover/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5/500x500-000000-80-0-0.jpg",
          cover_small:
            "https://e-cdns-images.dzcdn.net/images/cover/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5/150x150-000000-80-0-0.jpg",
        },
        duration: 141,
        reason: "Chart-topping hit",
      },
      {
        name: "Good 4 U",
        artist: { name: "Olivia Rodrigo" },
        preview:
          "https://cdns-preview-2.dzcdn.net/stream/c-2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7-4.mp3",
        preview_url:
          "https://cdns-preview-2.dzcdn.net/stream/c-2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7-4.mp3",
        album: {
          title: "SOUR",
          name: "SOUR",
          cover_big:
            "https://e-cdns-images.dzcdn.net/images/cover/b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7/500x500-000000-80-0-0.jpg",
          cover_small:
            "https://e-cdns-images.dzcdn.net/images/cover/b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7/150x150-000000-80-0-0.jpg",
        },
        duration: 178,
        reason: "Alternative pop rock",
      },
      {
        name: "Heat Waves",
        artist: { name: "Glass Animals" },
        preview:
          "https://cdns-preview-3.dzcdn.net/stream/c-3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8-4.mp3",
        preview_url:
          "https://cdns-preview-3.dzcdn.net/stream/c-3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8-4.mp3",
        album: {
          title: "Dreamland",
          name: "Dreamland",
          cover_big:
            "https://e-cdns-images.dzcdn.net/images/cover/c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8/500x500-000000-80-0-0.jpg",
          cover_small:
            "https://e-cdns-images.dzcdn.net/images/cover/c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8/150x150-000000-80-0-0.jpg",
        },
        duration: 238,
        reason: "Indie electronic",
      },
    ];

    // Add mood/genre specific tracks
    if (moods.includes("chill")) {
      mockTracks.push({
        name: "Smooth Operator",
        artist: { name: "Sade" },
        preview:
          "https://cdns-preview-4.dzcdn.net/stream/c-4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9-4.mp3",
        preview_url:
          "https://cdns-preview-4.dzcdn.net/stream/c-4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9-4.mp3",
        album: {
          title: "Diamond Life",
          name: "Diamond Life",
          cover_big:
            "https://e-cdns-images.dzcdn.net/images/cover/d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9/500x500-000000-80-0-0.jpg",
          cover_small:
            "https://e-cdns-images.dzcdn.net/images/cover/d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9/150x150-000000-80-0-0.jpg",
        },
        duration: 256,
        reason: "Perfect chill vibes",
      });
    }

    if (genres.includes("rock")) {
      mockTracks.push({
        name: "Smells Like Teen Spirit",
        artist: { name: "Nirvana" },
        preview:
          "https://cdns-preview-5.dzcdn.net/stream/c-5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0-4.mp3",
        preview_url:
          "https://cdns-preview-5.dzcdn.net/stream/c-5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0-4.mp3",
        album: {
          title: "Nevermind",
          name: "Nevermind",
          cover_big:
            "https://e-cdns-images.dzcdn.net/images/cover/e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0/500x500-000000-80-0-0.jpg",
          cover_small:
            "https://e-cdns-images.dzcdn.net/images/cover/e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0/150x150-000000-80-0-0.jpg",
        },
        duration: 301,
        reason: "Classic rock anthem",
      });
    }

    if (moods.includes("energetic")) {
      mockTracks.push({
        name: "Uptown Funk",
        artist: { name: "Mark Ronson ft. Bruno Mars" },
        preview:
          "https://cdns-preview-6.dzcdn.net/stream/c-6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1-4.mp3",
        preview_url:
          "https://cdns-preview-6.dzcdn.net/stream/c-6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1-4.mp3",
        album: {
          title: "Uptown Special",
          name: "Uptown Special",
          cover_big:
            "https://e-cdns-images.dzcdn.net/images/cover/f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1/500x500-000000-80-0-0.jpg",
          cover_small:
            "https://e-cdns-images.dzcdn.net/images/cover/f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1/150x150-000000-80-0-0.jpg",
        },
        duration: 270,
        reason: "High energy funk",
      });
    }

    return mockTracks;
  };

  const enrichTracksWithDeezer = async (lastfmTracks) => {
    const enrichedTracks = [];
    const tracksToProcess = lastfmTracks.slice(0, 20); // Process fewer tracks

    for (const track of tracksToProcess) {
      try {
        // Clean the search query
        const searchQuery = `${track.name} ${track.artist?.name}`
          .replace(/[^\w\s]/gi, "")
          .trim();

        // Try to fetch from Deezer with fallback
        const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(searchQuery)}&limit=1`;

        let data;
        try {
          data = await fetchWithProxies(deezerUrl);
        } catch (error) {
          console.warn(`Proxy fetch failed for ${track.name}, using mock data`);
          // Use mock data for this track
          const mockTrack = {
            ...track,
            title: track.name,
            name: track.name,
            artist: track.artist || { name: "Unknown Artist" },
            artists: [{ name: track.artist?.name || "Unknown Artist" }],
            album: {
              title: "Unknown Album",
              name: "Unknown Album",
              cover_big:
                "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop",
              cover_small:
                "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
            },
            preview_url: null,
            preview: null,
            duration: track.duration || 180,
            reason: track.reason || "Recommended based on your preferences",
          };
          enrichedTracks.push(mockTrack);
          continue;
        }

        if (data.data?.[0]) {
          const deezerTrack = data.data[0];
          enrichedTracks.push({
            ...track,
            ...deezerTrack,
            title: deezerTrack.title,
            name: deezerTrack.title,
            artist: { name: deezerTrack.artist.name },
            artists: [{ name: deezerTrack.artist.name }],
            album: {
              title: deezerTrack.album?.title || "Unknown Album",
              name: deezerTrack.album?.title || "Unknown Album",
              cover_big:
                deezerTrack.album?.cover_big ||
                deezerTrack.artist?.picture_big ||
                "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop",
              cover_small:
                deezerTrack.album?.cover_small ||
                deezerTrack.artist?.picture_medium ||
                "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
            },
            preview_url: deezerTrack.preview,
            preview: deezerTrack.preview,
            duration: deezerTrack.duration,
            reason: track.reason || "Recommended based on your preferences",
          });
        } else {
          // No Deezer result, create basic track
          enrichedTracks.push({
            ...track,
            title: track.name,
            preview_url: null,
            preview: null,
            album: {
              title: "Unknown Album",
              name: "Unknown Album",
              cover_big:
                "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop",
              cover_small:
                "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
            },
          });
        }
      } catch (error) {
        console.warn(`Could not enrich track ${track.name}:`, error);
        // Create a minimal track
        enrichedTracks.push({
          ...track,
          title: track.name,
          preview_url: null,
          preview: null,
          album: {
            title: "Unknown Album",
            name: "Unknown Album",
            cover_big:
              "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop",
            cover_small:
              "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
          },
        });
      }
    }

    return enrichedTracks;
  };

  const handleBackToStart = () => {
    setFlowState("onboarding");
    setGeneratedDeck([]);
    setLikedTracks([]);
    setShowResults(false);
    setLoadingProgress(0);
    setLoadingMessage("");
  };

  const handleSaveTrack = (track) => {
    setLikedTracks((prev) => {
      if (prev.length >= 10) return prev;
      return [...prev, track];
    });
  };

  const handleViewResults = () => {
    setShowResults(true);
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <ParticleCanvas isActive={flowState !== "swiping"} />

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 p-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Music className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">music.me</h1>
              <p className="text-xs text-gray-400">Discover music</p>
            </div>
          </div>

          {(flowState === "swiping" || showResults) && (
            <button
              onClick={handleBackToStart}
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              New Discovery
            </button>
          )}
        </div>
      </motion.header>

      <main className="relative z-10 pt-24 px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {flowState === "logo" && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <LogoMorph onComplete={handleLogoComplete} />
              </div>
            )}

            {flowState === "onboarding" && (
              <OnboardingFlow onComplete={handleOnboardingComplete} />
            )}

            {flowState === "generating" && (
              <GenerationSequence
                progress={loadingProgress}
                preferences={userPreferences}
                message={loadingMessage}
              />
            )}

            {flowState === "swiping" && !showResults && (
              <SwipeInterface
                deck={generatedDeck}
                onBack={handleBackToStart}
                onSave={handleSaveTrack}
                onViewResults={handleViewResults}
                likedTracks={likedTracks}
              />
            )}

            {showResults && (
              <BentoResults
                likedTracks={likedTracks}
                onStartNew={handleBackToStart}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
