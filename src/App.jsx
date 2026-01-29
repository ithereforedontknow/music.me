import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./hooks/useTheme";
import { pageTransition } from "./utils/motion";

import TopBar from "./components/TopBar";
import LogoMorph from "./components/LogoMorph";
import PromptInput from "./components/PromptInput";
import GenerationSequence from "./components/GenerationSequence";
import SwipeInterface from "./components/SwipeInterface";
import BentoResults from "./components/BentoResults";
import ParticleCanvas from "./components/ParticleCanvas";
import ThemePicker from "./components/ThemePicker";
import FiltersModal from "./components/FiltersModal";

// Services
import {
  getTextBasedRecommendations,
  getMoodBasedRecommendations,
  getGenreBasedRecommendations,
  getMockRecommendations,
} from "./services/recommendationService";

const App = () => {
  const [flowState, setFlowState] = useState("logo");
  const [generatedDeck, setGeneratedDeck] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState({
    moods: [],
    genres: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  const theme = useTheme();

  // Load saved liked tracks
  useEffect(() => {
    const savedLikedTracks = localStorage.getItem("musicme-liked-tracks");
    if (savedLikedTracks) {
      try {
        setLikedTracks(JSON.parse(savedLikedTracks));
      } catch (e) {
        console.error("Failed to parse saved tracks:", e);
      }
    }
  }, []);

  // Save liked tracks
  useEffect(() => {
    if (likedTracks.length > 0) {
      localStorage.setItem("musicme-liked-tracks", JSON.stringify(likedTracks));
    } else {
      localStorage.removeItem("musicme-liked-tracks");
    }
  }, [likedTracks]);

  const handleLogoComplete = () => {
    setTimeout(() => setFlowState("prompt"), 800);
  };

  const handleSearch = async (promptText) => {
    setFlowState("generating");

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    setLoadingMessage("Searching Last.fm for music...");

    try {
      let allRecommendations = [];

      // Get text-based recommendations
      if (promptText && promptText.trim()) {
        setLoadingMessage("Analyzing your search query...");
        const textRecs = await getTextBasedRecommendations(promptText);
        allRecommendations = [...allRecommendations, ...textRecs];
      }

      // Add mood-based recommendations
      if (filters.moods.length > 0) {
        setLoadingMessage("Finding tracks matching your mood...");
        const moodRecs = await getMoodBasedRecommendations(filters.moods);
        allRecommendations = [...allRecommendations, ...moodRecs];
      }

      // Add genre-based recommendations
      if (filters.genres.length > 0) {
        setLoadingMessage("Discovering tracks from your genres...");
        const genreRecs = await getGenreBasedRecommendations(filters.genres);
        allRecommendations = [...allRecommendations, ...genreRecs];
      }

      // Remove duplicates
      const uniqueTracks = allRecommendations.filter(
        (track, index, self) =>
          index === self.findIndex((t) => t.id === track.id),
      );

      // If no recommendations, use mock data
      if (uniqueTracks.length === 0) {
        console.warn("No recommendations found, using mock data");
        const mockRecs = getMockRecommendations(promptText || "music");
        setGeneratedDeck(mockRecs);
      } else {
        setGeneratedDeck(uniqueTracks.slice(0, 20));
      }

      setLikedTracks([]);
      setLoadingMessage("Ready to discover music!");

      setTimeout(() => {
        setFlowState("swiping");
        setLoadingProgress(0);
        setLoadingMessage("");
        clearInterval(progressInterval);
      }, 800);
    } catch (error) {
      console.error("Recommendation error:", error);

      // Fallback to mock data
      const mockRecs = getMockRecommendations(promptText || "music");
      setGeneratedDeck(mockRecs);
      setLikedTracks([]);

      setTimeout(() => {
        setFlowState("swiping");
        setLoadingProgress(0);
        setLoadingMessage("");
        clearInterval(progressInterval);
      }, 800);
    }
  };

  const handleFiltersUpdate = (newFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const handleBackToStart = () => {
    setFlowState("prompt");
    setGeneratedDeck([]);
    setShowResults(false);
    setShowFilters(false);
  };

  const handleSaveTrack = (track) => {
    setLikedTracks((prev) => {
      const trackExists = prev.some(
        (t) =>
          t.id === track.id ||
          (t.name === track.name && t.artist?.name === track.artist?.name),
      );

      if (trackExists) return prev;

      const newTrack = {
        ...track,
        savedAt: new Date().toISOString(),
      };

      return [...prev, newTrack];
    });
  };

  const handleViewResults = () => {
    setShowResults(true);
  };

  const handleStartNew = () => {
    setFlowState("prompt");
    setGeneratedDeck([]);
    setShowResults(false);
    setShowFilters(false);
  };

  const handleClearLikedTracks = () => {
    setLikedTracks([]);
    localStorage.removeItem("musicme-liked-tracks");
  };

  const activeFilterCount = filters.moods.length + filters.genres.length;

  return (
    <div className="min-h-screen w-full bg-primary text-primary font-sans overflow-hidden">
      <TopBar
        flowState={flowState}
        likedTracks={likedTracks}
        onHomeClick={handleBackToStart}
        onViewResults={handleViewResults}
        onShowFilters={() => setShowFilters(true)}
        activeFilterCount={activeFilterCount}
        theme={theme}
      />

      <ThemePicker
        isOpen={theme.showThemePicker}
        onClose={theme.toggleThemePicker}
        themes={theme.themes}
        currentTheme={theme.currentTheme}
        onThemeSelect={theme.setTheme}
      />

      <main className="relative z-10 pt-28 px-4 pb-8 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {flowState === "logo" && (
              <motion.div key="logo" className="h-[70vh]" {...pageTransition}>
                <LogoMorph onComplete={handleLogoComplete} />
              </motion.div>
            )}

            {flowState === "prompt" && !showFilters && (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="py-8"
              >
                <PromptInput
                  onSearch={handleSearch}
                  onShowFilters={() => setShowFilters(true)}
                  filters={filters}
                />
              </motion.div>
            )}

            {showFilters && (
              <FiltersModal
                filters={filters}
                onUpdate={handleFiltersUpdate}
                onClose={() => setShowFilters(false)}
              />
            )}

            {flowState === "generating" && (
              <motion.div
                key="generating"
                className="h-[70vh] flex items-center justify-center"
                {...pageTransition}
              >
                <GenerationSequence
                  progress={loadingProgress}
                  message={loadingMessage}
                />
              </motion.div>
            )}

            {flowState === "swiping" && !showResults && (
              <motion.div
                key="swiping"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                <SwipeInterface
                  deck={generatedDeck}
                  onBack={handleBackToStart}
                  onSave={handleSaveTrack}
                  onViewResults={handleViewResults}
                  likedTracks={likedTracks}
                />
              </motion.div>
            )}

            {showResults && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                <BentoResults
                  likedTracks={likedTracks}
                  onStartNew={handleStartNew}
                  onClearTracks={handleClearLikedTracks}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <ParticleCanvas isActive={flowState !== "swiping" && !showResults} />
    </div>
  );
};

export default App;
