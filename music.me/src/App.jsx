import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleCanvas from "./components/ParticleCanvas";
import LogoMorph from "./components/LogoMorph";
import OnboardingFlow from "./components/Onboarding/OnboardingFlow";
import GenerationSequence from "./components/GenerationSequence";
import SwipeInterface from "./components/SwipeInterface";
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleLogoComplete = () => {
    setTimeout(() => setFlowState("onboarding"), 800);
  };

  const handleOnboardingComplete = async (preferences) => {
    setUserPreferences(preferences);
    setFlowState("generating");
    await generateDeckWithLastfm(preferences);
  };

  const generateDeckWithLastfm = async (preferences) => {
    const updateProgress = (progress, message) => {
      setLoadingProgress(progress);
      setLoadingMessage(message);
    };

    try {
      updateProgress(10, "Analyzing your music taste...");

      // Get recommendations from Last.fm
      const lastfmTracks = await getCombinedRecommendations(preferences);

      updateProgress(60, "Finding track previews...");

      // Convert Last.fm tracks to Deezer tracks for previews
      const tracksWithPreviews = await enrichTracksWithDeezer(lastfmTracks);

      // Set the generated deck here!
      setGeneratedDeck(tracksWithPreviews);

      if (!tracksWithPreviews.length) {
        throw new Error("NO_RESULTS");
      }

      updateProgress(90, "Finalizing your discovery deck...");
      updateProgress(100, "Ready to discover!");

      setTimeout(() => {
        setFlowState("swiping");
        setLoadingProgress(0);
        setLoadingMessage("");
      }, 1000);
    } catch (error) {
      console.error("Deck generation failed:", error);

      setLoadingMessage(
        error.message === "NO_RESULTS"
          ? "We couldn’t find playable previews for your taste."
          : "Music services are currently unavailable.",
      );

      // Set empty deck on error
      setGeneratedDeck([]);

      setTimeout(() => {
        setFlowState("swiping");
        setLoadingProgress(0);
      }, 1200);
    }
  };
  // Search Deezer for tracks to get preview URLs
  const enrichTracksWithDeezer = async (lastfmTracks) => {
    const enrichedTracks = [];

    for (const track of lastfmTracks.slice(0, 30)) {
      try {
        // Handle different track structures
        const trackName = track.name || track.title;
        const artistName =
          track.artist?.name || track.artists?.[0]?.name || "Unknown Artist";

        const searchQuery = `${trackName} ${artistName}`;

        // Updated CORS proxy URL format
        const proxyUrl = "https://corsproxy.io/?";
        const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(searchQuery)}&limit=1`;

        const response = await fetch(
          `${proxyUrl}${encodeURIComponent(deezerUrl)}`,
        );

        if (!response.ok) {
          throw new Error(`Deezer API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.data?.[0] && data.data[0].preview) {
          const deezerTrack = data.data[0];
          enrichedTracks.push({
            ...deezerTrack,
            title: deezerTrack.title,
            name: deezerTrack.title, // For compatibility
            artist: { name: deezerTrack.artist.name },
            artists: [{ name: deezerTrack.artist.name }],
            album: {
              title: deezerTrack.album?.title || "Unknown Album",
              name: deezerTrack.album?.title || "Unknown Album",
              cover_big:
                deezerTrack.album?.cover_big ||
                deezerTrack.artist?.picture_big ||
                "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop",
            },
            preview_url: deezerTrack.preview,
            preview: deezerTrack.preview,
            duration: deezerTrack.duration,
            lastfm_reason:
              track.reason || "Recommended based on your preferences",
          });

          // Add small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(
          `Error enriching track ${track.name || track.title}:`,
          error,
        );
      }
    }

    return enrichedTracks;
  };

  const handleBackToStart = () => {
    setFlowState("onboarding");
    setGeneratedDeck([]);
    setLoadingProgress(0);
    setLoadingMessage("");
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
              <h1 className="text-xl font-bold text-white">SoundSwipe</h1>
              <p className="text-xs text-gray-400">Discover music</p>
            </div>
          </div>

          {flowState === "swiping" && (
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
        <div className="max-w-2xl mx-auto">
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

            {flowState === "swiping" && (
              <SwipeInterface deck={generatedDeck} onBack={handleBackToStart} />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
