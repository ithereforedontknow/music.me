import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./hooks/useTheme";
import { pageTransition } from "./utils/motion";

// Components
import TopBar from "./components/TopBar";
import LogoMorph from "./components/LogoMorph";
import SeedSelection from "./components/SeedSelection";
import GenerationSequence from "./components/GenerationSequence";
import SwipeInterface from "./components/SwipeInterface";
import BentoResults from "./components/BentoResults";
import ParticleCanvas from "./components/ParticleCanvas";
import ThemePicker from "./components/ThemePicker";

// Services
import { getRecommendationsFromSeeds } from "./services/seedRecommendationService";

const App = () => {
  const [flowState, setFlowState] = useState("logo");
  const [generatedDeck, setGeneratedDeck] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [currentSeeds, setCurrentSeeds] = useState([]);

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
    setTimeout(() => setFlowState("seeds"), 800);
  };

  const handleSeedsSelected = async (seeds) => {
    setCurrentSeeds(seeds);
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

    // Build descriptive message
    const seedNames = seeds.map((s) => s.name).join(", ");
    const seedTypes = [...new Set(seeds.map((s) => s.type))];
    const typeText = seedTypes.length === 1 ? seedTypes[0] : "your selections";

    setLoadingMessage(`Finding music similar to ${seedNames}...`);

    try {
      setLoadingMessage(`Analyzing ${typeText}...`);

      // Get recommendations using Last.fm's collaborative filtering
      const recommendations = await getRecommendationsFromSeeds(seeds);

      setLoadingMessage(`Found ${recommendations.length} perfect matches!`);

      if (recommendations.length === 0) {
        console.warn("No recommendations found");
        alert(
          "No recommendations found for these seeds. Please try different selections.",
        );
        setFlowState("seeds");
        clearInterval(progressInterval);
        setLoadingProgress(0);
        return;
      }

      setGeneratedDeck(recommendations);
      setLikedTracks([]);

      setTimeout(() => {
        setFlowState("swiping");
        setLoadingProgress(0);
        setLoadingMessage("");
        clearInterval(progressInterval);
      }, 800);
    } catch (error) {
      console.error("Recommendation error:", error);
      alert("Failed to get recommendations. Please try again.");
      setFlowState("seeds");
      clearInterval(progressInterval);
      setLoadingProgress(0);
    }
  };

  const handleBackToStart = () => {
    setFlowState("seeds");
    setGeneratedDeck([]);
    setShowResults(false);
    setCurrentSeeds([]);
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
    setFlowState("seeds");
    setGeneratedDeck([]);
    setShowResults(false);
    setCurrentSeeds([]);
  };

  const handleClearLikedTracks = () => {
    setLikedTracks([]);
    localStorage.removeItem("musicme-liked-tracks");
  };

  return (
    <div className="min-h-screen w-full bg-primary text-primary font-sans overflow-hidden">
      <TopBar
        flowState={flowState}
        likedTracks={likedTracks}
        onHomeClick={handleBackToStart}
        onViewResults={handleViewResults}
        onShowFilters={null} // No filters in seed-based system
        activeFilterCount={0}
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

            {flowState === "seeds" && (
              <motion.div
                key="seeds"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="py-8"
              >
                <SeedSelection onSeedsSelected={handleSeedsSelected} />
              </motion.div>
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
                  preferences={currentSeeds}
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
