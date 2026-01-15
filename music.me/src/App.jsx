import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleCanvas from "./components/ParticleCanvas";
import LogoMorph from "./components/LogoMorph";
import OnboardingFlow from "./components/Onboarding/OnboardingFlow";
import GenerationSequence from "./components/GenerationSequence";
import SwipeInterface from "./components/SwipeInterface";
import ResultsView from "./components/ResultsView"; // We'll create this
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
  const [likedTracks, setLikedTracks] = useState([]); // Moved to App level
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showResults, setShowResults] = useState(false); // New state for results

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
      const lastfmTracks = await getCombinedRecommendations(preferences);
      updateProgress(60, "Finding track previews...");
      const tracksWithPreviews = await enrichTracksWithDeezer(lastfmTracks);

      // Set the generated deck
      setGeneratedDeck(tracksWithPreviews);

      // Reset liked tracks when generating new deck
      setLikedTracks([]);

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
          ? "We couldn't find playable previews for your taste."
          : "Music services are currently unavailable.",
      );

      setGeneratedDeck([]);
      setLikedTracks([]);

      setTimeout(() => {
        setFlowState("swiping");
        setLoadingProgress(0);
      }, 1200);
    }
  };

  // Update the enrichTracksWithDeezer function in App.js
  const enrichTracksWithDeezer = async (lastfmTracks) => {
    const enrichedTracks = [];
    const tracksToProcess = lastfmTracks.slice(0, 40); // Process more tracks

    for (const track of tracksToProcess) {
      try {
        const searchQuery = `${track.name} ${track.artist.name}`;
        const proxyUrl = "https://corsproxy.io/?";
        const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(searchQuery)}&limit=3`; // Try multiple results

        const response = await fetch(proxyUrl + encodeURIComponent(deezerUrl));
        const data = await response.json();

        if (data.data && data.data.length > 0) {
          // Try to find best match
          const bestMatch =
            data.data.find(
              (d) =>
                d.artist.name
                  .toLowerCase()
                  .includes(track.artist.name.toLowerCase()) ||
                track.artist.name
                  .toLowerCase()
                  .includes(d.artist.name.toLowerCase()),
            ) || data.data[0];

          if (bestMatch.preview) {
            enrichedTracks.push({
              ...track, // Keep original track data including score, genres, moods
              ...bestMatch,
              title: bestMatch.title || track.name,
              name: bestMatch.title || track.name,
              artist: { name: bestMatch.artist.name },
              artists: [{ name: bestMatch.artist.name }],
              album: {
                title: bestMatch.album?.title || "Unknown Album",
                name: bestMatch.album?.title || "Unknown Album",
                cover_big:
                  bestMatch.album?.cover_big ||
                  bestMatch.artist?.picture_big ||
                  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop",
                cover_small:
                  bestMatch.album?.cover_small ||
                  bestMatch.artist?.picture_medium ||
                  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
              },
              preview_url: bestMatch.preview,
              preview: bestMatch.preview,
              duration: bestMatch.duration,
              reason:
                track.reason ||
                (track.source === "genre"
                  ? `Recommended ${track.sourceGenre} genre`
                  : track.source === "mood"
                    ? `Matches your ${track.sourceMood} mood`
                    : "Recommended for you"),
            });
          } else {
            // Keep track even without preview but with lower priority
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
              },
            });
          }
        } else {
          // Fallback: keep the Last.fm track without preview
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
            },
          });
        }
      } catch (error) {
        console.error(`Error enriching track ${track.name}:`, error);
        // Still include the track as fallback
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
          },
        });
      }
    }

    // Prioritize tracks with previews
    const withPreviews = enrichedTracks.filter((t) => t.preview).slice(0, 25);
    const withoutPreviews = enrichedTracks
      .filter((t) => !t.preview)
      .slice(0, 5);

    return [...withPreviews, ...withoutPreviews].slice(0, 30); // Return final deck
  };

  const handleBackToStart = () => {
    setFlowState("onboarding");
    setGeneratedDeck([]);
    setLikedTracks([]);
    setShowResults(false);
    setLoadingProgress(0);
    setLoadingMessage("");
  };

  // Handle saving a track (passed to SwipeInterface)
  const handleSaveTrack = (track) => {
    setLikedTracks((prev) => [...prev, track]);
  };

  // Handle viewing results
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
              <h1 className="text-xl font-bold text-white">SoundSwipe</h1>
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

            {flowState === "swiping" && !showResults && (
              <SwipeInterface
                deck={generatedDeck}
                onBack={handleBackToStart}
                onSave={handleSaveTrack} // Pass save handler
                onViewResults={handleViewResults} // Pass results handler
                savedCount={likedTracks.length}
                likedTracks={likedTracks} // Pass liked tracks down
              />
            )}

            {showResults && (
              <ResultsView
                likedTracks={likedTracks}
                onBack={() => setShowResults(false)}
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
